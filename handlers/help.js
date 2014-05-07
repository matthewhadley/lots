var fs = require('fs');
var path = require('path');
var marked = require('marked');

var data = fs.readFileSync(path.join(__dirname, '../README.md'), 'utf8');
// remove leading H1 with travis info
data = data.split('\n');
data.shift();
data = data.join('\n');
var content = marked(data);

exports.page = function(request, reply){
  reply.view('help', {content: content});
};
