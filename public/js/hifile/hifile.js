// !support multi-line select #TODO
// !support deselect repeat click select #TODO

(function () {
  'use strict';
  var curhl = {};

  var hifile = {
    init: function () {
      var hl;
      hl = window.location.hash.substring(2);
      if (hl) {
        hifile.highlight(hl);
      }
      document.getElementById('col').addEventListener('click', hifile.update);
    },
    highlight: function (hl) {
      var col = document.getElementById('L' + hl);
      var line = document.getElementById('H' + hl);
      // remove any existing highlight
      if (curhl.col) {
        curhl.col.className = 'ln';
        curhl.line.className = 'cl';
      }
      // add highlight to new row
      if (col) {
        col.className += ' hl';
        line.className += ' hl';
        curhl.col = col;
        curhl.line = line;
      }
    },
    hash: function (e) {
      // get the line from the hash change (for example, from browser back navigation)
      hifile.highlight(e.newURL.split('#')[1].substr(1));
    },
    update: function (e) {
      var hash, hl;
      e.preventDefault();
      hl = e.target.innerText;
      hifile.highlight(hl);
      hash = '#L' + hl;
      if (window.history.pushState) {
        window.history.pushState(null, null, hash);
      } else {
        window.location.hash = hash;
      }
    }
  };
  document.addEventListener('DOMContentLoaded', hifile.init);
  window.addEventListener('hashchange', hifile.hash);
})();
