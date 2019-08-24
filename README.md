# Little Open Ticket System

lots is a simple ticketing system for code.

Using twitter style tagging, you can add a `!comment` with a `#tag` and an optional `^priority`.
lots can also find any mention of the word “TODO” in your code.

Here is an example of a snippet that would be picked up by lots:

    !This readme should be improved #documentation ^2

Note that:
 - hidden file and directories are not searched.
 - lots tickets must have a space before the `!comment` or be at the start of a line

#### Tickets

Lots will display found "tickets" in a format like this:
```
#documentation
 1  Make this useful test/data/index.js:4
 2  This readme should be improved README.md:10
#refactor
 -  make this configuration lib/lots.js:45
```

### Installation

lots has a dependency on [ripgrep](https://github.com/BurntSushi/ripgrep), which it expects to be available in your `$PATH`.

Install lots globally via npm:

    $ [sudo] npm i -g lots

lots source is [available on github](https://github.com/matthewhadley/lots)

### Usage

In a directory you wish to review your code from, run:

    $ lots

See `lots -h` for more options.

### Configuration

lots will read any `.lotsrc` configuration file it can find in either json or ini
format, in the [paths you might expect](https://github.com/dominictarr/rc#standards).

---

LOTS logo designed by [NAS](http://thenounproject.com/nas.ztu) from the [Noun Project](http://thenounproject.com/) :: Creative Commons – Attribution (CC BY 3.0)
