import nodemailer from "nodemailer";

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async ({ email, Fullname, otp }) => {
  try {
    const mailOptions = {
      from: `"Career Guidance" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Career Guidance Registration",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Career Guidance OTP</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <!-- Header -->
            <tr>
              <td style="background-color: #2c3e50; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Career Guidance</h1>
                <p style="color: #dcdcdc; margin: 5px 0 0; font-size: 14px;">Your Path to Success</p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding: 30px; text-align: center;">
                <h2 style="color: #333333; font-size: 20px; margin: 0 0 10px;">Hello ${Fullname},</h2>
                <p style="color: #555555; font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
                  Thank you for registering with <strong>Career Guidance</strong>! To complete your registration, please use the One-Time Password (OTP) below:
                </p>
                <div style="background-color: #e8f0fe; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <h3 style="color: #1a73e8; font-size: 24px; margin: 0;">${otp}</h3>
                </div>
                <p style="color: #555555; font-size: 14px; line-height: 1.5; margin: 0 0 20px;">
                  This OTP is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email or contact our support team.
                </p>
                <a href="${process.env.FRONTEND_URL}/verify-otp" style="display: inline-block; padding: 12px 24px; background-color: #1a73e8; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px;">
                  Verify OTP
                </a>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background-color: #f4f4f4; padding: 20px; text-align: center; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                <p style="color: #777777; font-size: 12px; margin: 0;">
                  &copy; 2025 Career Guidance. All rights reserved.
                </p>
                <p style="color: #777777; font-size: 12px; margin: 5px 0 0;">
                  Need help? Contact us at <a href="mailto:support@careerguidance.com" style="color: #1a73e8; text-decoration: none;">support@careerguidance.com</a>
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};