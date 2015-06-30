'use strict';

var LOTS = require('../lib/lots');
var tickets = require('../lib/tickets');

// !maybe be able to sort/group on web interface, same as cli #refactor
exports.cache = function(request, reply) {
  var lots = LOTS(request.server.settings.app);
  lots.cached(function(cacheErr, cacheData) {
    if (!cacheErr && cacheData) {
      cacheData.cached = true;

      cacheData.tickets = tickets.tag({
        cli: false
      }, cacheData);

      return reply.view('lots', {
        lots: cacheData
      });
    } else {
      lots.generate(function(generateErr, generateData) {
        if (generateErr) {
          reply.view('error');
        }

        generateData.tickets = tickets.tag({
          cli: false
        }, generateData);

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

    data.tickets = tickets.tag({
      cli: false
    }, data);

    reply.view('lots', {
      lots: data
    });
    lots.log();
  });
};
