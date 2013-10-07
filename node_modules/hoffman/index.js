"use strict";

var fs = require('fs'),
    path = require('path'),
    duster = require('duster'),
    dust = duster.dust,
    views;

dust.onLoad = function (template, cb) {
  // if no extname then handling a partial, figure out the full path
  if (path.extname(template) !== '.dust') {
    template = path.join(views, template) + '.dust';
  }
  // read the template off disk
  fs.readFile(template, 'utf8', function(err, data){
    if (err) {
      return cb(err);
    }
    cb(err, data);
  });
};

function extend(a, b) {
  for (var x in b) {
    a[x] = b[x];
  }
}

function clearCacheCheck(clear){
  if (clear === undefined || clear === false) {
    dust.cache = {};
  }
}

module.exports = {
  __express: function() {
    return function(template, options, cb){
      if (!views) {
        views = options.settings.views;
      }
      template = path.relative(views, template).slice(0, -5);
      dust.render(template, options, function(err, output){
        if (err) {
          return cb(err);
        }
        clearCacheCheck(options.settings["view cache"]);
        cb(err, output);
      });
    };
  },
  stream: function(req, res, next) {
    res.stream = function(template, data, cb){
      // flatten and add app and res locals data
      var options = {}, stream;
      extend(options, res.app.locals);
      extend(options, res.locals);
      extend(options, data);

      if (!views) {
        views = req.app.settings.views;
      }
      stream = dust.stream(template, options);
      if (cb) {
        cb(stream);
      } else {
        stream.on('data', function(chunk) {
          if (chunk) {
            res.write(chunk);
          }
        })
        .on('end', function() {
          res.end();
          clearCacheCheck(req.app.settings["view cache"]);
        })
        .on('error', function(err) {
          next(err);
        });
      }
    };
    next(null, req, res);
  },
  prime: function(views) {
    duster.prime(views);
  },
  dust: duster.dust
};
