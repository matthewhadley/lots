var assert = require('chai').assert;
var LOTS = require('../../lib/lots');
var path = require('path');
var mkdirp = require('mkdirp');

var config = {
  todos: true,
  cache: path.join(process.cwd(), 'test', 'tmp'),
  directory: path.join(process.cwd(), 'test', 'data'),
  exclude: ''
};

mkdirp.sync(config.cache);

var expected = { tickets:
   [ { id: 0,
       file: 'index.js',
       line: '3',
       comment: ' Make this useful ',
       tag: 'documentation',
       priority: '2',
       number: 1,
       order: 1,
       count: 1 },
     { id: 1,
       file: 'readme.md',
       line: '3',
       comment: 'TODO: add the dummy data (not really)',
       tag: 'TODO',
       priority: undefined,
       number: 1,
       order: 2,
       count: 1 } ],
  total: { tickets: 2, tags: 2 },
  tags: [ 'documentation', 'TODO' ]
};

var lots = LOTS(config);

describe('lots generation', function () {
  it('should find all tickets and tags', function (done) {
    lots.generate(function(err, res){
      assert.equal(res.total.tickets, expected.total.tickets, 'finds all tickets');
      assert.equal(res.total.tags, expected.total.tags, 'finds all tags (including todos)');
      done();
    });
  });
});
