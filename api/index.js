var router = require('express').Router()

router.use('/bus', require('./bus'));

module.exports = router