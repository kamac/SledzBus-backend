const Sequelize = require('sequelize');
const sequelize = require('./db');
const VehiclePosition = require('./vehicle-position');

const Vehicle = sequelize.define('Vehicle', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
        len: [1,100]
    }
  },
  vehicleType: {
    type: Sequelize.ENUM('Bus', 'Tram'),
    allowNull: false
  }
});

Vehicle.hasMany(VehiclePosition, {as: 'positions'});

module.exports = Vehicle;