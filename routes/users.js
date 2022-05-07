var express = require('express');
var router = express.Router();

const middlewareController = require('../controller/MiddlewareController')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//1.1 dang ki tai khoan
const userController = require('../controller/UserController')
router.post('/register', userController.register)

//1.2 dang nhap lan dau
router.post('/login', userController.login)

//test JWT auth
router.get('/testJWT', middlewareController.authForAdmin, (req, res) => {
  res.send('allowed to access')
})

//refresh token route
//route nay chi dung khi access token het han (20s)
router.post("/refreshJWT", userController.requestRefreshToken)

//logout function
router.post("/logout", userController.logout)
module.exports = router;
