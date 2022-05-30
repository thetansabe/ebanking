var express = require('express');
var router = express.Router();

const middlewareController = require('../controller/MiddlewareController');
const UserController = require('../controller/UserController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//user_1 + 2 dang ki tai khoan
const userController = require('../controller/UserController')
router.post('/register', userController.register)

//user_3 dang nhap
router.post('/login', userController.login)

//refresh token route
//route nay chi dung khi access token het han (20s)
router.post("/refreshJWT", userController.requestRefreshToken)

//logout function
router.post("/logout", userController.logout)
module.exports = router;

//user_4 - mat khau moi lan dau dang nhap
//khong can nhap mk cu _ chi can mk moi 2 lan
router.put("/changePassword/firstLogin", middlewareController.verifyJWT , userController.changePasswordFirstTime)

//user_7 - doi mat khau
router.put("/changePassword", middlewareController.authForUnauthUser , userController.changePassword)

//user_5 - xem thong tin ca nhan
router.get("/userInfo", middlewareController.authForUnauthUser, userController.viewInfo)

//user_6 - bo sung thong tin ca nhan 2 anh CMND
router.put("/updateIdentityCard", middlewareController.authForUnauthUser, UserController.updateIdCard)

//user_8 - khoi phuc mat khau qua email/sms - Forget password
//quen mk -> ko login dc -> ko co' token -> bao mat lam sao ???
router.post("/forgetPassword", userController.forgetPassword)

//xem lich su giao dich
router.get('/histories', middlewareController.authForUnauthUser, UserController.getHistories)

router.get("/reset_password/:PIN", middlewareController.verifyForResetPassword, (req, res) => {
  return res.redirect(303, '/login')
  //res.send('redirect sang trang first login')
})