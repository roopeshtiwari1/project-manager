import Mailgen from "mailgen";
import nodemailer from "nodemailer"


const sendMail = async (options) => {
  var mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'Project Manager',
        link: 'https://mailgen.js/'
    }
});

var emailText = mailGenerator.generatePlaintext(options.mailGenContent);
var emailHtml = mailGenerator.generate(options.mailGenContent);

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_SMTP_HOST,
  port: process.env.MAILTRAP_SMTP_PORT,
  secure: false, 
  auth: {
    user: process.env.MAILTRAP_SMTP_USER,
    pass: process.env.MAILTRAP_SMTP_PASS,
  },
});

const mail = {
  from: 'mail.projectmanager@example.com',
    to: options.email,
    subject: options.subject,
    text: emailText,
    html: emailHtml
}

try {
  await transporter.sendMail(mail)
} catch (error) {
  console.error("email failed", error)
}

}


const emailVerificationMailGenContent = (username, verificationUrl) => {
  return {
    body: {
       name: username,
        intro: 'Welcome to our app! We\'re very excited to have you on board.',
        action: {
            instructions: 'To get started with our app, please click here:',
            button: {
                color: '#22BC66', // Optional action button color
                text: 'Verify your accont',
                link: verificationUrl
            }
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
  }
}

const forgotPasswordMailGenContent = (username, resetPasswordUrl) => {
  return {
    body: {
       name: username,
        intro: 'We got a request to reset your password',
        action: {
            instructions: 'To reset your password, please click here:',
            button: {
                color: '#22BC66', // Optional action button color
                text: 'Reset Password',
                link: resetPasswordUrl
            }
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
  }
}

export {emailVerificationMailGenContent, forgotPasswordMailGenContent, sendMail}

// sendMail({
//   email: user.email,
//   subject: "Project Manager email-verification link",
//   mailGenContent: emailVerificationMailGenContent(user.username, verificationUrl)
// })


