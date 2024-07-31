import nodemailer from 'nodemailer';
import bcryptjs from 'bcryptjs';
import User from '@/models/userModel';

export const sendEmail = async ({ email, emailType, userId }: any) => {
  try {
    const hashedToken = await bcryptjs.hash(userId.toString(), 10)

     if (emailType === "VERIFY") {

      const updatedUser =  await User.findByIdAndUpdate(userId, {
        $set: {verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 36000000}})
    } else if(emailType === "RESET") {
      await User.findByIdAndUpdate(userId, {
       $set: {forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + 3600000}})
    }

    var transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "ee26dd56f96595",
        pass: "87e087ef1b78a3"
      }
    });

    const mailOptions = {
      from: 'xyz@gmail.com',
      to: email,
      subject: emailType === 'VERIFY' ? "verify your email" : "reset your password",  
      html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"} or copy and paste the link below in your browser <br> ${process.env.DOMAIN}/verifyemail?token=${hashedToken}</p>`, 
    }

    const mailResponse = await transporter.sendMail(mailOptions)
    return mailResponse
  } catch (error:any) {
    throw new Error(error.message)
  }
}

