const express = require('express');
const router = express.Router();
const adminController = require('../controller/AdminController')
const siteController = require('../controller/SiteController')

router.get('/pending', adminController.pendingAccounts)
router.get('/fulfilled', adminController.fulfilledAccounts)
router.get('/rejected', adminController.rejectedAccounts)
router.get('/activated', siteController.activated);
router.get('/deactivated', siteController.deactivated);
router.get('/waiting', siteController.waiting);
router.get('/ban', siteController.ban);
router.get('/search/:id', siteController.getAccount)
router.get('/', siteController.index);

module.exports = router;
