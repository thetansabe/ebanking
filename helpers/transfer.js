const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Account = require('../model/Account')

function mailing(receiverMail, PIN){
  let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.email,
        pass: process.env.password
      },
      tls:{
          rejectUnauthorized: false,
      }
  })

  let mailOptions = {
    from: process.env.email,
    to: receiverMail,
    subject: "HiFi Ebanking transfer money",
    text: ` This is your verify link: \n
      http://localhost:3000/wallet/transfer/${PIN} \n 
      This link is only activated in 1 minutes`
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
          const PIN = jwt.sign({
            data: transferData,
          },process.env.SECRET_JWT_PIN, {expiresIn: '1m'} )
          //mailing -> mailing()
          mailing(transferData.email, PIN)
          //console.log('PIN from email: ', 'http://localhost:3000/users/reset_password/' + PIN)
          return { code: 0, msg: 'Send PIN through email successfully' }
      // }   
  }
  catch(err){
      return {code:113, msg: 'Unexpected error when reset password'}
  }
}

module.exports = transfer
