var assert = require('chai').assert,
    path = require('path');

var options = {
  "settings" : {
    "views" : __dirname + '/templates',
    "view cache" : false
  },
  "planet" : "world"
};

var req = { "app" : options },
    res = {
      "app" : { "locals" : {}},
      "locals" : {},
      "write" : function(chunk){
        assert.equal("hello world", chunk);
      },
      "end" : function(){}
    };

var hoffman = require('../index.js');
var render = hoffman.__express();
var views = __dirname + '/templates';
var templates = {
  "hello" : views + '/hello.dust',
  "main" : views + '/main.dust',
  "invalid" : "missing.dust"
};

// when a new hoffman instance is required
function newHoffman() {
  delete require.cache[path.join(__dirname, '../index.js')];
  hoffman = require('../index.js');
  render = hoffman.__express();
}

describe('Dust object', function(){
  it('should be available', function(){
    assert.typeOf(hoffman.dust, 'object', 'hoffman.dust is an object');
  });
});

describe('Dust templates', function(){
  it('should be loaded from disk', function(done){
    hoffman.dust.onLoad(templates.hello, function(err, str){
      assert.equal(str, 'hello {planet}', 'hello.dust templates is hello {planet}');
      done();
    });
  });
  it('should throw an error if cannot be loaded', function(done){
    hoffman.dust.onLoad(templates.invalid, function(err){
      assert.typeOf(err, 'object', 'err contains an error');
      done();
    });
  });
});

describe('Dust templates', function(){
  it('should be parsed into output', function(done){
    render(templates.hello, options, function(err, output){
      assert.equal("hello world", output);
      done();
    });
  });
  it('should dynamically include partials', function(done){
    render(templates.main, options, function(err, output){
      assert.equal("hello world", output);
      done();
    });
  });
  it('should throw an error if fail to render', function(done){
    render(templates.invalid, options, function(err){
      assert.typeOf(err, 'object', 'err contains an error');
      done();
    });
  });
});

describe('Dust cache', function(){
  it('should not store rendered templates when disabled', function(done){
    render(templates.hello, options, function(){
      render(templates.main, options, function(){
        assert.typeOf(hoffman.dust.cache.hello, 'undefined', 'dust.cache.hello is undefined');
        done();
      });
    });
  });

  it('should store rendered templates when enabled', function(done){
    options.settings["view cache"] = true;
    render(templates.hello, options, function(){
      render(templates.main, options, function(){
        assert.typeOf(hoffman.dust.cache.hello, 'function', 'dust.cache.hello is a function');
        done();
      });
    });
  });
  it('should be primable with all templates in the view dir', function(done){
    hoffman.prime(options.settings.views);
    assert.lengthOf(Object.keys(hoffman.dust.cache), 3, 'dust.cache contains 3 functions');
    done();
  });
});

describe('Dust streaming', function(){
  it('should be supported via returning a stream instance', function(done){
    newHoffman();
    var output = '';
    hoffman.stream(req, res, function(err, req, res){
      res.stream(templates.hello, options, function(stream){
        stream.on('data', function(chunk) {
          output = output + chunk;
        })
        .on('end', function() {
          assert.equal("hello world", output);
          done();
        })
        .on('error', function(err) {
          console.warn(err);
          assert.typeOf(err, 'undefined', "forced fail on streaming error");
          done();
        });
      });
    });
  });

  it('should be supported via internally streaming to res.write', function(done){
    hoffman.stream(req, res, function(err, req, res){
      res.stream(templates.hello, options);
      done();
    });
  });
});
