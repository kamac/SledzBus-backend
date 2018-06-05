const Sequelize = require('sequelize');
const sequelize = require('./db');

const Route = sequelize.define('Route', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
        len: [1,100]
    }
  }
});

const Stop = sequelize.define('Stop', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
        len: [1,255]
    }
  },
  lat: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  lon: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
});

Stop.belongsToMany(Route, {through: 'RouteStop'});
Route.belongsToMany(Stop, {through: 'RouteStop'});

module.exports = { Route: Route, Stop: Stop };