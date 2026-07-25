import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function fmt(n) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n || 0)) + " FCFA";
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

const PAYMENT_LABELS = {
  espèces: "Espèces",
  wave: "Wave",
  orange_money: "Orange Money",
};

// Palette RVB (alignée sur l'identité BusinessOS Sénégal)
const INK = [18, 19, 28];
const BRAND = [67, 56, 202];
const TEAL = [15, 157, 116];
const DANGER = [220, 38, 38];
const MUTED = [107, 114, 128];
const LINE = [228, 230, 239];
const SAND = [245, 246, 250];
const CHARCOAL = [40, 41, 54];

/**
 * Construit le document PDF d'une facture.
 * @returns {jsPDF} le document, prêt à être sauvegardé ou ouvert.
 */
export function buildInvoicePdf({ invoice, sale, client, business }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;

  // Bandeau supérieur sobre (identité BusinessOS Sénégal)
  doc.setFillColor(...INK);
  doc.rect(0, 0, pageWidth, 5, "F");
  doc.setFillColor(...BRAND);
  doc.rect(0, 5, pageWidth * 0.28, 2, "F");

  let y = 52;

  // En-tête entreprise
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...INK);
  doc.text(business?.businessName || "Entreprise", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  y += 16;
  if (business?.address) {
    doc.text(business.address, margin, y);
    y += 13;
  }
  if (business?.phone) {
    doc.text(`Tél : ${business.phone}`, margin, y);
    y += 13;
  }
  if (business?.email) {
    doc.text(business.email, margin, y);
  }

  // Bloc "FACTURE" à droite
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...INK);
  doc.text("FACTURE", pageWidth - margin, 56, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`N° ${invoice.number}`, pageWidth - margin, 74, { align: "right" });
  doc.text(`Date : ${fmtDate(invoice.date)}`, pageWidth - margin, 88, { align: "right" });

  const statusLabel = invoice.status === "payée" ? "PAYÉE" : "IMPAYÉE";
  const statusColor = invoice.status === "payée" ? TEAL : DANGER;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...statusColor);
  doc.text(statusLabel, pageWidth - margin, 104, { align: "right" });

  // Bloc client
  y = 140;
  doc.setDrawColor(...LINE);
  doc.line(margin, y, pageWidth - margin, y);
  y += 22;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text("Facturé à", margin, y);
  y += 15;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...CHARCOAL);
  doc.text(client ? client.name : "Client de passage", margin, y);
  if (client?.phone) {
    y += 14;
    doc.text(client.phone, margin, y);
  }
  if (client?.address) {
    y += 14;
    doc.text(client.address, margin, y);
  }

  // Tableau des articles
  const items = sale?.items || [];
  const rows = items.map((it) => [
    it.name,
    String(it.qty),
    fmt(it.price),
    fmt(it.qty * it.price),
  ]);

  autoTable(doc, {
    startY: y + 26,
    margin: { left: margin, right: margin },
    head: [["Article", "Qté", "Prix unitaire", "Total"]],
    body: rows,
    styles: { font: "helvetica", fontSize: 10, textColor: CHARCOAL, cellPadding: 8 },
    headStyles: { fillColor: INK, textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: SAND },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 24;

  // Total
  doc.setDrawColor(...LINE);
  doc.line(pageWidth - margin - 200, finalY - 12, pageWidth - margin, finalY - 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text("Total", pageWidth - margin - 200, finalY + 8);
  doc.text(fmt(invoice.total), pageWidth - margin, finalY + 8, { align: "right" });

  let y2 = finalY + 34;
  if (invoice.status === "payée") {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...TEAL);
    const methodLabel = PAYMENT_LABELS[invoice.paymentMethod] || invoice.paymentMethod || "—";
    doc.text(`Payée par ${methodLabel}${invoice.paidAt ? " le " + fmtDate(invoice.paidAt) : ""}`, margin, y2);
    y2 += 20;
  }

  // Pied de page
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text("Facture générée par BusinessOS Sénégal — businessos.sn", margin, 800, { maxWidth: pageWidth - margin * 2 });

  return doc;
}

export function downloadInvoicePdf(args) {
  const doc = buildInvoicePdf(args);
  doc.save(`Facture-${args.invoice.number}.pdf`);
}

export function openInvoicePdf(args) {
  const doc = buildInvoicePdf(args);
  const blobUrl = doc.output("bloburl");
  window.open(blobUrl, "_blank");
}
