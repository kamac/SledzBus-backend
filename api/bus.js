var router = require('express').Router();
const async = require('async');
const { Vehicle, VehiclePosition } = require('../models/');
const { Op } = require('sequelize');
var moment = require('moment');

router.get('/', function(req, res, next) {
  VehiclePosition.findAll({
    where: {
      createdAt: {
        [Op.gte]: moment().subtract(1, 'minutes').toDate()
      }
    },
    order: [
      ['posDate', 'DESC']
    ]
  }).then((vehiclePositions) => {
    let vehicleIds = [];
    for(let i = 0; i < vehiclePositions.length; i++) {
      if(vehicleIds.indexOf(vehiclePositions[i].VehicleId) === -1) {
        vehicleIds.push(vehiclePositions[i].VehicleId);
      }
    }
    Vehicle.findAll({
      where: {
        id: {
          [Op.in]: vehicleIds
        }
      }
    }).then(vehicles => {
      let answer = vehicles.map(v => { return {
        name: v.name,
        model: v.model,
        positions: vehiclePositions.filter(p => p.VehicleId == v.id).map(p => { return {
          x: p.x,
          y: p.y,
          posDate: p.posDate
        }})
      }});
      res.send(answer);
    })
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