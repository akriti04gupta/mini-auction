const sgMail = require('@sendgrid/mail');
const { generateInvoice } = require('./invoiceService'); 
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// function to send emails attachment 
const sendEmail = async (to, subject, html, attachments = []) => {
  const from = 'guptaakii2604@gmail.com';

  const msg = { to, from, subject, html, attachments };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error(error.response.body)
    }
  }
};

// --- Email Template Functions ---

// When a sale is successful
const sendSaleConfirmationEmails = async (auction, sellerEmail, buyerEmail) => {
  // 1. Generate the PDF invoice
  const invoicePdf = await generateInvoice(auction);
  const invoiceBase64 = invoicePdf.toString('base64');

  // 2. Create the attachment object for SendGrid
  const attachment = {
    content: invoiceBase64,
    filename: `invoice-${auction.id}.pdf`,
    type: 'application/pdf',
    disposition: 'attachment',
  };

  // 3. Send emails with the invoice attached
  // Email for the Buyer(currently using my own email)
  await sendEmail(
    buyerEmail,
    `Congratulations! You won ${auction.itemName}`,
    `<h1>You Won!</h1><p>You have successfully won the auction for <strong>${auction.itemName}</strong> with a final bid of <strong>₹${auction.finalPrice}</strong>.</p><p>Your invoice is attached.</p>`,
    [attachment] 
  );

  // Email for the Seller
  await sendEmail(
    sellerEmail,
    `Your item "${auction.itemName}" has been sold!`,
    `<h1>Item Sold!</h1><p>Congratulations! Your item, <strong>${auction.itemName}</strong>, has been sold for <strong>₹${auction.finalPrice}</strong> to the user ${auction.winnerId}.</p><p>A copy of the invoice is attached.</p>`,
    [attachment] 
  );
};

module.exports = { sendSaleConfirmationEmails };
