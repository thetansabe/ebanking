const express = require('express');
const router = express.Router();
const adminController = require('../controller/AdminController')
const siteController = require('../controller/SiteController')

//cac yeu cau tu 17 -> 21
router.get('/pending', adminController.pendingAccounts)
router.get('/fulfilled', adminController.fulfilledAccounts)
router.get('/rejected', adminController.rejectedAccounts)
router.get('/activated', siteController.activated);
router.get('/deactivated', siteController.deactivated);
router.get('/waiting', siteController.waiting);
router.get('/ban', siteController.ban);
router.get('/search/:id', siteController.getAccount)
router.get('/', siteController.index);

//22 xu li tai khoan dang cho duyet
router.put('/requireCertificate', adminController.requireCertificate)
router.put('/deactivateAccount', adminController.deactivateAccount)
router.put('/activateAccount', adminController.activateAccount)

module.exports = router;
