const express = require('express');
const router = express.Router();
const walletController = require('../controller/WalletController');
const rechargeValidator = require('../validators/rechargeValidator');
const transferValidator = require('../validators/transferValidator')
const middlewareController = require('../controller/MiddlewareController')

router.post('/recharge', rechargeValidator, walletController.recharge);
router.post('/transfer', transferValidator, walletController.transfer);
router.get('/transfer/:PIN', middlewareController.verifyForTransfer, walletController.something)
router.post('/add', walletController.add);

module.exports = router;
