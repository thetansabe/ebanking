const Account = require('../model/Account')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const dotenv = require('dotenv').config({path: './.env'})

async function userLogin(username, password){
    const validate = validateAccount(username, password)
    
    const responseObject = await validate

    return responseObject
    
    //neu acc_status = 0 -> doi mk
    //acc_status != 0 -> direct thang toi trang chu

    //front end khi bat duoc json nay -> chuyen trang doi mat khau gom:
        //bat nhap username
        //bat nhap pass moi
        //bat nhap confirm pass moi
        //thanh cong:
        //update user: helpers/updateUser.js
        //update pass & acc_status + 1
        //front end chuyen thang den trang chu
}

async function validateAccount(username, password){
    try{
        
        const doc = await Account.findOne({username: username})

        const cmp = bcrypt.compareSync(password, doc.password)

        if(!cmp) return {code: 101, msg: 'Sai mat khau'}

        //xu li JWT
        const accessToken = generateAccessToken(doc._id, doc.acc_status)
        const refreshToken = generateRefreshToken(doc._id, doc.acc_status)
        
        //luu cookie
        
        return {code: 0, msg: 'Dang nhap thanh cong', accessToken, refreshToken, status_for_direct: doc.acc_status}
    }
    catch (err){
        return {code: 100, msg: 'Tai khoan khong ton tai'}
    }
}

function generateAccessToken(id, status){
    const accessToken = jwt.sign(
        { id, acc_status : status }, 
        process.env.SECRET_JWT_ACCESS_KEY,
        {expiresIn: "1h"}
    )

    return accessToken
}

function generateRefreshToken(id, status){
    const refreshToken = jwt.sign(
        {
            id,
            acc_status: status,
        }, 
        process.env.SECRET_JWT_REFRESH_KEY,
        {expiresIn: "365d"}
    )

    return refreshToken
}


//STORING TOKEN:
//1) local storage:
module.exports = {
    userLogin,
    generateAccessToken,
    generateRefreshToken,
}