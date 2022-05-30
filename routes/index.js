var express = require('express');
var router = express.Router();
const Wallet = require('../model/Wallet')
const Account = require('../model/Account')
const TransferHistory = require('../model/TransferHistory')
const jwt = require('jsonwebtoken')

const middlewareController = require('../controller/MiddlewareController');
const siteController = require('../controller/SiteController');

/* GET home page. */
router.get('/', middlewareController.renderUnAuth, async function(req, res, next) {
  const actor = req.cookies.refreshToken;
  let actorId = undefined;
  jwt.verify(actor, process.env.SECRET_JWT_REFRESH_KEY, (err, decoded) => {
    actorId = decoded.id
  })
  let filter = {
    userId: actorId,
  }
  await Wallet.findOne(filter)
  .then(async userWallet => {
    filter = {
      _id: actorId
    }
    await Account.findOne(filter)
    .then(acc => {
      return res.render('dashboard', {
        data: userWallet,
        user: acc,
      });
    })
  })
});

router.get('/profile', middlewareController.renderUnAuth, function(req, res, next) {
  res.render('profile');
});

router.get('/transfer', middlewareController.renderUnAuth, async (req, res) => {
  const actor = req.cookies.refreshToken;
  let actorId = undefined;
  jwt.verify(actor, process.env.SECRET_JWT_REFRESH_KEY, (err, decoded) => {
    actorId = decoded.id
  })
  let filter = {
    userId: actorId,
  }
  await Wallet.findOne(filter)
  .then(async userWallet => {
    filter = {
      _id: actorId,
    }
    await Account.findOne(filter)
    .then(acc => {
      return res.render('transfer', {
        data: userWallet,
        user: acc,
      });
    })
  })
})

router.get('/buy_cards', middlewareController.renderUnAuth, async (req, res) => {
  const actor = req.cookies.refreshToken;
  let actorId = undefined;
  jwt.verify(actor, process.env.SECRET_JWT_REFRESH_KEY, (err, decoded) => {
    actorId = decoded.id
  })
  let filter = {
    _id: actorId,
  }
  await Account.findOne(filter)
  .then(acc => {
    res.render('buy_cards', {
      data: acc
    })
  })
})

router.get('/deposit_withdraw', middlewareController.renderUnAuth, async (req, res) => {
  const actor = req.cookies.refreshToken;
  let actorId = undefined;
  jwt.verify(actor, process.env.SECRET_JWT_REFRESH_KEY, (err, decoded) => {
    actorId = decoded.id
  })
  var today = new Date();
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  var tdd = String(tomorrow.getDate()).padStart(2, '0');
  var tmm = String(tomorrow.getMonth() + 1).padStart(2, '0'); //January is 0!
  var tyyyy = tomorrow.getFullYear();

  let filter = {
    actor: actorId,
    createdAt: {
      $gte: `${yyyy}-${mm}-${dd}`,
      $lte: `${tyyyy}-${tmm}-${tdd}`
    },
    transferType: '2',
    $or: [
      {
        status: '1',
      },
      {
        status: '0'
      }
    ]
  }
  await TransferHistory.find(filter)
  .then(async data => {
    filter = {
      userId: actorId,
    }
    await Wallet.find(filter)
    .then(wallet => {
      res.render('deposit_withdraw', {
        data: wallet[0],
        withdrawCount: data.length
      })
    })
  })
})

router.post('/search/:phone', siteController.search)


////
router.get('/login', (req, res) => {
  res.render('login', {layout: 'outside_lay'})
})

router.get('/register', (req, res) => {
  res.render('register', {layout: 'outside_lay'})
})

router.get('/forget_pass', (req, res) => {
  res.render('forget_pass', {layout: 'outside_lay'})
})

router.get('/change_pass', (req, res) => {
  res.render('change_pass', {layout: 'outside_lay'})
})

router.get('/first_change', (req, res) => {
  res.render('first_change', {layout: 'outside_lay'})
})
module.exports = router;
