var express = require('express');
var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//1.1 dang ki tai khoan
const userController = require('../controller/UserController')
router.post('/register', userController.register)

//1.2 dang nhap lan dau
router.post('/login', userController.login)
module.exports = router;
