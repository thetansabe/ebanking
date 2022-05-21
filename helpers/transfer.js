const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Account = require('../model/Account')
const OTP = require('../model/OTP')
const createRandomOTP = require('./createRandomOTP')

function mailing(receiverMail, PIN){
  let transporter = nodemailer.createTransport({
    host: 'mail.phongdaotao.com',
    port: '25',
    secure: false,
    auth: {
      user: process.env.email, //sinhvien@phongdaotao.com
      pass: process.env.password //svtdtu
    },
    tls:{
      rejectUnauthorized: false,
    }
  })

  let mailOptions = {
    from: process.env.email,
    to: receiverMail,
    subject: "HiFi Ebanking transfer money",
    text: ` This is your OTP code: \n
      ${PIN} \n 
      This code is only activated in 1 minutes`
  }

  transporter.sendMail(mailOptions, (err) => {
    if(err) console.log('send email failed: ', err)
    else
      console.log('email sent')
  })
}

async function transfer(transferData){
  //check if exists
  try{
      // const doc = await Account.findOne({email: email, phonenumber : phoneNumber})
      // if(!doc) return {code: 114, msg: 'Invalid email or phone number, please try again'}
      // else{
          //create PIN
          const test = jwt.sign({
            data: transferData,
          },process.env.SECRET_JWT_PIN, {expiresIn: '1m'} )
          const otpCode = createRandomOTP(6)
          console.log(otpCode)
          const otp = new OTP({
            code: otpCode,
            actor: transferData.actorId,
          })
          await otp.save()
          .then(savedOtp => {
            //mailing -> mailing()
            mailing(transferData.email, savedOtp.code)
            return { code: 0, msg: 'Send PIN through email successfully', data: savedOtp.code }
          })
      // }   
  }
  catch(err){
      return {code:113, msg: 'Unexpected error when reset password'}
  }
}

module.exports = transfer
