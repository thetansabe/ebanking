const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config({path: './.env'})

const middelwareController =
{
    //verify JWT before using services
    verifyJWT : (req, res, next) => {
        const token = req.headers.authorization

        // unauthorized code
        if(!token) return res.status(401).json('Forget to send token header')

        const accessToken = token.split(' ')[1]
        
        jwt.verify(accessToken, process.env.SECRET_JWT_ACCESS_KEY, (err, user) => {
            // console.log('err: ',err)
            // console.log('user: ',user)
            //wrong token -> forbidden code
            if(err) return res.status(403).json('Token is not valid, you are forbidden to access this api')

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
    }
}

module.exports = middelwareController