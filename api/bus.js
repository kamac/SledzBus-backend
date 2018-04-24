var router = require('express').Router();
const async = require('async');
const { Vehicle, VehiclePosition } = require('../models/');
const { Op } = require('sequelize');
var moment = require('moment');

router.get('/:id?', async (req, res, next) => {
  if(req.params.id)
    res.params.id = parseInt(req.params.id);
  else
    req.params.id = -1;

  try {
    let vehiclePositions = await VehiclePosition.findAll({
      where: {
          [Op.or]: [
            {
              createdAt: {
                [Op.gte]: moment().subtract(10, 'minutes').toDate()
              },
              VehicleId: {
                [Op.eq]: req.params.id
              }
            },
            {
              createdAt: {
                [Op.gte]: moment().subtract(40, 'seconds').toDate()
              },
              VehicleId: {
                [Op.ne]: req.params.id
              }
            }
          ]
      },
      order: [
        ['posDate', 'DESC']
      ]
    });

    let vehicleIds = [];
    for(let i = 0; i < vehiclePositions.length; i++) {
      if(vehicleIds.indexOf(vehiclePositions[i].VehicleId) === -1) {
        vehicleIds.push(vehiclePositions[i].VehicleId);
      }
    }
    let vehicles = await Vehicle.findAll({
      where: {
        id: {
          [Op.in]: vehicleIds
        }
      }
    });

    let answer = vehicles.map(v => { return {
      id: v.id,
      name: v.name,
      model: v.model,
      positions: vehiclePositions.filter(p => p.VehicleId == v.id).map(p => { return {
        x: p.x,
        y: p.y,
        posDate: p.posDate
      }})
    }});
    res.send(answer);
  } catch (e) {
    next(e);
  }
});

module.exports = router;