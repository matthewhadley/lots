'use strict';

var marked = require('marked');
var path = require('path');
var fs = require('fs');
var ejs = require('ejs');
var mkdirp = require('mkdirp').sync;

var renderer = new marked.Renderer();
// don't add ids to headings
renderer.heading = function(text, level) {
  return '<h' + level + '>' + text + '</h' + level + '>';
};

module.exports = function(gulp, conf) {

  gulp.task('gh-pages', function(cb) {

    var data = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
    // remove leading H1 with travis info
    data = data.split('\n');
    data.shift();
    data.unshift('<h1>Little Open Ticket System</h1>\n');
    data = data.join('\n');
    var content = marked(data, {
      renderer: renderer
    });

    var tpl = fs.readFileSync(path.join(process.cwd(), 'templates', 'help.ejs'), 'utf8');
    var render = ejs.compile(tpl);

    mkdirp(path.join(__dirname, '..', '.gh-pages'));

    fs.writeFileSync(path.join(__dirname, '..', '.gh-pages', 'index.html'), render({
      ghpages: true,
      content: content
    }));

    fs.writeFileSync(path.join('public', 'help.html'), render({
      ghpages: false,
      content: content
    }));

    cb();

  });
};
