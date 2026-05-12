import { jsPDF } from 'jspdf'

// ─── Brand & org constants ────────────────────────────────────────────────────
const ORG_NAME    = 'BinaryHeart Inc.'
const ORG_ADDRESS = '642 N Madison St. Bloomington, IN 47404'
const ORG_EIN     = '93-2078509'
const ORG_FOOTER  = 'All storage drives will be wiped. Thank you for your support!'

const DISCLAIMER =
  'I, the undersigned representative, declare under penalty of perjury under the laws of the ' +
  'United States of America that as of the date of this receipt the above-mentioned organization ' +
  'is a current and valid 501(c)(3) non-profit organization in accordance with the standards and ' +
  'regulations of the Internal Revenue Service (IRS). No goods or services were provided in ' +
  'exchange for this donation.'

// Colors
const NAVY  = [25,  57,  97]  as const   // #193961
const WHITE = [255, 255, 255] as const
const LGRAY = [241, 245, 249] as const   // slate-100
const MGRAY = [100, 116, 139] as const   // slate-500
const DGRAY = [30,  41,  59]  as const   // slate-800
const BDCLR = [226, 232, 240] as const   // border slate-200

export interface ReceiptData {
  donorName:    string
  donationDate: string
  value:        string
  description:  string
  repName:      string
  repTitle:     string
}

async function fetchBase64(url: string): Promise<string | null> {
  try {
    const blob = await fetch(url).then(r => r.blob())
    return await new Promise<string>((res, rej) => {
      const reader = new FileReader()
      reader.onload  = () => res(reader.result as string)
      reader.onerror = rej
      reader.readAsDataURL(blob)
    })
  } catch { return null }
}

export async function generateDonationReceipt(data: ReceiptData): Promise<void> {
  const doc   = new jsPDF({ unit: 'pt', format: 'letter' })
  const pageW = doc.internal.pageSize.getWidth()   // 612
  const pageH = doc.internal.pageSize.getHeight()  // 792
  const M     = 54    // 0.75 in margin
  const CW    = pageW - M * 2  // 504

  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })

  // ── Helper: rounded box ──────────────────────────────────────────────────
  function box(x: number, y: number, w: number, h: number, fill: readonly [number, number, number] = WHITE) {
    doc.setFillColor(...fill)
    doc.setDrawColor(...BDCLR)
    doc.setLineWidth(0.75)
    doc.roundedRect(x, y, w, h, 4, 4, 'FD')
  }

  // ── Helper: section title bar ────────────────────────────────────────────
  function sectionHeader(label: string, y: number) {
    doc.setFillColor(...NAVY)
    doc.rect(M, y, 3, 13, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...NAVY)
    doc.text(label, M + 9, y + 10)
    return y + 22
  }

  // ── Helper: small label + value pair inside a box ────────────────────────
  function fieldPair(label: string, value: string, x: number, y: number, w: number) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...MGRAY)
    doc.text(label.toUpperCase(), x, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(...DGRAY)
    const lines = doc.splitTextToSize(value, w)
    doc.text(lines, x, y + 13)
    return lines.length
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Header band
  // ─────────────────────────────────────────────────────────────────────────
  const headerH = 88
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, pageW, headerH, 'F')

  // Logo (left side)
  const logo = await fetchBase64('/icon.png')
  if (logo) {
    const logoSz = 52
    const logoX  = M
    const logoY  = (headerH - logoSz) / 2
    const pad    = 5
    // White rounded background so the logo is visible on the navy bar
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(logoX - pad, logoY - pad, logoSz + pad * 2, logoSz + pad * 2, 6, 6, 'F')
    doc.addImage(logo, 'PNG', logoX, logoY, logoSz, logoSz)
  }

  // Title + org (right side)
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(19)
  doc.text('DONATION RECEIPT', pageW - M, 38, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.text(ORG_NAME, pageW - M, 56, { align: 'right' })
  doc.setFontSize(8.5)
  doc.setTextColor(180, 200, 220)
  doc.text(`EIN ${ORG_EIN}`, pageW - M, 69, { align: 'right' })

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Org info sub-bar
  // ─────────────────────────────────────────────────────────────────────────
  const subBarH = 24
  doc.setFillColor(...LGRAY)
  doc.rect(0, headerH, pageW, subBarH, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MGRAY)
  doc.text(`${ORG_ADDRESS}  ·  ${ORG_EIN}`, pageW / 2, headerH + 15, { align: 'center' })

  let y = headerH + subBarH + 26

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Donor / Receipt info boxes (two columns)
  // ─────────────────────────────────────────────────────────────────────────
  const gap  = 14
  const colW = (CW - gap) / 2
  const boxPad = 13
  const infoBoxH = 76

  // Left: Donated By
  box(M, y, colW, infoBoxH)
  fieldPair('Donated By', data.donorName, M + boxPad, y + boxPad + 2, colW - boxPad * 2)

  // Right: three mini-fields
  const rx = M + colW + gap
  box(rx, y, colW, infoBoxH)
  const rInner = colW / 2 - boxPad

  // Date of Donation (left half)
  fieldPair('Date of Donation', data.donationDate, rx + boxPad, y + boxPad + 2, rInner)

  // Donation Value (right half, prominent)
  const vx = rx + colW / 2 + 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...MGRAY)
  doc.text('DONATION VALUE', vx, y + boxPad + 9)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(...NAVY)
  doc.text(data.value, vx, y + boxPad + 29)

  // Receipt Date (left half, second row)
  fieldPair('Receipt Date', today, rx + boxPad, y + boxPad + 44, rInner)

  y += infoBoxH + 24

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Donation Description
  // ─────────────────────────────────────────────────────────────────────────
  y = sectionHeader('DONATION DESCRIPTION', y)

  const descLines = doc.splitTextToSize(data.description, CW - boxPad * 2)
  const descBoxH  = descLines.length * 15 + boxPad * 2
  box(M, y, CW, descBoxH, LGRAY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...DGRAY)
  doc.text(descLines, M + boxPad, y + boxPad + 10, { lineHeightFactor: 1.5 })
  y += descBoxH + 24

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Declaration
  // ─────────────────────────────────────────────────────────────────────────
  y = sectionHeader('DECLARATION', y)
  y += 8

  const declLines = doc.splitTextToSize(DISCLAIMER, CW)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MGRAY)
  doc.text(declLines, M, y, { lineHeightFactor: 1.65 })
  y += declLines.length * 9 * 1.65 + 24

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Signature section
  // ─────────────────────────────────────────────────────────────────────────
  y = sectionHeader('AUTHORIZED SIGNATURE', y)

  const sigBoxH  = 96
  box(M, y, CW, sigBoxH)

  // Left half: signature
  const sigColW = CW / 2 - 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...MGRAY)
  doc.text('SIGNATURE', M + boxPad, y + boxPad + 9)

  // Render name in Times Bold Italic (most serif/cursive of built-in fonts)
  doc.setFont('times', 'bolditalic')
  doc.setFontSize(28)
  doc.setTextColor(...NAVY)
  doc.text(data.repName, M + boxPad, y + boxPad + 43)

  // Underline beneath signature
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.5)
  const ulY = y + boxPad + 51
  const ulEnd = Math.min(M + boxPad + doc.getTextWidth(data.repName) + 6, M + sigColW)
  doc.line(M + boxPad, ulY, ulEnd, ulY)

  // Right half: printed name, title, date
  const r2x = M + CW / 2 + 8
  const r2w  = CW / 2 - boxPad - 8

  // Vertical divider
  doc.setDrawColor(...BDCLR)
  doc.setLineWidth(0.5)
  doc.line(M + CW / 2, y + 10, M + CW / 2, y + sigBoxH - 10)

  // Printed Name
  fieldPair('Printed Name', data.repName, r2x, y + boxPad + 2, r2w)

  // Title + Date (side by side in right half)
  const halfR = r2w / 2
  fieldPair('Title', data.repTitle, r2x, y + boxPad + 44, halfR - 4)
  fieldPair('Date', today, r2x + halfR + 4, y + boxPad + 44, halfR - 4)

  y += sigBoxH + 16

  // ─────────────────────────────────────────────────────────────────────────
  // 7. Footer band (pinned to page bottom)
  // ─────────────────────────────────────────────────────────────────────────
  const footerH = 30
  const footerY = pageH - footerH
  doc.setFillColor(...NAVY)
  doc.rect(0, footerY, pageW, footerH, 'F')
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8.5)
  doc.setTextColor(...WHITE)
  doc.text(ORG_FOOTER, pageW / 2, footerY + 19, { align: 'center' })

  doc.save(`donation-receipt-${data.donorName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}

/** Group items with identical key, return formatted description lines. */
export function buildDescription(items: { label: string; year?: number | string | null }[]): string {
  const counts = new Map<string, number>()
  for (const item of items) {
    const key = item.year ? `${item.year} ${item.label}` : item.label
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([label, count]) => count === 1 ? label : `${count}x ${label}`)
    .join(', ')
}
