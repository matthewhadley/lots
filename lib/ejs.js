'use strict';

// var moment = require('moment');

var ejs;
// module format detection needed here to have different ejs
// lib available clientside with browserify build
if (typeof window !== 'undefined') {
  ejs = window.ejs;
} else {
  ejs = require('ejs');
}

module.exports = ejs;
