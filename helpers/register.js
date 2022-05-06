const fs = require('fs')
const path = require('path')
const nodemailer = require('nodemailer')
const Account = require('../model/Account')
const bcrypt = require('bcrypt')

async function userRegister(fields, files, secondLevelFolder){

    const phoneNumber = fields.phoneNumber[0]
    const email = fields.email[0]
    const hoTen = fields.hoten[0]
    const dateBirth = fields.dateBirth[0]

    const cmndTruoc = files.cmndTruoc[0]
    const cmndSau = files.cmndSau[0]

    //validate register email existed or not
    const isExisted = checkEmailExistence(email)
    const finalObj = 
        await isExisted.then(result => {
            if(result) return {code: 104, msg: 'Email da ton tai'}

            //handle saving
            saveInfoToDb(phoneNumber, email, hoTen, dateBirth, cmndTruoc, cmndSau, secondLevelFolder)
            
        })
    .then(finalMsg => {
        if(!finalMsg) return {code: 0, msg: 'Register thanh cong'}
        return finalMsg
    })
    
    return finalObj
}

function saveInfoToDb(phoneNumber, email, hoTen, dateBirth, cmndTruoc, cmndSau, secondLevelFolder){
    ////move file
    const id_front = moveFile(cmndTruoc, secondLevelFolder, email)
    const id_back = moveFile(cmndSau, secondLevelFolder, email)

    ////tao random username, password
    const username = createRandomUserName()
    const password = createRandomPassword()

    ////add user to db
    const salt = bcrypt.genSaltSync(10)
    const hashPass = bcrypt.hashSync(password, salt)

    ////tien hanh add user moi
    const newAccount = new Account({
        username,
        password : hashPass,
        acc_status : 0,
        acc_info : 'default',
        phonenumber: phoneNumber,
        hoten: hoTen,
        email,
        birth: dateBirth,
        id_front,
        id_back
    })

    newAccount.save().then(savedDoc => {
        //console.log('saved doc: ', savedDoc)
        if(savedDoc !== newAccount) {
            console.log({code: 103, msg: 'Unexpected error when add new account to DB'})
            return
        }
    
        mailing(email, username, password)
    })
}

async function checkEmailExistence(email){
    try{
        const findEmail = await Account.findOne({email: email})
        //console.log('emai find one: ', findEmail)
        if(!findEmail) return false
        return true //true -> da ton tai
    }
    catch(err){
        return false //false -> chua ton tai 
    }
}

function createRandomUserName(){
    let username = ''
    for (let i = 0; i<10; i++){
        username += Math.floor(Math.random() * 10)
    }
    return username
}

function createRandomPassword(){
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const passwordLength = 6;
    let password = "";

    for (var i = 0; i < passwordLength; i++) {
        const randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber +1);
    }

    return password
}

function moveFile(file, secondLevelFolder, destFolder){
    const oldPath = file.path 
    const dirPath = path.join(`public/images/${secondLevelFolder}`, destFolder)
    
    fs.mkdirSync(dirPath, { recursive: true })
    
    const newPath = __dirname + '/../public/images/' + secondLevelFolder + '/' + destFolder + '/' + file.originalFilename
    
    fs.copyFileSync(oldPath, newPath)
    //console.log('moved file')

    return dirPath + '/' + file.originalFilename
}

function mailing(receiverMail, username, pass){
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "dummymailforebanking@gmail.com",
            pass: "thisisadumbmail234"
        },
        tls:{
            rejectUnauthorized: false,
        }
    })

    let mailOptions = {
        from: "dummymailforebanking@gmail.com",
        to: receiverMail,
        subject: "HiFi Ebanking default account",
        text: ` This is your username: \b${username}\n This is your pass: \b${pass}\n`
    }

    transporter.sendMail(mailOptions, (err) => {
        if(err) console.log('send email failed: ', err)
        else
            console.log('email sent')
    })
}
module.exports = {
    userRegister,
}
