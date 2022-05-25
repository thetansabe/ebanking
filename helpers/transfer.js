const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Account = require('../model/Account')
const OTP = require('../model/OTP')
const createRandomOTP = require('./createRandomOTP')

function mailing(receiverMail, PIN){
  let transporter = nodemailer.createTransport({
      host: 'mail.phongdaotao.com',
      port: '25', 
      // service: 'gmail',
      auth: {
          user: process.env.EMAIL_FOR_SEND_NAME,
          pass: process.env.EMAIL_FOR_SEND_PASS
      },
      tls:{
          rejectUnauthorized: false,
      }
  })

  let mailOptions = {
      from: process.env.EMAIL_FOR_SEND_NAME,
      to: receiverMail,
      subject: "HiFi Ebanking transfer money",
      text: ` This is your OTP code: \n
         ${PIN} \n 
        This code is only active in 1 minute`
  }

  transporter.sendMail(mailOptions, (err) => {
      if(err) console.log('send email failed: ', err)
      else
          console.log('email sent')
  })
}

async function transfer(transferData){
  const otpCode = createRandomOTP(6)
  const otp = new OTP({
    code: otpCode,
    actor: transferData.actorId,
  })
  return await otp.save()
  .then(async savedOtp => {
    //mailing -> mailing()
    let resp = await wrappedSendMail(transferData.email, savedOtp.code)
    console.log(resp)
    return new Promise((resolve, reject) => {
      const result = { code: 0, message: 'Send PIN through email successfully', data: savedOtp.code }
      resolve(result)
    })
  })
  .catch(err => {
    return new Promise((resolve, reject) => {
      const result = { code: err.code, msg: err.message}
      resolve(result)
    })
  })
}

module.exports = mailing
