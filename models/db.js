const Sequelize = require('sequelize');
let settings = require('../settings');

let dbs = settings.database;

module.exports = new Sequelize(dbs.name, dbs.user, dbs.password, {
    host: dbs.protocol === 'sqlite' ? null : dbs.host,
    dialect: dbs.protocol,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },

    // SQLite only
    storage: './dev.sqlite',

    // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
    operatorsAliases: false
});