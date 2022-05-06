var multiparty = require('multiparty')
const register = require('../helpers/register')
const login = require('../helpers/login')

class UserController{
    register(req, res){
        const form = new multiparty.Form()

        form.parse(req, (err, fields, files) => {
            if (err) return res.status(400).send('unknown error when register')
            const resultMsg = register.userRegister( fields, files, 'cmnd')
            resultMsg.then(result => { return res.json(result) })
        })
    }

    login(req,res){
        const resObj = login.userLogin(req.body.username, req.body.password)
        resObj.then(result => {return res.json(result)})
    }
}

module.exports = new UserController