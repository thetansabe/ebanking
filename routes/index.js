var express = require('express');
var router = express.Router();

const middlewareController = require('../controller/MiddlewareController');
const siteController = require('../controller/SiteController');

/* GET home page. */
router.get('/', middlewareController.renderUnAuth, async function(req, res, next) {
  return res.render('dashboard');
});

router.get('/profile', middlewareController.renderUnAuth, function(req, res, next) {
  res.render('profile');
});

router.get('/transfer', middlewareController.renderUnAuth, (req, res) => {
  res.render('transfer')
})

router.get('/buy_cards', middlewareController.renderUnAuth, (req, res) => {
  res.render('buy_cards')
})

router.get('/deposit_withdraw', middlewareController.renderUnAuth, (req, res) => {
  res.render('deposit_withdraw')
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
