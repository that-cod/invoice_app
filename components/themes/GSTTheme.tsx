"use client"

import { InvoiceThemeProps } from "./types"
import { amountToWords } from "@/lib/gst"

function extractStateCode(gstin?: string): string {
  if (!gstin || gstin.length < 2) return "-"
  return gstin.substring(0, 2)
}

export function GSTTheme({
  invoiceData,
  items,
  subtotal,
  gstTotal,
  total,
  currencySymbol,
  taxType,
}: InvoiceThemeProps) {
  const isCgstSgst = taxType === "cgst_sgst"
  const cellStyle: React.CSSProperties = {
    border: "1px solid #000000",
    padding: "4px 6px",
    fontSize: "12px",
    fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
  }
  const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    fontWeight: 700,
    background: "#f3f4f6",
    textAlign: "center",
    fontSize: "11px",
  }

  return (
    <div
      style={{
        background: "#ffffff",
        fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
        color: "#000000",
        padding: "20px 24px",
        width: "100%",
        boxSizing: "border-box",
        fontSize: "12px",
        lineHeight: "1.4",
      }}
    >
      {/* Title */}
      <h1
        style={{
          textAlign: "center",
          fontSize: "16px",
          fontWeight: 700,
          margin: "0 0 16px 0",
          textDecoration: "underline",
          textTransform: "uppercase",
        }}
      >
        Tax Invoice
      </h1>

      {/* Header: Seller + Invoice Details */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0" }}>
        <tbody>
          <tr>
            {/* Seller Details */}
            <td style={{ ...cellStyle, verticalAlign: "top", width: "50%" }}>
              <div style={{ marginBottom: "4px" }}>
                {invoiceData.businessLogo && (
                  <img
                    src={invoiceData.businessLogo}
                    alt="Logo"
                    style={{ width: "40px", height: "40px", objectFit: "contain", marginBottom: "4px" }}
                  />
                )}
              </div>
              <table style={{ fontSize: "12px", width: "100%" }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700, padding: "2px 4px 2px 0", whiteSpace: "nowrap" }}>Name:</td>
                    <td style={{ padding: "2px 0" }}>{invoiceData.businessName}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, padding: "2px 4px 2px 0", whiteSpace: "nowrap" }}>Address:</td>
                    <td style={{ padding: "2px 0" }}>{invoiceData.businessAddress}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, padding: "2px 4px 2px 0", whiteSpace: "nowrap" }}>GSTIN:</td>
                    <td style={{ padding: "2px 0" }}>{invoiceData.businessGstin}</td>
                  </tr>
                  {invoiceData.businessState && (
                    <tr>
                      <td style={{ fontWeight: 700, padding: "2px 4px 2px 0", whiteSpace: "nowrap" }}>State:</td>
                      <td style={{ padding: "2px 0" }}>{invoiceData.businessState}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ fontWeight: 700, padding: "2px 4px 2px 0", whiteSpace: "nowrap" }}>State Code:</td>
                    <td style={{ padding: "2px 0" }}>{extractStateCode(invoiceData.businessGstin)}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            {/* Invoice Details */}
            <td style={{ ...cellStyle, verticalAlign: "top", width: "50%" }}>
              <table style={{ fontSize: "12px", width: "100%" }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700, padding: "2px 4px 2px 0", whiteSpace: "nowrap" }}>Invoice No:</td>
                    <td style={{ padding: "2px 0" }}>{invoiceData.invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, padding: "2px 4px 2px 0", whiteSpace: "nowrap" }}>Date:</td>
                    <td style={{ padding: "2px 0" }}>{invoiceData.invoiceDate}</td>
                  </tr>
                  {invoiceData.dueDate && (
                    <tr>
                      <td style={{ fontWeight: 700, padding: "2px 4px 2px 0", whiteSpace: "nowrap" }}>Due Date:</td>
                      <td style={{ padding: "2px 0" }}>{invoiceData.dueDate}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Buyer Details */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0" }}>
        <tbody>
          <tr>
            <td style={{ ...cellStyle, verticalAlign: "top" }}>
              <p style={{ margin: "0 0 4px 0", fontWeight: 700, fontSize: "12px" }}>Details of Receiver (Billed to):</p>
              <table style={{ fontSize: "12px", width: "100%" }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700, padding: "2px 4px 2px 0", whiteSpace: "nowrap" }}>Name:</td>
                    <td style={{ padding: "2px 0" }}>{invoiceData.clientName}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, padding: "2px 4px 2px 0", whiteSpace: "nowrap" }}>Address:</td>
                    <td style={{ padding: "2px 0" }}>{invoiceData.clientAddress}</td>
                  </tr>
                  {invoiceData.clientGstin && (
                    <tr>
                      <td style={{ fontWeight: 700, padding: "2px 4px 2px 0", whiteSpace: "nowrap" }}>GSTIN:</td>
                      <td style={{ padding: "2px 0" }}>{invoiceData.clientGstin}</td>
                    </tr>
                  )}
                  {invoiceData.clientState && (
                    <tr>
                      <td style={{ fontWeight: 700, padding: "2px 4px 2px 0", whiteSpace: "nowrap" }}>State:</td>
                      <td style={{ padding: "2px 0" }}>{invoiceData.clientState}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ fontWeight: 700, padding: "2px 4px 2px 0", whiteSpace: "nowrap" }}>State Code:</td>
                    <td style={{ padding: "2px 0" }}>{extractStateCode(invoiceData.clientGstin)}</td>
                  </tr>
                  {invoiceData.placeOfSupply && (
                    <tr>
                      <td style={{ fontWeight: 700, padding: "2px 4px 2px 0", whiteSpace: "nowrap" }}>Place of Supply:</td>
                      <td style={{ padding: "2px 0" }}>{invoiceData.placeOfSupply}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Line Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0" }}>
        <thead>
          {isCgstSgst ? (
            <tr>
              <th style={headerCellStyle}>Sr No</th>
              <th style={headerCellStyle}>Description</th>
              <th style={headerCellStyle}>HSN/SAC</th>
              <th style={headerCellStyle}>Qty</th>
              <th style={headerCellStyle}>Unit</th>
              <th style={headerCellStyle}>Rate</th>
              <th style={headerCellStyle}>Taxable Value</th>
              <th style={headerCellStyle}>CGST Rate</th>
              <th style={headerCellStyle}>CGST Amt</th>
              <th style={headerCellStyle}>SGST Rate</th>
              <th style={headerCellStyle}>SGST Amt</th>
              <th style={headerCellStyle}>Total</th>
            </tr>
          ) : (
            <tr>
              <th style={headerCellStyle}>Sr No</th>
              <th style={headerCellStyle}>Description</th>
              <th style={headerCellStyle}>HSN/SAC</th>
              <th style={headerCellStyle}>Qty</th>
              <th style={headerCellStyle}>Unit</th>
              <th style={headerCellStyle}>Rate</th>
              <th style={headerCellStyle}>Taxable Value</th>
              <th style={headerCellStyle}>IGST Rate</th>
              <th style={headerCellStyle}>IGST Amt</th>
              <th style={headerCellStyle}>Total</th>
            </tr>
          )}
        </thead>
        <tbody>
          {items.map((item, index) => (
            isCgstSgst ? (
              <tr key={index}>
                <td style={{ ...cellStyle, textAlign: "center" }}>{index + 1}</td>
                <td style={cellStyle}>{item.description}</td>
                <td style={{ ...cellStyle, textAlign: "center" }}>{item.hsn_sac_code || "-"}</td>
                <td style={{ ...cellStyle, textAlign: "right" }}>{item.quantity}</td>
                <td style={{ ...cellStyle, textAlign: "center" }}>Nos</td>
                <td style={{ ...cellStyle, textAlign: "right" }}>{currencySymbol}{item.rate.toFixed(2)}</td>
                <td style={{ ...cellStyle, textAlign: "right" }}>{currencySymbol}{item.amount.toFixed(2)}</td>
                <td style={{ ...cellStyle, textAlign: "center" }}>{(item.gstRate / 2).toFixed(1)}%</td>
                <td style={{ ...cellStyle, textAlign: "right" }}>{currencySymbol}{(item.gstAmount / 2).toFixed(2)}</td>
                <td style={{ ...cellStyle, textAlign: "center" }}>{(item.gstRate / 2).toFixed(1)}%</td>
                <td style={{ ...cellStyle, textAlign: "right" }}>{currencySymbol}{(item.gstAmount / 2).toFixed(2)}</td>
                <td style={{ ...cellStyle, textAlign: "right", fontWeight: 700 }}>{currencySymbol}{item.totalAmount.toFixed(2)}</td>
              </tr>
            ) : (
              <tr key={index}>
                <td style={{ ...cellStyle, textAlign: "center" }}>{index + 1}</td>
                <td style={cellStyle}>{item.description}</td>
                <td style={{ ...cellStyle, textAlign: "center" }}>{item.hsn_sac_code || "-"}</td>
                <td style={{ ...cellStyle, textAlign: "right" }}>{item.quantity}</td>
                <td style={{ ...cellStyle, textAlign: "center" }}>Nos</td>
                <td style={{ ...cellStyle, textAlign: "right" }}>{currencySymbol}{item.rate.toFixed(2)}</td>
                <td style={{ ...cellStyle, textAlign: "right" }}>{currencySymbol}{item.amount.toFixed(2)}</td>
                <td style={{ ...cellStyle, textAlign: "center" }}>{item.gstRate}%</td>
                <td style={{ ...cellStyle, textAlign: "right" }}>{currencySymbol}{item.gstAmount.toFixed(2)}</td>
                <td style={{ ...cellStyle, textAlign: "right", fontWeight: 700 }}>{currencySymbol}{item.totalAmount.toFixed(2)}</td>
              </tr>
            )
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0" }}>
        <tbody>
          <tr>
            <td style={{ ...cellStyle, textAlign: "right", fontWeight: 700 }}>Subtotal</td>
            <td style={{ ...cellStyle, textAlign: "right", width: "150px" }}>{currencySymbol}{subtotal.toFixed(2)}</td>
          </tr>
          {isCgstSgst ? (
            <>
              <tr>
                <td style={{ ...cellStyle, textAlign: "right", fontWeight: 700 }}>Total CGST</td>
                <td style={{ ...cellStyle, textAlign: "right", width: "150px" }}>{currencySymbol}{(gstTotal / 2).toFixed(2)}</td>
              </tr>
              <tr>
                <td style={{ ...cellStyle, textAlign: "right", fontWeight: 700 }}>Total SGST</td>
                <td style={{ ...cellStyle, textAlign: "right", width: "150px" }}>{currencySymbol}{(gstTotal / 2).toFixed(2)}</td>
              </tr>
            </>
          ) : (
            <tr>
              <td style={{ ...cellStyle, textAlign: "right", fontWeight: 700 }}>Total IGST</td>
              <td style={{ ...cellStyle, textAlign: "right", width: "150px" }}>{currencySymbol}{gstTotal.toFixed(2)}</td>
            </tr>
          )}
          <tr>
            <td style={{ ...cellStyle, textAlign: "right", fontWeight: 700, fontSize: "14px" }}>Grand Total</td>
            <td style={{ ...cellStyle, textAlign: "right", fontWeight: 700, fontSize: "14px", width: "150px" }}>
              {currencySymbol}{total.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Amount in Words + Declaration */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0" }}>
        <tbody>
          <tr>
            <td style={{ ...cellStyle, verticalAlign: "top" }}>
              <p style={{ margin: "0 0 6px 0", fontWeight: 700, fontSize: "12px" }}>Amount in Words:</p>
              <p style={{ margin: "0 0 12px 0", fontSize: "12px" }}>{amountToWords(total)}</p>
              <p style={{ margin: "0 0 6px 0", fontWeight: 700, fontSize: "12px" }}>Declaration:</p>
              <p style={{ margin: 0, fontSize: "11px" }}>
                We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Notes / Terms */}
      {(invoiceData.notes || invoiceData.terms) && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0" }}>
          <tbody>
            {invoiceData.notes && (
              <tr>
                <td style={cellStyle}>
                  <span style={{ fontWeight: 700 }}>Notes:</span> {invoiceData.notes}
                </td>
              </tr>
            )}
            {invoiceData.terms && (
              <tr>
                <td style={cellStyle}>
                  <span style={{ fontWeight: 700 }}>Terms & Conditions:</span> {invoiceData.terms}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Signature */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ ...cellStyle, textAlign: "right", height: "80px", verticalAlign: "bottom" }}>
              <p style={{ margin: "0 0 4px 0", fontWeight: 700, fontSize: "12px" }}>
                For {invoiceData.businessName}
              </p>
              <div style={{ borderTop: "1px solid #000000", display: "inline-block", width: "200px", paddingTop: "4px" }}>
                <p style={{ margin: 0, fontSize: "11px" }}>Authorised Signatory</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
