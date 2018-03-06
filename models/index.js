var orm = require('orm');
var settings = require('../settings');

var connection = null;

module.exports = function (cb) {
    if (connection)
        return cb(null, connection);

    let dbs = settings.database;
    let dbUri = `${dbs.protocol}://${dbs.user}:${dbs.password}@${dbs.host}/${dbs.name}`;
    orm.connect(dbUri, function (err, db) {
        if (err)
            return cb(err);

        connection = db;
        db.settings.set('instance.returnAllErrors', true);
        
        require('./vehicle')(orm, db);
        require('./vehicle-position')(orm, db);

        cb(null, connection)
    });
}