var router = require('express').Router();
const { Route, Stop } = require('../models/');
const { Op } = require('sequelize');

async function getStopsList(req, res, next, routeName) {
  try {
    let route = await Route.findOne({ where: { name: routeName.toLowerCase() } });
    let stops = await route.getStops();
    res.send(stops.map(stop => { return {
      name: stop.name,
      lat: stop.lat,
      lon: stop.lon
    }}));
  } catch (e) {
    next(e);
  }
}

router.get('/:route', (req, res, next) => {
  getStopsList(req, res, next, req.params.route);
});

module.exports = router;