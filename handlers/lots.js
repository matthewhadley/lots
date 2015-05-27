'use strict';

var LOTS = require('../lib/lots');

exports.cache = function(request, reply) {
  var lots = LOTS(request.server.settings.app);
  lots.cached(function(cacheErr, cacheData) {
    if (!cacheErr && cacheData) {
      cacheData.cached = true;
      return reply.view('lots', {
        lots: cacheData
      });
    } else {
      lots.generate(function(generateErr, generateData) {
        if (generateErr) {
          reply.view('error');
        }
        reply.view('lots', {
          lots: generateData
        });
      });
    }
  });
};

exports.generate = function(request, reply) {
  var lots = LOTS(request.server.settings.app);
  lots.generate(function(err, data) {
    if (err) {
      return reply.view('error');
    }
    reply.view('lots', {
      lots: data
    });
    lots.log();
  });
};
