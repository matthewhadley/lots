var fs = require('fs');
var path = require('path');
var hifile = require('hifile');
var LOTS = require('../lib/lots');
var marked = require('marked');
var helpMarkup;

exports.cache = function(req, res) {
  var lots = LOTS(req.app.locals.config);
  lots.cached(function(err, data){
    if(!data){
      lots.generate(function(err, data) {
        res.render('lots', data);
      });
    } else {
      res.render('lots', data);
    }
  });
};

exports.lots = function(req, res){
  var lots = LOTS(req.app.locals.config);
  lots.generate(function(err, data) {
    res.render('lots', data);
    lots.log();
  });
};

exports.hifile = function(req, res){
  var file = req.params[0].split('/');
  file.shift();
  file = file.join('/');
  fs.readFile(path.join(req.app.locals.config.directory, file), 'utf8', function(err, data){
    var code = hifile(data, path.extname(file).substring(1));
    res.render('hifile', {file: req.params[0], hifile: code});
  });
};

