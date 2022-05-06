const Account = require('../model/Account')
const bcrypt = require('bcrypt')

async function userLogin(username, password){
    const validate = validateAccount(username, password)
    
    const responseObject = await validate

    validate
    .then(resultObj => {
        console.log('result obj: ', resultObj)
        if(resultObj.code !== 0) return resultObj.msg

        if(resultObj.acc_status === 0){
            //TH1: lan dau dang nhap
            //dac diem: acc_info: 'default'; acc_status: 0
    
            //return res.json({code: 0, msg: 'Day la tai khoan default can doi mat khau', acc_status})
            //front end khi bat duoc json nay -> chuyen trang doi mat khau gom:
            //bat nhap username
            //bat nhap pass moi
            //bat nhap confirm pass moi
            //thanh cong:
            //update user: helpers/updateUser.js
            //update pass & acc_status + 1
            //front end chuyen thang den trang chu

            return {code: 0, msg: 'Day la tai khoan default can direct den trang doi mat khau', acc_status: 0}
        }else{
            return {code: 0, msg: 'Khong phai default user, cho phep direct den trang chu', acc_status: resultObj.acc_status}
        }
    })
    .then(jsonMsg => {
        return jsonMsg
    })

    return responseObject
     
}

async function validateAccount(username, password){
    try{
        const doc = await Account.findOne({username: username})

        const cmp = bcrypt.compareSync(password, doc.password)

        if(!cmp) return {code: 101, msg: 'Sai mat khau'}

        return {code: 0, msg: 'Dang nhap thanh cong', acc_status: doc.acc_status}
    }
    catch (err){
        return {code: 100, msg: 'Tai khoan khong ton tai'}
    }
}

module.exports = {
    userLogin,
}