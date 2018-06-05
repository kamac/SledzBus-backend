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
  return {
    stops: stops.map((stop) => {
      return {
        name: stop['stop_name'].trim().toLowerCase(),
        lat: stop['stop_lat'],
        lon: stop['stop_lon']
      }
    }),
    routes: routes.map((route) => {
      return {
        name: route['route_short_name'].trim().toLowerCase(),
        stops: route['route_desc'].toLowerCase().split(/\s\-\s/)
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
        where: { name: { [Op.in]: route['stops'] } }
      }).then(stops_db => {
        console.log("found " + stops_db.length + " associations of " + route['stops'].length);
        route_db.setStops(stops_db);
      });
    });
  });
});