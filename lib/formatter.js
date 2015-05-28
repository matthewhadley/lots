'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var sep = {
  l: process.stdout.isTTY ? ' ' : '[',
  r: process.stdout.isTTY ? ' ' : ']'
};

function priority(p) {
  switch (p) {
    case 0:
    case 1:
      return chalk.bgRed.white(sep.l + p + sep.r);
    case 2:
    case 3:
      return chalk.bgWhite.black(sep.l + p + sep.r);
    case 4:
    case 5:
      return chalk.bgWhite.gray(sep.l + p + sep.r);
    default:
      return chalk.bgWhite.gray(sep.l + '-' + sep.r);
  }
}

function sortTickets(tickets) {
  return _.sortByAll(tickets, ['priority', function(ticket){
    return ticket.comment.toLowerCase();
  }, function(ticket){
    return ticket.file.toLowerCase();
  }, function(ticket){
    return ticket.line;
  }]);
}

exports.none = function(opts, data) {
  sortTickets(data.tickets).map(function(ticket) {
    console.log(priority(ticket.priority) + ' ' + ticket.comment + chalk.gray(' #' + ticket.tag) + ' ' + ticket.file + ':' + ticket.line);
  });
};

exports.file = function(opts, data) {
  var grouped = _.groupBy(data.tickets, 'file');
  _.each(_.sortBy(_.keys(grouped), function(filename) {
    return filename.toLowerCase();
  }), function(filename) {
    console.log(chalk.underline(filename));
    _.map(sortTickets(grouped[filename]), function(ticket) {
      console.log(priority(ticket.priority) + ' ' + ticket.comment + chalk.gray(' #' + ticket.tag) + ' ' + ticket.file + ':' + ticket.line);
    });
  });
};

exports.tag = function(opts, data) {
  var grouped = _.groupBy(data.tickets, 'tag');
  _.each(_.keys(grouped).sort(), function(tag) {
    console.log(chalk.gray('#' + tag));
    _.map(sortTickets(grouped[tag]), function(ticket) {
      console.log(priority(ticket.priority) + ' ' + ticket.comment + ' ' + chalk.gray(ticket.file + ':' + ticket.line));
    });
  });
};
