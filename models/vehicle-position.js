module.exports = function(orm, db) {
  var VehiclePosition = db.define("vehiclePosition", {
    x: { type: 'number', required: true, size: 8 },
    y: { type: 'number', required: true, size: 8 },
    k: { type: 'integer', required: true },
    posDate: { type: 'date', required: true }
  }, {
    hooks: {
      beforeValidation: function () {
        this.posDate = new Date();
      }
    }
  });

  VehiclePosition.hasOne('vehicle', db.models.vehicle, { required: true, reverse: 'positions' });
}