var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('dashboard');
});

router.get('/profile', function(req, res, next) {
  res.render('profile');
});

router.get('/transfer', (req, res) => {
  res.render('transfer')
})

module.exports = router;
