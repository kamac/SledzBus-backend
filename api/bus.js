var router = require('express').Router()

router.get('/', function(req, res, next) {
  res.json([
    {
      id: 0,
      name: 'A',
      x: 55,
      y: 55
    },
    {
      id: 1,
      name: 'A',
      x: 55,
      y: 55
    },
  ])
})

module.exports = router;