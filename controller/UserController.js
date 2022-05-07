var multiparty = require('multiparty')
const register = require('../helpers/register')
const login = require('../helpers/login')
const jwt = require('jsonwebtoken')
const async = require('hbs/lib/async')
const dotenv = require('dotenv').config({path: './.env'})

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
    }
}

module.exports = UserController