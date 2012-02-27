# Little Open Ticket System (LOTS)

**LOTS** is a simple ticketing system for code inspired by [BANG](http://www.thecodebase.com/bang/).

Using twitter style tagging, you can simply add a !tag and a ^priority to comments, and **LOTS** presents these for you in a purty interface.
**LOTS** can also find any mention of the word _"TODO"_ in your code.

The [source for LOTS](https://github.com/diffsky/LOTS/) is available on GitHub, and released under the MIT license.

For the full copyright and license information, please view the LICENSE
file that was distributed with this source code.

### Installation

    $ git clone git://github.com/diffsky/LOTS.git

### Usage

**LOTS** runs on [nodejs](http://nodejs.org/). In a directory you wish to review your code from:

    $ node path/to/LOTS.js <port number> <find todos> <ndocco server>

Options:

   * `port number` - port for **LOTS** to run its server on
   * `find todos` - by default, **LOTS** will search for "TODO" in your code, pass `false` to disable
   * `ndocco server` - location of a running [ndocco](https://github.com/diffsky/ndocco) server (for example, `localhost:8888`)

If a `ndocco server` location is passed then file links in the **LOTS** report will point to their ndocco output.

Here is an example of a snippet that would be picked up by **LOTS**:

    # This readme should be improved !documentation ^2

### Hat Tip

**LOTS** makes use of:

   * [mustache](https://github.com/janl/mustache.js)