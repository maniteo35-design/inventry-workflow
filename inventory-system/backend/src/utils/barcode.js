const QRCode = require("qrcode");

// Returns a base64 data URL for a QR code encoding the product code/barcode.
async function generateQRCodeDataUrl(text) {
  return QRCode.toDataURL(text, { margin: 1, width: 300 });
}

module.exports = { generateQRCodeDataUrl };
