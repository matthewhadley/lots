'use strict';

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var moment = require('moment');
var cachedLots = {};

function buildTickets(stdout, data, forceTag) {
  var match, file, line, entry, comment, tag, priority, i, matches;
  data = data || {
    tagGroup: [],
    ticketList: []
  };
  matches = stdout.split('\n');
  matches.pop();
  for (i in matches) {
    match = matches[i].split(':');
    file = match[0];
    line = match[1];
    match.splice(0, 2);
    entry = match.join(':');
    if (forceTag) {
      comment = entry;
      tag = forceTag;
      priority = undefined;
    } else {
      comment = entry.match(/!.*#/);

      if (comment) {
        comment = comment[0].substring(1, comment[0].length - 1);
      }
      tag = entry.match(/#[a-zA-Z0-9\-\_]+/);
      if (tag) {
        tag = tag[0].substring(1);
      }
      priority = entry.match(/\^[0-9]+/);
      if (priority) {
        priority = priority[0].substring(1);
      }
    }

    // ! make this configuration #todo
    // Only use comments that are less than 300 chars.
    // This is in an imperfect attempt to avoid including minified
    // files that might contain the pattern match
    if (tag && comment && comment.length < 300) {
      if (data.tagGroup[tag] === undefined) {
        data.tagGroup[tag] = [];
      }
      data.tagGroup[tag].push(data.ticketList.length);
      data.ticketList[data.ticketList.length] = {
        'id': data.ticketList.length,
        'file': file,
        'line': line,
        'comment': comment,
        'tag': tag,
        'priority': priority
      };
    }
  }
  return data;
}

// ### Grep the filesystem for strings to build tickets from
// Grep the file system for tags and, optionally, for _"TODO"_s (which are then assigned the _TODO_ tag).
// Then build a **LOTS** object from the tickets.
// The search is a series of piped greps which improves performance over a single grep
function searchTickets(directory, exclude, todos, cb) {
  // var cmd = 'cd ' + directory +';grep -H -n -R -I "\\!" * ' + exclude + ' | grep "#" | grep "\\^[0-9]"'; // makes priority required
  var cmd = 'cd ' + directory + ';grep -H -n -R -I "\\!" * ' + exclude + ' | grep "#"';
  var opts = {
    maxBuffer: 2000 * 1024
  };
  exec(cmd, opts, function(err, stdout, stderr) {
    if (err) {
      return cb('error searching for tickets: ' + err, null);
    }
    if (stderr) {
      return cb('error searching for tickets: ' + stderr, null);
    }
    var data = buildTickets(stdout);
    if (todos) {
      exec('cd ' + directory + ';grep -H -n -R -I TODO * ' + exclude, function(err, stdout, stderr) {
        if (err) {
          return cb('error searching for tickets ' + err, null);
        }
        if (stderr) {
          return cb('error searching for todos ' + stderr, null);
        }
        data = buildTickets(stdout, data, 'TODO');
        cb(null, data);
      });
    } else {
      cb(null, data);
    }
  });
}

function cache(data, cacheFile) {
  data.cacheDate = moment().format('YYYY-MM-DD HH:mm:ss');
  cachedLots[cacheFile.split('/').pop()] = data;
  fs.writeFile(cacheFile, JSON.stringify(data), function(err) {
    if (err) {
      throw err;
    }
  });
}

module.exports = function LOTS(opts) {
  var cacheKey = require('crypto').createHash('md5').update(opts.directory + opts.exclude + opts.todos).digest('hex');
  var cacheFile = path.join(opts.cache, cacheKey);
  var startTime = Date.now();
  var report = moment().format('YYYY-MM-DD HH:mm:ss');
  var lots = {};

  return {
    cacheFile: cacheFile,
    log: function() {
      console.log(report);
      var tags = '';
      if (lots.tags.length) {
        tags = ' ' + lots.tags.join(', ');
      }
      console.log('tickets:', lots.total.tickets, '  tags:', lots.total.tags, tags);
    },
    cached: function cached(cb) {
      if (cachedLots[cacheKey]) {
        return cb(null, cachedLots[cacheKey]);
      }
      fs.exists(cacheFile, function(exists) {
        if (exists) {
          fs.readFile(cacheFile, 'utf-8', function(err, cache) {
            if (err || cache === '') {
              cb(null, undefined);
            } else {
              try {
                cache = JSON.parse(cache);
                cb(null, cache);
              } catch (e) {
                console.log(e);
                cb(e);
              }
            }
          });
        } else {
          cb(null);
        }
      });
    },
    generate: function generate(cb) {
      searchTickets(opts.directory, opts.exclude, opts.todos, function(err, data) {
        if (err) {
          return cb(err);
        }
        var tagGroup = data.tagGroup;
        var ticketList = data.ticketList;
        lots.basename = path.basename(opts.directory);
        lots.tickets = [];
        if (ticketList.length > 0) {
          var tag, currentTicket, n = 1;
          // Loop the tag groups.
          for (tag in tagGroup) {
            // loop the tickets in the tag group.
            var il = tagGroup[tag].length;
            for (var i = 0; i < il; i++) {
              currentTicket = ticketList[tagGroup[tag][i]];
              currentTicket.number = i + 1;
              currentTicket.order = n++;
              if (i === 0) {
                currentTicket.count = il;
              }
              if (currentTicket.priority) {
                lots.usingPriority = true;
              }
              lots.tickets.push(currentTicket);
            }
          }
        }
        lots.total = {};
        lots.total.tickets = lots.tickets.length;
        lots.total.tags = Object.keys(tagGroup).length;
        lots.tags = Object.keys(tagGroup);
        lots.generationTime = ((Date.now() - startTime) / 1000);

        cb(null, lots);
        // greps of large directory structures can
        // take some time so cache the results
        cache(lots, cacheFile);
      });
    }
  };
};
