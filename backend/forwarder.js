const nodemailer = require('nodemailer');

async function forwardEmail({ fromEmail, password, toEmail, subject, body, attachments = [] }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: fromEmail,
      pass: password,
    },
  });

  const mailOptions = {
    from: fromEmail,
    to: toEmail,
    subject,
    text: body,
    attachments: attachments.map(att => ({
      filename: att.filename,
      content: att.content,
      contentType: att.contentType
    }))
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { forwardEmail };
