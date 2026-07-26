// Generates a human-friendly, editable product code, e.g. PRD-240726-3F2A
function generateProductCode() {
  const date = new Date();
  const y = String(date.getFullYear()).slice(2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `PRD-${y}${m}${d}-${rand}`;
}

function generateBarcodeNumber() {
  // 12-digit numeric string suitable for CODE128/EAN generation
  let code = "";
  for (let i = 0; i < 12; i++) code += Math.floor(Math.random() * 10);
  return code;
}

function generateInvoiceNumber() {
  return `INV-${Date.now()}`;
}

function generatePurchaseNumber() {
  return `PO-${Date.now()}`;
}

module.exports = {
  generateProductCode,
  generateBarcodeNumber,
  generateInvoiceNumber,
  generatePurchaseNumber,
};
