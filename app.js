const express = require('express');
const db = require('orm');
const settings = require('./settings');
const models = require('./models');

const app = express();

// inject database & models into every request
app.use(function (req, res, next) {
  models(function (err, db) {
    if (err) return next(err);

    req.models = db.models;
    req.db     = db;

    return next();
  });
});

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

app.listen(3000, () => console.log("It's running on port 3000!"));