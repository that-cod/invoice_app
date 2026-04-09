"use client"

import { InvoiceThemeProps } from "./types"
import { amountToWords } from "@/lib/gst"

export function ClassicTheme({
  invoiceData,
  items,
  subtotal,
  gstTotal,
  total,
  currencySymbol,
  taxType,
}: InvoiceThemeProps) {
  const isCgstSgst = taxType === "cgst_sgst"

  return (
    <div
      style={{
        background: "#ffffff",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        color: "#1f2937",
        padding: "40px",
        maxWidth: "800px",
        margin: "0 auto",
        fontSize: "13px",
        lineHeight: "1.5",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          {invoiceData.businessLogo && (
            <img
              src={invoiceData.businessLogo}
              alt="Logo"
              style={{ width: "60px", height: "60px", objectFit: "contain" }}
            />
          )}
          <div>
            <h2
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "20px",
                fontWeight: 700,
                margin: "0 0 4px 0",
              }}
            >
              {invoiceData.businessName}
            </h2>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "12px" }}>
              {invoiceData.businessAddress}
            </p>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "12px" }}>
              GSTIN: {invoiceData.businessGstin}
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <h1
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "28px",
              fontWeight: 400,
              color: "#374151",
              margin: "0 0 8px 0",
              letterSpacing: "2px",
            }}
          >
            TAX INVOICE
          </h1>
          <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
            Invoice #: <span style={{ color: "#1f2937", fontWeight: 600 }}>{invoiceData.invoiceNumber}</span>
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
            Date: {invoiceData.invoiceDate}
          </p>
          {invoiceData.dueDate && (
            <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
              Due Date: {invoiceData.dueDate}
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "24px" }} />

      {/* Seller / Buyer */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "28px" }}>
        <div>
          <p
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "#9ca3af",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Seller
          </p>
          <p style={{ margin: 0, fontWeight: 600 }}>{invoiceData.businessName}</p>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "12px" }}>{invoiceData.businessAddress}</p>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "12px" }}>GSTIN: {invoiceData.businessGstin}</p>
          {invoiceData.businessState && (
            <p style={{ margin: 0, color: "#6b7280", fontSize: "12px" }}>State: {invoiceData.businessState}</p>
          )}
        </div>
        <div>
          <p
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "#9ca3af",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Buyer
          </p>
          <p style={{ margin: 0, fontWeight: 600 }}>{invoiceData.clientName}</p>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "12px" }}>{invoiceData.clientAddress}</p>
          {invoiceData.clientGstin && (
            <p style={{ margin: 0, color: "#6b7280", fontSize: "12px" }}>GSTIN: {invoiceData.clientGstin}</p>
          )}
          {invoiceData.clientState && (
            <p style={{ margin: 0, color: "#6b7280", fontSize: "12px" }}>State: {invoiceData.clientState}</p>
          )}
        </div>
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
          <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
            <th style={{ padding: "8px 6px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>
              Description
            </th>
            <th style={{ padding: "8px 6px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>
              HSN/SAC
            </th>
            <th style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>
              Qty
            </th>
            <th style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>
              Rate
            </th>
            <th style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>
              Taxable Value
            </th>
            <th style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>
              Tax%
            </th>
            <th style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>
              Tax Amt
            </th>
            <th style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "8px 6px", border: "1px solid #e5e7eb" }}>{item.description}</td>
              <td style={{ padding: "8px 6px", border: "1px solid #e5e7eb" }}>{item.hsn_sac_code || "-"}</td>
              <td style={{ padding: "8px 6px", textAlign: "right", border: "1px solid #e5e7eb" }}>{item.quantity}</td>
              <td style={{ padding: "8px 6px", textAlign: "right", border: "1px solid #e5e7eb" }}>
                {currencySymbol}{item.rate.toFixed(2)}
              </td>
              <td style={{ padding: "8px 6px", textAlign: "right", border: "1px solid #e5e7eb" }}>
                {currencySymbol}{item.amount.toFixed(2)}
              </td>
              <td style={{ padding: "8px 6px", textAlign: "right", border: "1px solid #e5e7eb" }}>
                {item.gstRate}%
              </td>
              <td style={{ padding: "8px 6px", textAlign: "right", border: "1px solid #e5e7eb" }}>
                {currencySymbol}{item.gstAmount.toFixed(2)}
              </td>
              <td style={{ padding: "8px 6px", textAlign: "right", border: "1px solid #e5e7eb" }}>
                {currencySymbol}{item.totalAmount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
        <div style={{ width: "300px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #e5e7eb" }}>
            <span style={{ color: "#6b7280" }}>Subtotal</span>
            <span>{currencySymbol}{subtotal.toFixed(2)}</span>
          </div>
          {isCgstSgst ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280" }}>CGST</span>
                <span>{currencySymbol}{(gstTotal / 2).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280" }}>SGST</span>
                <span>{currencySymbol}{(gstTotal / 2).toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #e5e7eb" }}>
              <span style={{ color: "#6b7280" }}>IGST</span>
              <span>{currencySymbol}{gstTotal.toFixed(2)}</span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              fontWeight: 700,
              fontSize: "15px",
              borderTop: "2px solid #1f2937",
              marginTop: "4px",
            }}
          >
            <span>Total</span>
            <span>{currencySymbol}{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Amount in words */}
      <div style={{ marginBottom: "24px", padding: "10px 0", borderTop: "1px solid #e5e7eb" }}>
        <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
          <span style={{ fontWeight: 600 }}>Amount in Words:</span>{" "}
          {amountToWords(total)}
        </p>
      </div>

      {/* Notes / Terms */}
      {invoiceData.notes && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#9ca3af", fontWeight: 600, marginBottom: "4px" }}>
            Notes
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>{invoiceData.notes}</p>
        </div>
      )}
      {invoiceData.terms && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#9ca3af", fontWeight: 600, marginBottom: "4px" }}>
            Terms & Conditions
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>{invoiceData.terms}</p>
        </div>
      )}

      {/* Declaration & Signature */}
      <div style={{ marginTop: "32px", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
        <p style={{ fontSize: "11px", color: "#6b7280", margin: "0 0 24px 0" }}>
          Certified that the particulars given above are true and correct.
        </p>
        <div style={{ textAlign: "right" }}>
          <div style={{ borderTop: "1px solid #9ca3af", display: "inline-block", paddingTop: "4px", width: "200px" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>Authorised Signatory</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "10px", color: "#9ca3af" }}>
          This is a computer-generated invoice
        </p>
      </div>
    </div>
  )
}
