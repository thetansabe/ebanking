const express = require('express');
const router = express.Router();
const walletController = require('../controller/WalletController');
const rechargeValidator = require('../validators/rechargeValidator');
const withdrawValidator = require('../validators/withdrawValidator')
const transferValidator = require('../validators/transferValidator')
const middlewareController = require('../controller/MiddlewareController')

router.post('/recharge', rechargeValidator, walletController.recharge);
router.post('/withdraw', withdrawValidator, walletController.withdraw);
router.post('/transfer', transferValidator, walletController.transfer);
router.post('/transferwithpin', walletController.checkPin)
router.post('/purchasePhoneCard', walletController.purchasePhoneCard)
router.post('/add', walletController.addPhoneCard);
router.post('/addOTP', walletController.createOTP)
module.exports = router;
