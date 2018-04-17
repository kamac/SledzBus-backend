var router = require('express').Router();
const async = require('async');
const { Vehicle, VehiclePosition } = require('../models/');
const { Op } = require('sequelize');
var moment = require('moment');

router.get('/', function(req, res, next) {
  VehiclePosition.findAll({
    where: {
      createdAt: {
        [Op.gte]: moment().subtract(10, 'minutes').toDate()
      }
    },
    order: [
      ['posDate', 'DESC']
    ]
  }).then((vehiclePositions) => {
    console.log(vehiclePositions);
    res.send(vehiclePositions);
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