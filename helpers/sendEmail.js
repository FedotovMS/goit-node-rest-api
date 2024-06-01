import "dotenv/config";
import sgMail from "@sendgrid/mail";

const { SENDGRID_API_KEY, SENDGRID_EMAIL_FROM } = process.env;
sgMail.setApiKey(SENDGRID_API_KEY);

export const sendEmail = async ({ to, from, subject, text, html }) => {
  const msg = {
    to,
    from: SENDGRID_EMAIL_FROM,
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;
