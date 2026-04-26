"use client"

import { InvoiceThemeProps } from "./types"
import { amountToWords } from "@/lib/gst"

export function ModernTheme({
  invoiceData,
  items,
  subtotal,
  gstTotal,
  total,
  currencySymbol,
  taxType,
}: InvoiceThemeProps) {
  const isCgstSgst = taxType === "cgst_sgst"
  const accent = "#6366f1"

  return (
    <div
      style={{
        background: "#ffffff",
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        color: "#1e293b",
        width: "100%",
        boxSizing: "border-box",
        fontSize: "13px",
        lineHeight: "1.5",
      }}
    >
      {/* Navy Header */}
      <div
        style={{
          background: "#0f172a",
          color: "#ffffff",
          padding: "32px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {invoiceData.businessLogo && (
            <img
              src={invoiceData.businessLogo}
              alt="Logo"
              style={{ width: "56px", height: "56px", objectFit: "contain", borderRadius: "8px" }}
            />
          )}
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 800,
              margin: 0,
              letterSpacing: "4px",
              textTransform: "uppercase",
            }}
          >
            INVOICE
          </h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "16px" }}>{invoiceData.businessName}</p>
          <p style={{ margin: 0, fontSize: "11px", opacity: 0.8 }}>GSTIN: {invoiceData.businessGstin}</p>
          <p style={{ margin: 0, fontSize: "11px", opacity: 0.8 }}>{invoiceData.businessAddress}</p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "32px 40px" }}>
        {/* Invoice Details Pills */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <div
            style={{
              background: "#f1f5f9",
              borderRadius: "20px",
              padding: "6px 16px",
              fontSize: "12px",
              display: "inline-flex",
              gap: "6px",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#64748b" }}>Invoice #</span>
            <span style={{ fontWeight: 700 }}>{invoiceData.invoiceNumber}</span>
          </div>
          <div
            style={{
              background: "#f1f5f9",
              borderRadius: "20px",
              padding: "6px 16px",
              fontSize: "12px",
              display: "inline-flex",
              gap: "6px",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#64748b" }}>Date</span>
            <span style={{ fontWeight: 700 }}>{invoiceData.invoiceDate}</span>
          </div>
          {invoiceData.dueDate && (
            <div
              style={{
                background: "#f1f5f9",
                borderRadius: "20px",
                padding: "6px 16px",
                fontSize: "12px",
                display: "inline-flex",
                gap: "6px",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#64748b" }}>Due Date</span>
              <span style={{ fontWeight: 700 }}>{invoiceData.dueDate}</span>
            </div>
          )}
        </div>

        {/* Client Info Card */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "8px",
            padding: "20px 24px",
            marginBottom: "28px",
            borderLeft: `4px solid ${accent}`,
          }}
        >
          <p style={{ margin: "0 0 4px 0", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#94a3b8", fontWeight: 600 }}>
            Bill To
          </p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "15px" }}>{invoiceData.clientName}</p>
          <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>{invoiceData.clientAddress}</p>
          {invoiceData.clientGstin && (
            <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>GSTIN: {invoiceData.clientGstin}</p>
          )}
          {invoiceData.clientState && (
            <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>State: {invoiceData.clientState}</p>
          )}
        </div>

        {/* Line Items Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "24px",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr>
              <th style={{ padding: "10px 8px", textAlign: "left", background: accent, color: "#ffffff", fontWeight: 600, fontSize: "11px" }}>
                Description
              </th>
              <th style={{ padding: "10px 8px", textAlign: "left", background: accent, color: "#ffffff", fontWeight: 600, fontSize: "11px" }}>
                HSN/SAC
              </th>
              <th style={{ padding: "10px 8px", textAlign: "right", background: accent, color: "#ffffff", fontWeight: 600, fontSize: "11px" }}>
                Qty
              </th>
              <th style={{ padding: "10px 8px", textAlign: "right", background: accent, color: "#ffffff", fontWeight: 600, fontSize: "11px" }}>
                Rate
              </th>
              <th style={{ padding: "10px 8px", textAlign: "right", background: accent, color: "#ffffff", fontWeight: 600, fontSize: "11px" }}>
                Taxable
              </th>
              <th style={{ padding: "10px 8px", textAlign: "right", background: accent, color: "#ffffff", fontWeight: 600, fontSize: "11px" }}>
                Tax%
              </th>
              <th style={{ padding: "10px 8px", textAlign: "right", background: accent, color: "#ffffff", fontWeight: 600, fontSize: "11px" }}>
                Tax Amt
              </th>
              <th style={{ padding: "10px 8px", textAlign: "right", background: accent, color: "#ffffff", fontWeight: 600, fontSize: "11px" }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px 8px" }}>{item.description}</td>
                <td style={{ padding: "10px 8px", color: "#64748b" }}>{item.hsn_sac_code || "-"}</td>
                <td style={{ padding: "10px 8px", textAlign: "right" }}>{item.quantity}</td>
                <td style={{ padding: "10px 8px", textAlign: "right" }}>
                  {currencySymbol}{item.rate.toFixed(2)}
                </td>
                <td style={{ padding: "10px 8px", textAlign: "right" }}>
                  {currencySymbol}{item.amount.toFixed(2)}
                </td>
                <td style={{ padding: "10px 8px", textAlign: "right" }}>{item.gstRate}%</td>
                <td style={{ padding: "10px 8px", textAlign: "right" }}>
                  {currencySymbol}{item.gstAmount.toFixed(2)}
                </td>
                <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600 }}>
                  {currencySymbol}{item.totalAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
          <div style={{ width: "320px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ color: "#64748b" }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            {isCgstSgst ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#64748b" }}>CGST</span>
                  <span>{currencySymbol}{(gstTotal / 2).toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#64748b" }}>SGST</span>
                  <span>{currencySymbol}{(gstTotal / 2).toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ color: "#64748b" }}>IGST</span>
                <span>{currencySymbol}{gstTotal.toFixed(2)}</span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px",
                background: "#0f172a",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "16px",
                borderRadius: "6px",
                marginTop: "4px",
              }}
            >
              <span>Total</span>
              <span>{currencySymbol}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Amount in Words */}
        <div style={{ marginBottom: "24px" }}>
          <p style={{ margin: 0, fontSize: "12px", fontStyle: "italic", color: "#64748b" }}>
            <span style={{ fontWeight: 600, fontStyle: "normal" }}>Amount in Words:</span>{" "}
            {amountToWords(total)}
          </p>
        </div>

        {/* Notes / Terms */}
        {invoiceData.notes && (
          <div style={{ marginBottom: "16px" }}>
            <p style={{ margin: "0 0 4px 0", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#94a3b8", fontWeight: 600 }}>
              Notes
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{invoiceData.notes}</p>
          </div>
        )}
        {invoiceData.terms && (
          <div style={{ marginBottom: "16px" }}>
            <p style={{ margin: "0 0 4px 0", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#94a3b8", fontWeight: 600 }}>
              Terms & Conditions
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{invoiceData.terms}</p>
          </div>
        )}

        {/* Signature */}
        <div style={{ marginTop: "40px", textAlign: "right" }}>
          <div style={{ display: "inline-block", width: "200px" }}>
            <div style={{ borderTop: `2px solid ${accent}`, paddingTop: "8px" }}>
              <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>
                For {invoiceData.businessName}
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
