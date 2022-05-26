const express = require('express');
const router = express.Router();
const adminController = require('../controller/AdminController')
const siteController = require('../controller/SiteController')
const middlewareController = require('../controller/MiddlewareController')

// const bcrypt = require('bcrypt')
// const salt = bcrypt.genSaltSync(10)
// const hashPass = bcrypt.hashSync('123456', salt)
// console.log(hashPass)
//cac yeu cau tu 17 -> 21
router.get('/pending', adminController.pendingAccounts)
router.get('/fulfilled', adminController.fulfilledAccounts)
router.get('/rejected', adminController.rejectedAccounts)
router.get('/lock', adminController.lockedAccounts)

router.get('/',  middlewareController.renderAdmin, siteController.activated);
router.get('/deactivated', middlewareController.renderAdmin, siteController.deactivated);
router.get('/waiting', middlewareController.renderAdmin, siteController.waiting);
router.get('/ban', middlewareController.renderAdmin, siteController.ban);
router.get('/search/:id', middlewareController.renderAdmin, siteController.getAccount)

//22 xu li tai khoan dang cho duyet
router.put('/requireCertificate', adminController.requireCertificate)
router.put('/deactivateAccount', adminController.deactivateAccount)
router.put('/activateAccount', adminController.activateAccount)

//24 -> 26
router.get('/admin_transfer', middlewareController.renderAdmin, siteController.transfer)
router.get('/admin_withdraw', middlewareController.renderAdmin, siteController.withdraw)

router.get('/render_transfer', adminController.getTransferList)
router.put('/transfer_approvement', adminController.approveTransfer)

router.get('/render_withdraw', adminController.getWithdrawList)
router.put('/withdraw_approvement', adminController.approveWithdraw)

module.exports = router;
