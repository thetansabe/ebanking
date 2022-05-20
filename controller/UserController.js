var multiparty = require('multiparty')
const register = require('../helpers/register')
const login = require('../helpers/login')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config({path: './.env'})
const changePassword = require('../helpers/changePassword.js')
const userInfo = require('../helpers/userInfo')

//temporary refresh token db
let refreshTokensList = []

const UserController = {

    register : (req, res) => {
        const form = new multiparty.Form()

        form.parse(req, (err, fields, files) => {
            if (err) return res.status(400).send('unknown error when register')
            const resultMsg = register.userRegister( fields, files, 'cmnd')
            resultMsg.then(result => { return res.json(result) })
        })
    },

    login : (req,res) => {
        const resObj = login.userLogin(req.body.username, req.body.password)
        resObj.then(result => {
            if(result.code === 0){
                const {refreshToken, ...others} = result

                refreshTokensList.push(refreshToken)
                //set cookie
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false, //set true khi deloy web
                    path: "/",
                    sameSite: "strict",
        
                })

                //req.user.acc_status = result.status_for_direct
                return res.json(others)
            }
            return res.json(result)
        })
    },

    requestRefreshToken : async (req, res) => {
        try{
            //vi chi co accessToken moi validate api access
            //the nhung accessToken chi co' 30 s
            //phai co refreshToken tu cookie (user) moi refresh duoc access token
            const refreshToken = req.cookies.refreshToken
            if (!refreshToken) return res.status(401).json('You are not authenticated')

            jwt.verify(refreshToken, process.env.SECRET_JWT_REFRESH_KEY, (err, user) => {
                //check token ngau nhien
                if(err) return res.status(403).json('Invalid refresh token')
                
                //check token sinh ra voi dung key nhung khac user
                if(!refreshTokensList.includes(refreshToken))
                    return res.status(403).json('This is not your refresh token, please login')
                
                refreshTokensList.filter(tokens => {
                    return tokens !== refreshToken
                })

                const newAccessToken = login.generateAccessToken(user.id, user.acc_status)
                //khi phai tao access token moi, dong nghia 1 session login moi duoc tao ra
                //=> cung phai tao lai refresh token
                const newRefreshToken = login.generateRefreshToken(user.id, user.acc_status)
                
                refreshTokensList.push(newRefreshToken)
                res.cookie("refreshToken", newRefreshToken, {
                    httpOnly: true,
                    secure: false, //set true khi deloy web
                    path: "/",
                    sameSite: "strict",
                })

                return res.json({code: 0 , msg: 'Refresh tokens successfully', newAccessToken})
            })
        }
        catch(err){
            return res.status(400).json('Unexpected error')
        }
    },

    logout : async(req , res) => {
        //xoa trong db ao
        refreshTokensList = refreshTokensList.filter(tokens => {
            return tokens !== req.cookies.refreshToken
        })

        //xoa refresh token trong cookies
        res.clearCookie("refreshToken")

        //xoa access token o local storage
        //cong viec cua front end
        return res.json({code: 0, msg: 'Logout nho xoa access token nha front end'})
    },

    changePasswordFirstTime : (req,res) => {
        const newPass = req.body.newPassword
        const confirmNewPass = req.body.confirmPassword
        const user = req.user
        
        const handleChangePassword = changePassword.saveNewPassToDb(user, newPass, confirmNewPass)
        handleChangePassword.then(response => {
            if(response.code === 0){
                req.session.flash = {
                    type: 'success',
                    intro: 'Success!',
                    message: 'Change pass successfully, wait for admin authorization'
                }
            }
            return res.json(response)
        })
    },

    changePassword : (req, res) => {
        const oldPass = req.body.oldPassword
        const newPass = req.body.newPassword
        const confirmNewPass = req.body.confirmPassword
        const user = req.user
        
        const handleChangePassword = changePassword.changePass(user, oldPass,newPass, confirmNewPass)
        handleChangePassword.then(response => {
            if(response.code === 0){
                //set flash message
                req.session.flash = {
                    type: 'success',
                    intro: 'Success!',
                    message: 'Your password has been changed'
                }
            }
            return res.json(response)
        })
    },

    viewInfo : async (req, res) =>{
        const infos = await userInfo.getInfo(req.user.id)
        return res.json(infos)
    },

    updateIdCard: async (req, res) => {
        const form = new multiparty.Form()

        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(400).send('unknown error when catch multi form data')
            const updateReturnMsg = await userInfo.updateIdentity(files, req.user.id)
            return res.json(updateReturnMsg)
        })
          
    },

    forgetPassword: async (req, res) => {
        //user nhap email va sdt -> check
        const email = req.body.email
        const phoneNumber = req.body.phoneNumber
        const newPass = req.body.pass
        const confirmPass = req.body.confirmPass

        const responseMsg = await changePassword.forgetPassword(email, phoneNumber, newPass, confirmPass)
        if(responseMsg.code === 0){
            console.log('redirect trang reset pass')
            //return res.redirect('http://localhost:3000/users/reset_password')
        }
        return res.json(responseMsg)
    },

    // resetPassword: async (req, res) => {
    //     const PIN = req.body.PIN
    //     const responseMsg = await changePassword.resetPassword(PIN)
    //     return res.json(responseMsg)
    // }
}

module.exports = UserController