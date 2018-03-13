var router = require('express').Router();
const { Vehicle, VehiclePosition } = require('../models/');
var async = require('async');

router.get('/', function(req, res, next) {
  req.models.vehicle.find({}, (err, results) => {
    if(err) throw err;
    
    res.send(results);
  });
})

router.get('/test', function(req, res, next) {
  req.models.vehicle.create({
    name: 'A',
    vehicleType: 'Bus'
  }, (err, msg) => {
    if (err) throw err;

    let createPositions = [];
    for(var i = 0; i < 10; i++) {
      createPositions.push(function(cb) {
        req.models.vehiclePosition.create({
          x: Math.random() * 10,
          y: Math.random() * 10,
          k: 1,
          vehicle_id: msg.id
        }, cb);
      });
    }
    async.series(createPositions, function(err, results) {
      if(err) throw err;
      res.send(results);
    });
  });
})

module.exports = router;