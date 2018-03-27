const express = require('express');
const sequelize = require('./models/db');
const settings = require('./settings');
const updates = require('./mpk-update');
const app = express();

if (settings.isDebug) {
  // development error handler
  // will print stacktrace
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  })
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({'errors': {
      message: err.message,
      error: {}
    }});
  })
}

app.use(require('./api'));

sequelize.authenticate().then(() => {
  updates();
  app.listen(settings.port, () => console.log(`It's running on port ${settings.port}!`));
}, (err) => {
  console.error(err);
});