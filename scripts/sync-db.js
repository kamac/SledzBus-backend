var orm = require("orm");
var async = require("async");
var models = require("../models");

models((err, db) => {
  if (err) throw err;

  async.series([
    function(callback) {
      db.drop((err) => {
        if(err) throw err;
        callback(null);
      });
    },
    function(callback) {
      db.sync((err) => {
        if(err) throw err;
        db.close();
        callback(null);
      });
    }
  ]);
});