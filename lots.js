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
        tagGroup = {};
    // Browser will also request a facivon. Don't do anything for for now.
    var requestUrl = url.parse(request.url).pathname;
    if (requestUrl === '/favicon.ico') {
        return;
    }

    // ### Grep the file system for tags
    // Grep results are in the format:
    //
    //    `[file]:[line number]:[grep match]`
    //
    // An empty trailing element is deleted
    child = exec('grep -H -n -R -I \'#.*!.*^[0-9]\' *', function (err, stdout, stderr) {
        matches = stdout.split("\n");
        matches.pop();

        /*
        Loop through all the matches and for each match take the first part as the file
        name, the second part as the line number. Those entries are then deleted and the
        remaining entries joined together to form the comment (this covers the case where
        the comment might contain the grep deliminter).

        The comment is then stripped of everything before the \# and the actual tag and
        priority is extracted too.

        These details are then used to create a new ticket object
        */
        var i;
        for (i in matches) {
            match = matches[i].split(":");
            file = match[0];
            line = match[1];
            delete match[0];
            delete match[1];
            entry = match.join('');
            comment = entry.match(/#.*!/)[0];
            comment = comment.substring(1, comment.length - 1);

            // Only use comments that are less than 1000 chars.
            // This is to avoid accidentally including things such as minified javascript files
            // that might contain the pattern match
            if (comment.length < 1000) {
                bang = entry.match(/![a-zA-Z0-9]+ \^[0-9]+/, '');
                tag = entry.match(/![a-zA-Z0-9]+/)[0].substring(1);
                priority = entry.match(/\^[0-9]+/)[0].substring(1);
                if (tagGroup[tag] === undefined) {
                    tagGroup[tag] = [];
                }
                tagGroup[tag].push(ticketList.length);
                ticketList[ticketList.length] = new Ticket(ticketList.length, file, line, comment, tag, priority);
            }
        }

        // If we're not looking for _"TODO"_s then skip to building the LOTS object
        if (findTodos) {
            // ### Search the filesystem for _"TODO"_s
            // Similar to the search for tags, a grep is performed, matches are found
            // and then cleaned up.
            //
            // Tickets created here are assigned to the _TODO_ tag
            child = exec('grep -H -n -R TODO *', function (err, stdout, stderr) {
                matches = stdout.split("\n");
                delete (matches[(matches.length - 1)]);

                var i;
                for (i in matches) {
                    match = matches[i].split(":");
                    file = match[0];
                    line = match[1];
                    delete match[0];
                    delete match[1];
                    comment = match.join('');

                    if (comment.length < 1000) {
                        if (tagGroup.TODO === undefined) {
                            tagGroup.TODO = [];
                        }
                        tagGroup.TODO.push(ticketList.length);
                        ticketList[ticketList.length] = new Ticket(ticketList.length, file, line, comment, 'TODO');
                    }
                }
                buildLOTS(response);
            });
        } else {
            buildLOTS(response);
        }
    });

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

        // Render the **LOTS** object in the mustache template and send the response.
        fs.readFile(lotsPath + 'lots.mustache', function (err, data) {
            if (err) {
                throw err;
            }
            var output = Mustache.render(data.toString(), LOTS);
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(output);
            response.end();
            return;
        });
    }
}

// ## **LOTS** server setup
// Get the location that **LOTS** is running from so that it knows
// where to include mustache template files.
// process.argv[1] will contain the path to this file.
var lotsPath = path.dirname(path.normalize(process.argv[1])) + '/';

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