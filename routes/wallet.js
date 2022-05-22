const express = require('express');
const router = express.Router();
const walletController = require('../controller/WalletController');
const rechargeValidator = require('../validators/rechargeValidator');
const transferValidator = require('../validators/transferValidator')
const middlewareController = require('../controller/MiddlewareController')

router.post('/recharge', rechargeValidator, walletController.recharge);
router.post('/transfer', transferValidator, walletController.transfer);
router.get('/transfer/:PIN', walletController.checkPin)
router.post('/add', walletController.add);
router.post('/addOTP', walletController.createOTP)
module.exports = router;
