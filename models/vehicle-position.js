const Sequelize = require('sequelize');
const sequelize = require('./db');

module.exports = sequelize.define('vehiclePosition', {
  x: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  y: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  k: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  posDate: {
    type: Sequelize.DATE,
    allowNull: false
  }
});