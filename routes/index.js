var lots = require('../handlers/lots');
var help = require('../handlers/help');
var hifile = require('../handlers/hifile');

module.exports = [{
  method: 'GET',
  path: '/favicon.ico',
  handler: {
    file: './public/img/lots.png'
  }
}, {
  method: 'GET',
  path: '/',
  config: {
    handler: lots.cache
  }
}, {
  method: 'GET',
  path: '/lots',
  config: {
    handler: lots.generate
  }
}, {
  method: 'GET',
  path: '/help',
  config: {
    handler: help.page
  }
}, {
  method: 'GET',
  path: '/view/{file*}',
  config: {
    handler: hifile.view
  }
}];
