var router = require('express').Router()

router.use('/vehicle', require('./vehicle'));
router.use('/stops', require('./stops'));

module.exports = router