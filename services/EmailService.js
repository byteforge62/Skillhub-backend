const resend = require("../config/resend");
const AppError = require("../utils/AppError");

const sendVerificationOTP = async (email, fullname, otp) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Verify Your Skillhub Account",
      html: `
                <h2>Welcome to skillhub!</h2>
                <p>Hello <Strong>${fullname}</Strong>,</p>
                <p>Thank you for registering.</p>
                <p>Your verification code is:</p>
                <h1 style="letter-spacing:5px;">${otp}</h1>
                <p>This code expires in <strong>10 minutes</strong></p>
                <p>If you didn't create this account,please ignore this email.</p>
                <br>
                <p>Regards,</p>
                <p><strong>Skillhub Team</strong></p>
            `,
    });
  } catch (error) {
    console.error("RESEND ERROR:");
    console.error(error);

    throw new AppError(
      "Unable to send verification email. Please try again later.",
      500,
    );
  }
};

const sendPasswordResetOTP = async (email, fullname, otp) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Reset Your Skillhub Password",
      html: `
      <h2>Hello ${fullname},</h2>
      <p>You requested to reset your SkillHub password.</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for <strong>10 minutes</strong>.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });
  } catch(error){
    console.error("RESEND ERROR:", error);
    throw new AppError("Unable to send password reset email.Please try again later.",500);
  }
};

module.exports = {
  sendVerificationOTP,
  sendPasswordResetOTP,
};
