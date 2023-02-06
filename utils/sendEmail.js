require("dotenv").config();
const nodemailer = require("nodemailer");

module.exports = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      post: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: {
        name: "Admin",
        address: process.env.USER,
      },  
      to: email,
      subject: subject,
      text: text,
      // html: ,
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log("Email not sent");
    console.log(error);
  }
};
