# [![LOTS](https://raw.githubusercontent.com/diffsky/lots/master/assets/lots-64.png)](https://github.com/diffsky/lots) Little Open Ticket System [![](https://travis-ci.org/diffsky/LOTS.svg)](https://travis-ci.org/diffsky/LOTS)

LOTS is a simple ticketing system for code.

Using twitter style tagging, you can add a `!comment` with a `#tag` and an optional `^priority`. These are then
presented in a web interface. LOTS can also find any mention of the word “TODO” in your code.

Here is an example of a snippet that would be picked up by LOTS:

    !This readme should be improved #documentation ^2

#### Tickets

Since `1.0.0` the default behaviour of LOTS is to display tickets on the command line
```
#documentation
 1  Make this useful test/data/index.js:3
 2  This readme should be improved public/help.html:122
 2  This readme should be improved README.md:10
#refactor
 1  support a .lotsrc for default configs bin/LOTS:42
 -  tags should be sorted to be consistent with cli output lib/lots.js:198
 -  should be able to sort/group on web interface, same as cli lib/lots.js:199
#todo
 -  make this configuration lib/lots.js:44
```

Tickets can be displayed in a web view when lots is started with the `--server` option

![ticket view](https://raw.githubusercontent.com/diffsky/LOTS/master/public/img/help/tickets.png)

#### File Viewer

Available in `--server` mode
![file view](https://raw.githubusercontent.com/diffsky/LOTS/master/public/img/help/file.png)

### Installation

Install lots globally via npm:

    $ [sudo] npm i -g lots

LOTS source is [available on github](https://github.com/diffsky/LOTS)

### Usage

In a directory you wish to review your code from, run:

    $ LOTS

When started with `--server` you can then visit `http://localhost:5000/` to see the report.

See `LOTS -h` for more options.

### Configuration

Lots will read any `.lotsrc` configuration file it can find in either json or ini
format, in the [paths you might expect](https://github.com/dominictarr/rc#standards).


---

LOTS logo designed by [NAS](http://thenounproject.com/nas.ztu) from the [Noun Project](http://thenounproject.com/) :: Creative Commons – Attribution (CC BY 3.0)
