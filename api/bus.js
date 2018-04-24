var router = require('express').Router();
const async = require('async');
const { Vehicle, VehiclePosition } = require('../models/');
const { Op } = require('sequelize');
var moment = require('moment');

async function getBusList(req, res, next, selectedId) {
  try {
    let vehiclePositions = await VehiclePosition.findAll({
      where: {
          [Op.or]: [
            {
              createdAt: {
                [Op.gte]: moment().subtract(5, 'minutes').toDate()
              },
              VehicleId: {
                [Op.eq]: selectedId
              }
            },
            {
              createdAt: {
                [Op.gte]: moment().subtract(20, 'seconds').toDate()
              },
              VehicleId: {
                [Op.ne]: selectedId
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
}

router.get('/:id', (req, res, next) => {
  getBusList(req, res, next, req.params.id);
});

router.get('/', (req, res, next) => {
  getBusList(req, res, next, -1);
});

module.exports = router;