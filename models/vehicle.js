module.exports = function(orm, db) {
  var Vehicle = db.define("vehicle", {
    name: { type: 'text', required: true },
    vehicleType: { type: "enum", values: ['Bus', 'Tram'], required: true }
  }, {
    validations: {
      name: orm.enforce.ranges.length(1, 100)
    }
  });
}