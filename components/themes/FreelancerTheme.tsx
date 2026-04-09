"use client"

import { InvoiceThemeProps } from "./types"
import { amountToWords } from "@/lib/gst"

export function FreelancerTheme({
  invoiceData,
  items,
  subtotal,
  gstTotal,
  total,
  currencySymbol,
  taxType,
}: InvoiceThemeProps) {
  const isCgstSgst = taxType === "cgst_sgst"
  const accent = "#c2410c"

  return (
    <div
      style={{
        background: "#fafaf9",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        color: "#292524",
        padding: "48px 40px",
        maxWidth: "800px",
        margin: "0 auto",
        fontSize: "13px",
        lineHeight: "1.6",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-30deg)",
          fontSize: "120px",
          fontWeight: 800,
          color: "#000000",
          opacity: 0.04,
          pointerEvents: "none",
          letterSpacing: "8px",
          whiteSpace: "nowrap",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        INVOICE
      </div>

      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "8px" }}>
          {invoiceData.businessLogo && (
            <img
              src={invoiceData.businessLogo}
              alt="Logo"
              style={{ width: "48px", height: "48px", objectFit: "contain" }}
            />
          )}
          <h1
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "36px",
              fontWeight: 700,
              margin: 0,
              color: "#1c1917",
            }}
          >
            {invoiceData.businessName}
          </h1>
        </div>
        <p style={{ margin: 0, color: "#78716c", fontSize: "13px" }}>
          {invoiceData.businessAddress}
        </p>
        <p style={{ margin: 0, color: "#78716c", fontSize: "13px" }}>
          GSTIN: {invoiceData.businessGstin}
        </p>
      </div>

      {/* Accent line */}
      <div style={{ width: "60px", height: "3px", background: accent, marginBottom: "32px" }} />

      {/* Client + Invoice Details side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "36px" }}>
        <div>
          <p style={{ margin: "0 0 8px 0", fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "#a8a29e", fontWeight: 600 }}>
            Bill To
          </p>
          <p style={{ margin: 0, fontWeight: 600, fontSize: "15px", color: "#1c1917" }}>
            {invoiceData.clientName}
          </p>
          <p style={{ margin: 0, color: "#78716c", fontSize: "12px" }}>{invoiceData.clientAddress}</p>
          {invoiceData.clientGstin && (
            <p style={{ margin: 0, color: "#78716c", fontSize: "12px" }}>GSTIN: {invoiceData.clientGstin}</p>
          )}
          {invoiceData.clientState && (
            <p style={{ margin: 0, color: "#78716c", fontSize: "12px" }}>State: {invoiceData.clientState}</p>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "#a8a29e", fontWeight: 600 }}>
            Invoice Details
          </p>
          <p style={{ margin: 0, fontSize: "13px" }}>
            <span style={{ color: "#78716c" }}>Invoice #</span>{" "}
            <span style={{ fontWeight: 600 }}>{invoiceData.invoiceNumber}</span>
          </p>
          <p style={{ margin: 0, fontSize: "13px" }}>
            <span style={{ color: "#78716c" }}>Date:</span> {invoiceData.invoiceDate}
          </p>
          {invoiceData.dueDate && (
            <p style={{ margin: 0, fontSize: "13px" }}>
              <span style={{ color: "#78716c" }}>Due:</span> {invoiceData.dueDate}
            </p>
          )}
        </div>
      </div>

      {/* Line Items as clean list */}
      <div style={{ marginBottom: "32px" }}>
        {/* List Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom: `2px solid ${accent}`,
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: "#a8a29e",
            fontWeight: 600,
          }}
        >
          <span style={{ flex: 3 }}>Description</span>
          <span style={{ flex: 1, textAlign: "right" }}>Qty</span>
          <span style={{ flex: 1, textAlign: "right" }}>Rate</span>
          <span style={{ flex: 1, textAlign: "right" }}>Tax</span>
          <span style={{ flex: 1, textAlign: "right" }}>Amount</span>
        </div>

        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              padding: "12px 0",
              borderBottom: "1px solid #e7e5e4",
            }}
          >
            <div style={{ flex: 3 }}>
              <span style={{ fontWeight: 500 }}>{item.description}</span>
              {item.hsn_sac_code && (
                <span style={{ display: "block", fontSize: "11px", color: "#a8a29e" }}>
                  HSN/SAC: {item.hsn_sac_code}
                </span>
              )}
            </div>
            <span style={{ flex: 1, textAlign: "right", color: "#78716c" }}>{item.quantity}</span>
            <span style={{ flex: 1, textAlign: "right", color: "#78716c" }}>
              {currencySymbol}{item.rate.toFixed(2)}
            </span>
            <span style={{ flex: 1, textAlign: "right", color: "#78716c", fontSize: "12px" }}>
              {item.gstRate}%
            </span>
            <span style={{ flex: 1, textAlign: "right", fontWeight: 600 }}>
              {currencySymbol}{item.totalAmount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals - right aligned */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "28px" }}>
        <div style={{ width: "280px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#78716c" }}>
            <span>Subtotal</span>
            <span style={{ color: "#292524" }}>{currencySymbol}{subtotal.toFixed(2)}</span>
          </div>
          {isCgstSgst ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#78716c" }}>
                <span>CGST</span>
                <span style={{ color: "#292524" }}>{currencySymbol}{(gstTotal / 2).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#78716c" }}>
                <span>SGST</span>
                <span style={{ color: "#292524" }}>{currencySymbol}{(gstTotal / 2).toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#78716c" }}>
              <span>IGST</span>
              <span style={{ color: "#292524" }}>{currencySymbol}{gstTotal.toFixed(2)}</span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0 0 0",
              marginTop: "8px",
              borderTop: `2px solid ${accent}`,
              fontWeight: 700,
              fontSize: "18px",
              color: accent,
            }}
          >
            <span>Total</span>
            <span>{currencySymbol}{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Amount in words */}
      <div style={{ marginBottom: "28px" }}>
        <p style={{ margin: 0, fontSize: "12px", fontStyle: "italic", color: "#78716c" }}>
          <span style={{ fontWeight: 600, fontStyle: "normal" }}>Amount in Words:</span>{" "}
          {amountToWords(total)}
        </p>
      </div>

      {/* Notes / Terms */}
      {invoiceData.notes && (
        <div style={{ marginBottom: "12px" }}>
          <p style={{ margin: "0 0 2px 0", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#a8a29e", fontWeight: 600 }}>
            Notes
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#78716c" }}>{invoiceData.notes}</p>
        </div>
      )}
      {invoiceData.terms && (
        <div style={{ marginBottom: "12px" }}>
          <p style={{ margin: "0 0 2px 0", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#a8a29e", fontWeight: 600 }}>
            Terms & Conditions
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#78716c" }}>{invoiceData.terms}</p>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: "48px",
          paddingTop: "20px",
          borderTop: "1px solid #e7e5e4",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            color: "#78716c",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
          }}
        >
          Thank you for your business
        </p>
      </div>
    </div>
  )
}
