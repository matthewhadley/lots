#!/usr/bin/env node

/*
# Little Open Ticket System (LOTS)

**LOTS** is a simple ticketing system for code inspired by [BANG](http://www.thecodebase.com/bang/).

**LOTS** greps the filesystem for twitter style tags and TODOs and displayes them in an HTML table.
*/

// ## **LOTS** setup

/*
Include the required node modules.

* nodejs core modules
* [mustache](https://github.com/janl/mustache.js)
*/
var path = require('path'),
    fs = require('fs'),
    http = require('http'),
    url = require('url'),
    util = require('util'),
    exec = require('child_process').exec,
    child,
    Mustache = require('./mustache.js');

// Object factory for ticket details
function Ticket(id, file, line, comment, tag, priority) {
    var ticket = {
        'id' : id,
        'file' : file,
        'line' : line,
        'comment' : comment,
        'tag' : tag,
        'priority' : priority,
    };
    return ticket;
}
/*
## **LOTS** in action
Behind the scenes, **LOTS** uses grep on the local filesystem to find strings that match:

    `# These comments need updating !documentation ^3`

    `# Replace mustache.js with more flexible Handlebars.js !templating ^1`

And, optionally, any line that contains the word _"TODO"_

The grep matches are then broken down into the actual comment, tags, priority, the file they
belong to and the line they occur on. These are the Tickets. Tickets are then grouped by tags.
*/

// Handle the page request
function onRequest(request, response) {
    var ticketList = [],
        tagGroup = {},
        usingCache = false;
    // Browser will also request a facivon. Don't do anything for for now.
    var requestUrl = url.parse(request.url).pathname;
    if (requestUrl === '/favicon.ico') {
        return;
    }
    // Grab any url params
    var urlParts = url.parse(request.url, true);
    var query = urlParts.query;

    // Grep actions can take a long time, tell the client to wait
    response.writeHead(200, {"Content-Type": "text/html"});
    request.connection.setTimeout(0);

    // Because greps of large directory structures can take some time, the results are cached
    // If we're using the cache, send it to be rendered by mustache,, otherwise start
    // grepping the filesystem.
    if (query !== undefined && query.bc !== undefined) {
        grepSystem();
    } else {
        fs.readFile(basePath + 'LOTS.cache', 'utf-8', function (err, cache){
            if (err || cache === '') {
                grepSystem();
            } else {
                usingCache = true;
                console.log('Using cached results');
                renderData(JSON.parse(cache));
            }
        });
    }

    // ### Record a grep match as a new ticket
    function createTicket(file, line, comment, tag, priority) {
        // Only use comments that are less than 1000 chars.
        // This is to avoid accidentally including things such as minified javascript files
        // that might contain the pattern match
        if (comment.length < 1000) {
            if (tagGroup[tag] === undefined) {
                tagGroup[tag] = [];
            }
            tagGroup[tag].push(ticketList.length);
            ticketList[ticketList.length] = new Ticket(ticketList.length, file, line, comment, tag, priority);
        }
    }

    /*
    ### Build tickets from the grep results

    Loop through all the matches and for each match take the first part as the file
    name, the second part as the line number. Those entries are then deleted and the
    remaining entries joined together to form the comment (this covers the case where
    the comment might contain the grep deliminter).

    Grep results are in the format:

        `[file]:[line number]:[grep match]`


    If a tag is passed, use that for the tag and simply use the grep match for the comment.
    If no tag is passed, the comment is then stripped of everything before the \# and the actual tag, and
    priority is extracted too.

    These details are then used to create a new ticket object
    */
    function buildTickets(stdout, forceTag) {
        matches = stdout.split("\n");
        matches.pop();
        var i;
        for (i in matches) {
            match = matches[i].split(":");
            file = match[0];
            line = match[1];
            match.splice(0, 2);
            entry = match.join(':');
            if (forceTag) {
                comment = entry;
                tag = forceTag;
                priority = undefined;
            } else {
                comment = entry.match(/#.*!/)[0];
                comment = comment.substring(1, comment.length - 1);
                tag = entry.match(/![a-zA-Z0-9]+/)[0].substring(1);
                priority = entry.match(/\^[0-9]+/)[0].substring(1);
            }
            createTicket(file, line, comment, tag, priority);
        }
    }

    // ### Grep the filsystem for strings to build tickets from
    // Grep the file system for tags and, optionally, for _"TODO"_s (which are then assigned the _TODO_ tag).
    // Then build a **LOTS** object from the tickets.
    function grepSystem() {
        child = exec('grep -H -n -R -I \'#.*!.*^[0-9]\' *', function (err, stdout, stderr) {
            buildTickets(stdout);
            if (findTodos) {
                child = exec('grep -H -n -R -I TODO *', function (err, stdout, stderr) {
                    buildTickets(stdout, 'TODO');
                    buildLOTS(response);
                });
            } else {
                buildLOTS(response);
            }
        });
    }

    /*
    ### Create the **LOTS** object
    The found tag groups are looped through and each ticket in the group is added
    to a tickets array.
    */
    function buildLOTS(response) {
        var LOTS = {};
        LOTS.path = process.cwd();
        LOTS.tickets = [];

        if (ticketList.length > 0) {
            var tags = [], tag;
            var currentTicket;
            var n = 1;
            // Loop the tag groups.
            for (tag in tagGroup) {
                // loop the tickets in the tag group.
                var il = tagGroup[tag].length;
                for (i = 0; i < il; i++) {
                    currentTicket = ticketList[tagGroup[tag][i]];
                    currentTicket.number = i + 1;
                    currentTicket.order = n++;
                    if (i === 0) {
                        currentTicket.count = il;
                    }
                    LOTS.tickets.push(currentTicket);
                }
            }
            if (ndoccoServer !== undefined) {
                LOTS.ndoccoServer = ndoccoServer;
            }
            console.log(LOTS.tickets);
        } else {
            LOTS.empty = 1;
        }
        renderData(LOTS);
    }

    // Render the **LOTS** object in the mustache template and send the response.
    // If we're not serving a cached response then cache the LOTS object to disk for next time
    function renderData(LOTS) {
        fs.readFile(basePath + 'lots.mustache', function (err, data) {
            if (err) {
                throw err;
            }
            var output = Mustache.render(data.toString(), LOTS);
            response.write(output);
            response.end();
            if (! usingCache) {
                LOTS.cacheDate = new Date().toString();
                fs.writeFile('LOTS.cache', JSON.stringify(LOTS), function (err) {
                    if (err) {
                        throw err;
                    }
                });
            }
        });
    }
}

// ## **LOTS** server setup
// Get the location that **LOTS** is running from so that it knows
// where to include mustache template files.
// process.argv[1] will contain the path to this file.
var basePath = __dirname + '/';

// Create the **LOTS** server.
var port = 8888;
if (process.argv[2] !== undefined) {
    port = process.argv[2];
}
http.createServer(onRequest).listen(port);
console.log('LOTS server started at http://localhost:' + port);

// Determine if we are also looking for "TODO"s in the code.
var findTodos = true;
if (process.argv[3] !== undefined && process.argv[3] === 'false') {
    findTodos = false;
}

// Capture the location of a ndocco server to use.
if (process.argv[4] !== undefined) {
    var ndoccoServer = process.argv[4];
    console.log('Pairing with ndocco server at http://' + ndoccoServer);
}