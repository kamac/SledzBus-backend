var router = require('express').Router();
const async = require('async');
const { Vehicle, VehiclePosition } = require('../models/');
const { Op } = require('sequelize');

router.get('/', function(req, res, next) {
  Vehicle.findAll({
    include: [{
      model: VehiclePosition,
      attributes: ['x', 'y', 'posDate'],
      as: 'positions'
    }],
    order: [
     [Vehicle.associations.positions, 'posDate', 'DESC']
    ]
  }).then((vehicles) => {
    res.send(vehicles);
  });
});

/*router.get('/test', function(req, res, next) {
  // destroy all vehicles
  Vehicle.destroy({ where: {} });

  // create a new vehicle, then fill it's positions with 10 random positions
  Vehicle.create({
    name: 'A',
    vehicleType: 'Bus'
  }).then(v => {
    async.series(Array(10).fill(null).map(x => (callback) => {
      VehiclePosition.create({
        x: Math.random() * 10,
        y: Math.random() * 10,
        posDate: new Date()
      }).then((p) => callback(null, p), (err) => callback(err));
    }), (err, results) => {
      v.setPositions(results).then(() => res.send(v));
    });
  });
})*/

module.exports = router;