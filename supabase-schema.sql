-- ═══════════════════════════════════════════════════════════════════
-- FreeInvoiceIndia — Supabase Schema
-- Run this in your Supabase dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════

-- 1. Business Profile (replaces Supabase Auth)
DROP TABLE IF EXISTS business_profile CASCADE;

CREATE TABLE business_profile (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gstin           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  business_name   TEXT NOT NULL,
  owner_name      TEXT,
  email           TEXT,
  phone           TEXT,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  state_code      TEXT,
  pincode         TEXT,
  logo_url        TEXT,
  selected_theme  TEXT DEFAULT 'classic',
  onboarding_complete BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 2. Clients
CREATE TABLE IF NOT EXISTS clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES business_profile(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  address     TEXT,
  city        TEXT,
  state       TEXT,
  state_code  TEXT,
  gstin       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Products / Services
CREATE TABLE IF NOT EXISTS products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES business_profile(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  price         NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit          TEXT DEFAULT 'nos',
  hsn_sac_code  TEXT,
  gst_rate      NUMERIC(5,2) DEFAULT 18,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 4. Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES business_profile(id) ON DELETE CASCADE,
  invoice_number          TEXT NOT NULL,
  client_id               UUID REFERENCES clients(id),
  client_name             TEXT,
  client_gstin            TEXT,
  client_address          TEXT,
  client_state            TEXT,
  client_state_code       TEXT,
  issue_date              DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date                DATE,
  status                  TEXT DEFAULT 'draft',  -- draft | sent | paid | overdue | cancelled
  currency                TEXT DEFAULT 'INR',
  subtotal                NUMERIC(12,2) DEFAULT 0,
  gst_total               NUMERIC(12,2) DEFAULT 0,
  total                   NUMERIC(12,2) DEFAULT 0,
  tax_type                TEXT DEFAULT 'cgst_sgst',  -- cgst_sgst | igst
  gst_type                TEXT DEFAULT 'CGST & SGST', -- CGST & SGST | IGST
  apply_gst               BOOLEAN DEFAULT true,
  notes                   TEXT,
  terms                   TEXT,
  theme                   TEXT DEFAULT 'classic',
  place_of_supply         TEXT,
  is_export               BOOLEAN DEFAULT false,
  export_type             TEXT,
  port_code               TEXT,
  shipping_bill_number    TEXT,
  shipping_bill_date      DATE,
  country_of_destination  TEXT,
  share_id                TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoices_share_id_idx ON invoices(share_id);
CREATE INDEX IF NOT EXISTS invoices_user_id_idx  ON invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_issue_date_idx ON invoices(issue_date);

-- 5. Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id    UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id),
  description   TEXT NOT NULL,
  quantity      NUMERIC(10,3) DEFAULT 1,
  unit          TEXT DEFAULT 'nos',
  rate          NUMERIC(12,2) NOT NULL,
  amount        NUMERIC(12,2) NOT NULL,
  gst_rate      NUMERIC(5,2) DEFAULT 18,
  gst_amount    NUMERIC(12,2) DEFAULT 0,
  total_amount  NUMERIC(12,2) DEFAULT 0,
  hsn_sac_code  TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 6. Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES business_profile(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  description     TEXT NOT NULL,
  amount          NUMERIC(12,2) NOT NULL,
  type            TEXT NOT NULL,  -- credit | debit
  category        TEXT DEFAULT 'Uncategorized',
  account_id      UUID,
  reference       TEXT,
  is_categorized  BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 7. Chart of Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES business_profile(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL,  -- asset | liability | equity | income | expense
  category      TEXT,
  code          TEXT,
  description   TEXT,
  balance       NUMERIC(12,2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 8. Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES business_profile(id) ON DELETE CASCADE,
  entry_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  narration     TEXT NOT NULL,
  total_amount  NUMERIC(12,2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS journal_entry_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id  UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id        UUID REFERENCES accounts(id),
  account_name      TEXT NOT NULL,
  debit             NUMERIC(12,2) DEFAULT 0,
  credit            NUMERIC(12,2) DEFAULT 0
);

-- 9. GST Summary View (for reports dashboard)
CREATE OR REPLACE VIEW gst_summary AS
SELECT
  i.user_id,
  EXTRACT(YEAR  FROM i.issue_date)::INT AS year,
  EXTRACT(MONTH FROM i.issue_date)::INT AS month,
  SUM(CASE WHEN i.gst_type = 'CGST & SGST' THEN i.gst_total / 2 ELSE 0 END) AS cgst_collected,
  SUM(CASE WHEN i.gst_type = 'CGST & SGST' THEN i.gst_total / 2 ELSE 0 END) AS sgst_collected,
  SUM(CASE WHEN i.gst_type = 'IGST'         THEN i.gst_total      ELSE 0 END) AS igst_collected
FROM invoices i
WHERE i.status IN ('sent', 'paid')
  AND i.apply_gst = true
GROUP BY i.user_id, year, month;

-- ═══════════════════════════════════════════════════════════════════
-- Row Level Security (RLS) — disable for now (use user_id filtering in app)
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE business_profile DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients          DISABLE ROW LEVEL SECURITY;
ALTER TABLE products         DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices         DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items    DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions     DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts         DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries  DISABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_items DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- Storage bucket for business logos
-- (create manually in Supabase Dashboard → Storage → New Bucket)
-- Name: business-assets   |   Public: true
-- ═══════════════════════════════════════════════════════════════════
