import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

// A4 at 96 dpi = 794 × 1123 px.  jsPDF uses mm: 210 × 297.
const A4_W_PX  = 794
const A4_W_MM  = 210
const A4_H_MM  = 297

/**
 * Capture `elementId`, force it to A4 width, split across pages, save PDF.
 * Works for any content height — adds pages automatically.
 */
export async function downloadInvoiceAsPdf(
  elementId: string,
  filename: string,
): Promise<void> {
  const source = document.getElementById(elementId)
  if (!source) throw new Error(`Element #${elementId} not found`)

  // Off-screen A4-width clone so browser layout matches PDF
  const wrapper = document.createElement("div")
  wrapper.style.cssText = [
    "position:fixed",
    "left:-9999px",
    "top:0",
    `width:${A4_W_PX}px`,
    "background:#ffffff",
    "z-index:-1",
  ].join(";")

  const clone = source.cloneNode(true) as HTMLElement
  // Force the root theme div to fill exactly A4 width
  clone.style.width      = `${A4_W_PX}px`
  clone.style.maxWidth   = `${A4_W_PX}px`
  clone.style.margin     = "0"
  clone.style.boxSizing  = "border-box"

  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)

  try {
    const canvas = await html2canvas(wrapper, {
      scale       : 2,            // retina quality
      useCORS     : true,
      backgroundColor: "#ffffff",
      logging     : false,
      width       : A4_W_PX,
      windowWidth : A4_W_PX,
    })

    const imgData  = canvas.toDataURL("image/png")
    // Total rendered height in mm (proportional to A4 width)
    const totalMm  = (canvas.height / canvas.width) * A4_W_MM

    const pdf      = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pages    = Math.ceil(totalMm / A4_H_MM)

    for (let i = 0; i < pages; i++) {
      if (i > 0) pdf.addPage()
      // Shift image up by (pageIndex × A4 height) so each page shows the next slice.
      // jsPDF clips anything outside the page boundary automatically.
      pdf.addImage(imgData, "PNG", 0, -(i * A4_H_MM), A4_W_MM, totalMm)
    }

    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`)
  } finally {
    document.body.removeChild(wrapper)
  }
}
