# Hoffman [![](https://travis-ci.org/diffsky/hoffman.png)](https://travis-ci.org/diffsky/hoffman)

A [dust.js](https://github.com/linkedin/dustjs) view engine for [express](https://github.com/visionmedia/express).

## Usage

Hoffman is installable via npm

    npm i hoffman

### Inside app.js

```
var hoffman = require('hoffman');

app.set('views', path.join(__dirname, 'templates')); // path to your templates
app.set('view engine', 'dust');
app.engine('dust', hoffman.__express());

// works with caching
app.set('view cache', true);

// optionally load all templates into dust cache on server start
hoffman.prime(app.settings.views);
```

### Rendering

Reference templates by name, without extension.

Inside a route:

    res.render('index', {"planet" : "world"});

Inside of a template:

    hello {>partial/}

All references are from the root of the views directory. Regardless of where the host template resides.

### Streaming

Hoffman supports streaming the response, by augmenting the response object via middleware:

    app.use(hoffman.stream);

You can then call `res.stream` instead of `res.render`. If you pass a callback, you will recieve the stream
object back to do with what you want, otherwise content will be streamed via `res.write()` as chunks of the
template are rendered. See the `stream` method code for more details.


### Cache Priming

With `view cache` set to `true`, templates will be cached in memory the first time they are read off disk.

With `hoffman.prime(app.settings.views)` all templates inside of the view directory
will be read into memeory on server start, meaning no first disk access after the server has started.

## Tests

Hoffman comes with unit tests, code coverage reports, and jshint linting, run via:

    npm test

![dustin](https://raw.github.com/wiki/diffsky/hoffman/hoffman.jpg)
