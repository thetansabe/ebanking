var multiparty = require('multiparty')
const register = require('../helpers/register')

class UserController{
    register(req, res){
        const form = new multiparty.Form()

        form.parse(req, (err, fields, files) => {
            if (err) return res.status(400).send('unknown error')
            register.userRegister(req, res, fields, files, 'cmnd')
            return res.send('okey')
        })
    }
}

module.exports = new UserController