const sequelize = require("../models/db");
require("../models/");

sequelize.authenticate().then(() => {
    console.log("syncing...");
    sequelize.sync({force: true});
    console.log("done");
});