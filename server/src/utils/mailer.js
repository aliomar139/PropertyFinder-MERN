import nodemailer from 'nodemailer';

// Replaces PHPMailer in reset.php (Gmail SMTP, SSL port 465).
export async function sendResetCode(toEmail, toName, code) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || 'CedarHomes'}" <${process.env.SMTP_USER}>`,
    to: `"${toName}" <${toEmail}>`,
    replyTo: '"No Reply" <no-reply@propertyfinder.com>',
    subject: 'Reset Code',
    html: `<b>Your Password Reset Code: ${code}.</b>`,
    text: `Your Password Reset Code: ${code}.`
  });
}
