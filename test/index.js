'use strict';

var test = require('tape');
var path = require('path');
var lots = require('../lib/lots');

var config = {
  todos: true,
  directory: path.join(process.cwd(), 'test', 'data')
};

console.log(config);

var expected = {
  tickets: [{
    id: 0,
    file: 'index.js',
    line: '3',
    comment: ' Make this useful ',
    tag: 'documentation',
    priority: '2',
    number: 1,
    order: 1,
    count: 1
  }, {
    id: 1,
    file: 'readme.md',
    line: '3',
    comment: 'TODO: add the dummy data (not really)',
    tag: 'TODO',
    priority: undefined,
    number: 1,
    order: 2,
    count: 1
  }],
  total: {
    tickets: 2,
    tags: 2
  },
  tags: ['documentation', 'TODO']
};

test('finds lots tickets', function (t) {
  t.plan(2);
  lots(config).generate(function (err, res) {
    if (err) {
      t.fail(err);
    }
    t.equal(res.total.tickets, expected.total.tickets, 'finds all tickets');
    t.equal(res.total.tags, expected.total.tags, 'finds all tags (including todos)');
  });
});
