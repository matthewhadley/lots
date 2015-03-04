'use strict';

var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var split = require('split');
var moment = require('moment');
var cachedLots = {};

function buildTicket(stdout, forceTag) {
  var comment, tag, priority;
  var match = stdout.split(':');
  var file = match[0];
  var line = match[1];
  match.splice(0, 2);
  var entry = match.join(':');

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

    priority = entry.match(/\^/);
    if (priority) {
      priority = entry.match(/\^[0-9]+/);
      if (priority) {
        priority = priority[0].substring(1);
      } else {
        // skip tickets that have a non-numerical priority
        return;
      }
    }
  }

  // ! make this configuration #todo
  // Only recognize a ticket if the comment is less than 300 chars.
  // This is in an imperfect attempt to avoid including minified
  // files that might contain the pattern match
  if (tag && comment && comment.length < 300) {
    return {
      'file': file,
      'line': line,
      'comment': comment,
      'tag': tag,
      'priority': priority
    };
  }
}

// ### Grep the filesystem for strings to build tickets from
// Grep the file system for tags and, optionally, for _"TODO"_s (which are then assigned the _TODO_ tag).
// Then build a **LOTS** object from the tickets.
// The search is a series of piped greps which improves performance over a single grep
function searchTickets(directory, exclude, todos, cb) {
  // grep commands
  var cmd = {
    // tickets: 'grep -H -n -R -I "\\!" * ' + exclude + ' | grep "#" | grep "\\^[0-9]"'; // makes priority required
    tickets: 'grep -H -n -R -I "\\!" * ' + exclude + ' | grep "#"',
    todos: 'grep -H -n -R -I TODO * ' + exclude
  };
  // store tickets
  var data = {
    tagGroup: {},
    ticketList: []
  };
  // extract a ticket
  function addTicket(ticket) {
    if (ticket) {
      ticket.id = data.ticketList.length;
      data.tagGroup[ticket.tag] = data.tagGroup[ticket.tag] || [];
      data.tagGroup[ticket.tag].push(ticket.id);
      data.ticketList[ticket.id] = ticket;
    }
  }

  // start grepping
  var grep = {
    tickets: spawn('sh', ['-c', cmd.tickets], {
      cwd: directory
    })
  };
  grep.tickets.stdout.pipe(split())
    .on('data', function(ln) {
      addTicket(buildTicket(ln));
    })
    .on('error', function(err) {
      return cb('error searching for tickets ' + err, null);
    })
    .on('end', function() {
      // look for todos as well
      if (todos) {
        grep.todos = spawn('sh', ['-c', cmd.todos], {
          cwd: directory
        });
        grep.todos.stdout.pipe(split())
          .on('data', function(ln) {
            addTicket(buildTicket(ln, 'TODO'));
          })
          .on('error', function(err) {
            return cb('error searching for todos ' + err, null);
          })
          .on('end', function() {
            cb(null, data);
          });

        grep.todos.stderr.pipe(split()).on('data', function(ln) {
          if (ln) {
            return cb('error searching for todos ' + ln, null);
          }
        });
      } else {
        cb(null, data);
      }
    });

  grep.tickets.stderr.pipe(split()).on('data', function(ln) {
    if (ln) {
      return cb('error searching for tickets ' + ln, null);
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
          fs.readFile(cacheFile, 'utf-8', function(err, data) {
            if (err || data === '') {
              cb(null, undefined);
            } else {
              try {
                data = JSON.parse(data);
                cb(null, data);
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
