const sequelize = require("../models/db");
const parse = require("csv-parse/lib/sync");
const fs = require("fs");
const path = require("path");
const { Stop, Route } = require('../models/');
const { Op } = require('sequelize');

if(process.argv.length < 3) {
  console.log("USAGE: node load-routes.js path_to_data_folder");
  console.log("where data folder is an unpacked .zip containing routes.txt and stops.txt");
  console.log("data can be obtained from: https://www.wroclaw.pl/open-data/dataset/rozkladjazdytransportupublicznegoplik_data");
  process.exit();
}

const args = process.argv.slice(2);

function load_data() {
  const routes = parse(fs.readFileSync(path.join(args[0], 'routes.txt')), { columns: true });
  const stops = parse(fs.readFileSync(path.join(args[0], 'stops.txt')), { columns: true });
  const trips = parse(fs.readFileSync(path.join(args[0], 'trips.txt')), { columns: true });
  const stopTimes = parse(fs.readFileSync(path.join(args[0], 'stop_times.txt')), { columns: true });

  stops.forEach(stop => {
    stop['stop_name'] = stop['stop_name'].trim().toLowerCase();
  });

  return {
    stops: stops.map((stop) => {
      return {
        id: stop['stop_id'],
        name: stop['stop_name'],
        lat: stop['stop_lat'],
        lon: stop['stop_lon']
      }
    }),
    routes: routes.map((route) => {
      // you don't wanna know (doing some joins to get from trips to stopTimes to stop names)
      const routeTripIds = trips.filter(t => t['route_id'] == route['route_id']).map(t => t['trip_id']);
      const stopIds = stopTimes.filter(time => routeTripIds.includes(time['trip_id'])).map(time => time['stop_id']);
      return {
        name: route['route_short_name'].trim().toLowerCase(),
        stops: Array.from(new Set(stopIds))
      }
    })
  }
};

const data = load_data();

sequelize.authenticate().then(() => {
  // create all stops
  console.log("creating stops (" + data.stops.length + ")");
  data.stops.forEach(stop => {
    Stop.create(stop);
  });

  // create all routes
  console.log("creating routes (" + data.routes.length + ")");
  data.routes.forEach(route => {
    Route.create({ name: route['name'] }).then(route_db => {
      Stop.findAll({
        where: { id: { [Op.in]: route['stops'] } }
      }).then(stops_db => {
        console.log("found " + stops_db.length + " associations of " + route['stops'].length);
        route_db.setStops(stops_db);
      });
    });
  });
});