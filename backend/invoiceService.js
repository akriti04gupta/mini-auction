const PDFDocument = require('pdfkit');

function generateInvoice(auction) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- Invoice Content ---
      // Header
      doc
        .fontSize(20)
        .text('INVOICE', { align: 'center' })
        .fontSize(10)
        .text(`Invoice #: ${auction.id}-${new Date().getTime()}`, { align: 'right' })
        .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' })
        .moveDown();

      // Seller & Buyer Info
      doc
        .fontSize(12)
        .text(`Seller: ${auction.sellerId || 'Auctioneer'}`)
        .text(`Buyer: ${auction.winnerId}`)
        .moveDown(2);

      // Table Header
      doc.font('Helvetica-Bold');
      doc.text('Item Description', 50, 250);
      doc.text('Final Price', 450, 250, { width: 100, align: 'right' });
      doc.font('Helvetica');
      doc.lineCap('butt').moveTo(50, 265).lineTo(550, 265).stroke();
      doc.moveDown();
      
      // Table Row
      doc.text(auction.itemName, 50, 280);
      doc.text(`₹${auction.finalPrice}`, 450, 280, { width: 100, align: 'right' });
      doc.moveDown();
      doc.lineCap('butt').moveTo(50, 295).lineTo(550, 295).stroke();
      
      // Total
      doc.font('Helvetica-Bold');
      doc.text('Total:', 50, 320);
      doc.text(`₹${auction.finalPrice}`, 450, 320, { width: 100, align: 'right' });
      doc.font('Helvetica');
      doc.moveDown(3);

      // Footer
      doc
        .fontSize(10)
        .text('Thank you for your business!', { align: 'center' });

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateInvoice };