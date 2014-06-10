'use strict';

var fs = require('fs');
var path = require('path');
var hifile = require('hifile');

exports.view = function(request, reply) {
  var file = request.params.file.split('/');
  file.shift();
  file = file.join('/');
  fs.readFile(path.join(request.server.settings.app.directory, file), 'utf8', function(err, data) {
    if (err) {
      return reply.view('error');
    }
    var code = hifile(data, path.extname(file).substring(1));
    reply.view('hifile', {
      file: request.params.file,
      hifile: code
    });
  });
};
