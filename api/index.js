var router = require('express').Router()

router.use('/bus', require('./bus'));
router.use('/stops', require('./stops'));

module.exports = router