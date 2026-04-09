/**
 * PostgreSQL query builder backed by @neondatabase/serverless (WebSocket Pool).
 * Provides a chainable query-builder API (select / insert / update / delete)
 * used by all server actions in this project.
 */
import { Pool } from "@neondatabase/serverless"

let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    if (!process.env.POSTGRES_URL) {
      throw new Error("POSTGRES_URL is not set in .env.local")
    }
    pool = new Pool({ connectionString: process.env.POSTGRES_URL })
  }
  return pool
}

type Condition =
  | { col: string; op: "=" | ">=" | "<" | "LIKE"; val: unknown }
  | { col: string; op: "IN"; val: unknown[] }

type OrderOpts = { ascending?: boolean }
type DbResult<T = any> = { data: T; error: { message: string } | null }

class QueryBuilder {
  private _table: string
  private _operation: "select" | "insert" | "update" | "delete" | null = null
  private _selectCols = "*"
  private _returnRows = false
  private _conditions: Condition[] = []
  private _orderCol?: string
  private _orderAsc = true
  private _limitN?: number
  private _isSingle = false
  private _insertRows?: Record<string, unknown>[]
  private _updateObj?: Record<string, unknown>

  constructor(table: string) {
    this._table = table
  }

  select(cols = "*") {
    if (this._operation === null) {
      this._operation = "select"
      this._selectCols = cols
    } else {
      // .select() after .insert()/.update() means RETURNING *
      this._returnRows = true
    }
    return this
  }

  insert(rows: Record<string, unknown>[]) {
    this._operation = "insert"
    this._insertRows = rows
    return this
  }

  update(obj: Record<string, unknown>) {
    this._operation = "update"
    this._updateObj = obj
    return this
  }

  delete() {
    this._operation = "delete"
    return this
  }

  eq(col: string, val: unknown) {
    this._conditions.push({ col, op: "=", val })
    return this
  }

  in(col: string, vals: unknown[]) {
    this._conditions.push({ col, op: "IN", val: vals })
    return this
  }

  gte(col: string, val: unknown) {
    this._conditions.push({ col, op: ">=", val })
    return this
  }

  lt(col: string, val: unknown) {
    this._conditions.push({ col, op: "<", val })
    return this
  }

  like(col: string, val: string) {
    this._conditions.push({ col, op: "LIKE", val })
    return this
  }

  order(col: string, opts?: OrderOpts) {
    this._orderCol = col
    this._orderAsc = opts?.ascending ?? true
    return this
  }

  limit(n: number) {
    this._limitN = n
    return this
  }

  single() {
    this._isSingle = true
    return this._execute()
  }

  // Makes `await builder` work without explicitly calling .execute()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  then(resolve: (v: DbResult<any>) => any, reject?: (e: unknown) => never) {
    return this._execute().then(resolve, reject)
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Parse select string with optional join notation.
   * e.g. "id, name, clients (id, name)" → mainCols + LEFT JOINs
   */
  private _parseSelect(raw: string) {
    const joins: Array<{ table: string; cols: string[]; fkCol: string }> = []
    const mainCols: string[] = []

    const parts: string[] = []
    let depth = 0
    let cur = ""
    for (const ch of raw) {
      if (ch === "(") depth++
      if (ch === ")") depth--
      if (ch === "," && depth === 0) {
        parts.push(cur.trim())
        cur = ""
      } else {
        cur += ch
      }
    }
    if (cur.trim()) parts.push(cur.trim())

    for (const part of parts) {
      const m = part.match(/^(\w+)\s*\(([^)]+)\)$/)
      if (m) {
        const t = m[1]
        const cols = m[2].split(",").map((s) => s.trim())
        // Infer FK col: "clients" → "client_id", "accounts" → "account_id"
        const fk = t.endsWith("s") ? `${t.slice(0, -1)}_id` : `${t}_id`
        joins.push({ table: t, cols, fkCol: fk })
      } else {
        mainCols.push(part.trim())
      }
    }
    return { mainCols, joins }
  }

  /** Build parameterised WHERE clause, pushing values into params array */
  private _buildWhere(params: unknown[]): string {
    if (!this._conditions.length) return ""
    const clauses = this._conditions.map((c) => {
      if (c.op === "IN") {
        const phs = (c.val as unknown[]).map((v) => {
          params.push(v)
          return `$${params.length}`
        })
        return `"${this._table}"."${c.col}" IN (${phs.join(", ")})`
      }
      params.push(c.val)
      return `"${this._table}"."${c.col}" ${c.op} $${params.length}`
    })
    return "WHERE " + clauses.join(" AND ")
  }

  private async _execute(): Promise<DbResult> {
    const params: unknown[] = []
    try {
      const db = getPool()

      // ── INSERT ─────────────────────────────────────────────────────────────
      if (this._operation === "insert") {
        const rows = this._insertRows!
        if (!rows.length) return { data: [], error: null }
        const cols = Object.keys(rows[0])
        const colList = cols.map((c) => `"${c}"`).join(", ")
        const valueRows = rows
          .map((row) => {
            const phs = cols.map((col) => {
              params.push(row[col] ?? null)
              return `$${params.length}`
            })
            return `(${phs.join(", ")})`
          })
          .join(", ")
        const returning = this._returnRows ? " RETURNING *" : ""
        const { rows: res } = await db.query(
          `INSERT INTO "${this._table}" (${colList}) VALUES ${valueRows}${returning}`,
          params
        )
        if (this._isSingle) return { data: res[0] ?? null, error: null }
        return { data: this._returnRows ? res : [], error: null }
      }

      // ── UPDATE ─────────────────────────────────────────────────────────────
      if (this._operation === "update") {
        const sets = Object.keys(this._updateObj!).map((col) => {
          params.push(this._updateObj![col] ?? null)
          return `"${col}" = $${params.length}`
        })
        const where = this._buildWhere(params)
        const returning = this._returnRows ? " RETURNING *" : ""
        const { rows: res } = await db.query(
          `UPDATE "${this._table}" SET ${sets.join(", ")} ${where}${returning}`,
          params
        )
        if (this._isSingle) return { data: res[0] ?? null, error: null }
        return { data: this._returnRows ? res : [], error: null }
      }

      // ── DELETE ─────────────────────────────────────────────────────────────
      if (this._operation === "delete") {
        const where = this._buildWhere(params)
        await db.query(`DELETE FROM "${this._table}" ${where}`, params)
        return { data: null, error: null }
      }

      // ── SELECT ─────────────────────────────────────────────────────────────
      const { mainCols, joins } = this._parseSelect(this._selectCols)
      const isWild =
        mainCols.length === 0 || (mainCols.length === 1 && mainCols[0] === "*")

      let selectList = isWild
        ? `"${this._table}".*`
        : mainCols
            .map((c) =>
              c === "*" ? `"${this._table}".*` : `"${this._table}"."${c}"`
            )
            .join(", ")

      let joinSql = ""
      const joinSelects: string[] = []
      for (const j of joins) {
        joinSql += ` LEFT JOIN "${j.table}" ON "${this._table}"."${j.fkCol}" = "${j.table}"."id"`
        for (const col of j.cols) {
          joinSelects.push(`"${j.table}"."${col}" AS "__j_${j.table}__${col}"`)
        }
      }
      if (joinSelects.length) selectList += ", " + joinSelects.join(", ")

      const where = this._buildWhere(params)
      let query = `SELECT ${selectList} FROM "${this._table}"${joinSql} ${where}`
      if (this._orderCol) {
        query += ` ORDER BY "${this._table}"."${this._orderCol}" ${
          this._orderAsc ? "ASC" : "DESC"
        }`
      }
      if (this._limitN) query += ` LIMIT ${this._limitN}`

      const { rows: res } = await db.query(query, params)

      // Re-hydrate joined columns into nested objects
      const rows = (res as Record<string, unknown>[]).map((row) => {
        const out: Record<string, unknown> = {}
        const nested: Record<string, Record<string, unknown>> = {}
        for (const [k, v] of Object.entries(row)) {
          const m = k.match(/^__j_(\w+)__(.+)$/)
          if (m) {
            if (!nested[m[1]]) nested[m[1]] = {}
            nested[m[1]][m[2]] = v
          } else {
            out[k] = v
          }
        }
        Object.assign(out, nested)
        return out
      })

      if (this._isSingle) return { data: rows[0] ?? null, error: null }
      return { data: rows, error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[db] ${this._operation ?? "select"} "${this._table}":`, msg)
      return { data: null, error: { message: msg } }
    }
  }
}

/** Create a Neon-backed query builder client. */
export function createDbClient() {
  return {
    from: (table: string) => new QueryBuilder(table),
  }
}
