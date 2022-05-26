const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config({path: './.env'})

const middelwareController =
{
    //verify JWT before using services
    verifyJWT : (req, res, next) => {
        const token = req.headers.authorization
        //console.log('body from verify JWT: ', req.body)
        // unauthorized code
        if(!token) return res.status(401).json('Forget to send token header')
            //return res.redirect(303, '/login')
        

        const accessToken = token.split(' ')[1]
        
        jwt.verify(accessToken, process.env.SECRET_JWT_ACCESS_KEY, (err, user) => {
            // console.log('err: ',err)
            // console.log('user: ',user)
            //wrong token -> forbidden code
            if(err){
                req.session.flash = {
                    type: 'danger',
                    intro: 'Unauthorized!',
                    message: 'You dont have permission to access this api'
                }
                return res.redirect(303, '/login')
            }
                
                //return res.status(403).json('Token is not valid, you are forbidden to access this api')
            //user la object (ta doc hieu duoc)
            //chua thong tin trong jwt
            req.user = user
            next()
        })
    },

    authForAdmin : (req, res, next) => {
        const ADMIN_ACC_STATUS  = parseInt(process.env.ADMIN_CODE)

        middelwareController.verifyJWT(req, res, () => {
            if(req.user.acc_status === ADMIN_ACC_STATUS) next()
            else
                return res.status(403).json('You are not admin to access this api')
        })
    },

    authForUnauthUser: (req, res, next) => {
        
        middelwareController.verifyJWT(req, res, () => {
            const status = req.user.acc_status

            if(status === 0) return res.json({code: 120, msg: 'Your account is default, it cannot access anything without changing password'})
            if(status === -1) return res.json({code: 121, msg: 'Your account has been disabled, please contact 18001008'})

            next()
        })
    },

    authForAuthUser: (req, res, next) => {

        middelwareController.verifyJWT(req, res, () => {
            const status = req.user.acc_status
            if(status === 2) next()
            else
                return res.json({code: 121, msg: 'Your account is unauthorized to access!'})
        })
    },

    verifyForResetPassword: (req,res,next) => {
        //console.log('PIN token: ', req.params.PIN)
        jwt.verify(req.params.PIN, process.env.SECRET_JWT_PIN , (err, user) => {
            if(err) return res.json({code: 115, msg: 'Your PIN is not valid or out of date'})
            
            req.user = user
            next()
        })
    },

    renderUnAuth : (req, res, next) => {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) 
            return res.redirect(303, '/login')
        
        jwt.verify(refreshToken, process.env.SECRET_JWT_REFRESH_KEY, (err, user) => {

            if(user.acc_status === 1 || user.acc_status === 2 || user.acc_status === 3)
                next()
            else{
                req.session.flash = {
                    type: 'danger',
                    intro: 'Unauthorized!',
                    message: 'Failed to access, wrong account perhaps'
                }
                return res.redirect(303, '/login')
            } 
        })          
    },

    renderAdmin : (req, res, next) => {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) 
            return res.redirect(303, '/login')
        
        jwt.verify(refreshToken, process.env.SECRET_JWT_REFRESH_KEY, (err, user) => {
            const ADMIN_ACC_STATUS  = parseInt(process.env.ADMIN_CODE)

            if(user.acc_status === ADMIN_ACC_STATUS)
                next()
            else{
                req.session.flash = {
                    type: 'danger',
                    intro: 'Unauthorized!',
                    message: 'Failed to access, wrong account perhaps'
                }
                return res.redirect(303, '/login')
            } 
        })          
    },
}

module.exports = middelwareController