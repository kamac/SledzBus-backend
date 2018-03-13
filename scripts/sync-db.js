const sequelize = require("../models/db");
require("../models/");

sequelize.authenticate().then(() => {
    sequelize.sync({force: true});
});