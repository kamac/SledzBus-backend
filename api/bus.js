var router = require('express').Router();
const { Vehicle, VehiclePosition } = require('../models/');

router.get('/', function(req, res, next) {
  Vehicle.findAll().then((results) => {
    res.send(results);
  });
})

router.get('/test', function(req, res, next) {
  Vehicle.create({
    name: 'A',
    vehicleType: 'Bus'
  }).then(v => {
    v.setPositions(Array(10).map(x => VehiclePosition.create({
      x: Math.random() * 10,
      y: Math.random() * 10,
      k: 1
    }))).then(() => res.send(v));
  });
})

module.exports = router;