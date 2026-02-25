require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Backend Ledger";

  const text = `
Hello ${name},

Your account has been successfully created.

You can now start using Backend Ledger to manage your transactions.

Regards,
Backend Ledger Team
`;

  const html = `
  <div style="font-family: Arial, sans-serif;">
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your account has been successfully created.</p>
    <p>You can now start using <strong>Backend Ledger</strong> to manage your transactions.</p>
    <br/>
    <p>Regards,<br/>Backend Ledger Team</p>
  </div>
  `;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionSuccessEmail(userEmail, name, amount, toAccount) {
  const maskedAccount = "XXXXXX" + toAccount.slice(-4);

  const subject = `Transaction Successful - Rs. ${amount}`;

  const text = `
Hello ${name},

Your payment of Rs. ${amount} to ${maskedAccount} was successful.

If this wasn't you, contact support immediately.

Backend Ledger Team
`;

  const html = `
  <div style="font-family: Arial, sans-serif;">
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your payment of <strong>Rs. ${amount}</strong> to 
    <strong>${maskedAccount}</strong> was successful.</p>
    <p style="font-size: 13px; color: #555;">
      If this wasn't you, contact support immediately.
    </p>
    <p>Backend Ledger Team</p>
  </div>
  `;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Failed - Action Required";

  const text = `
Hello ${name},

We were unable to process your transaction of Rs. ${amount} to account ${toAccount}.

The transaction has failed and no amount has been deducted from your account.

Possible reasons:
- Insufficient balance
- Network issue
- Temporary server problem

Please try again after some time. If the issue persists, contact support.

Regards,
Backend Ledger Team
`;

  const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2 style="color: #d9534f;">Transaction Failed</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>We were unable to process your transaction of 
       <strong>Rs. ${amount}</strong> to account 
       <strong>${toAccount}</strong>.</p>

    <p style="color: #555;">
      The transaction has failed and no amount has been deducted from your account.
    </p>

    <p><strong>Possible reasons:</strong></p>
    <ul>
      <li>Insufficient balance</li>
      <li>Network issue</li>
      <li>Temporary server problem</li>
    </ul>

    <p>Please try again after some time. If the issue continues, contact support.</p>

    <br/>
    <p>Regards,<br/>Backend Ledger Team</p>
  </div>
  `;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionSuccessEmail,
  sendTransactionFailureEmail,
};
