var router = require('express').Router();
const async = require('async');
const { Vehicle, VehiclePosition } = require('../models/');

router.get('/', function(req, res, next) {
  Vehicle.findAll().then((vehicles) => {
    res.send(vehicles);
  });
})

router.get('/test', function(req, res, next) {
  Vehicle.destroy({ where: {} });

  Vehicle.create({
    name: 'A',
    vehicleType: 'Bus'
  }).then(v => {
    async.series(Array(10).fill(null).map(x => (callback) => {
      VehiclePosition.create({
        x: Math.random() * 10,
        y: Math.random() * 10,
        k: 1,
        posDate: new Date()
      }).then((p) => callback(null, p), (err) => callback(err));
    }), (err, results) => {
      v.setPositions(results).then(() => res.send(v));
    });
  });
})

module.exports = router;