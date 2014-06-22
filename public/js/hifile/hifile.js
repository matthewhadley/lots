/* usage: attach hifile.init() to winow onload event */
var hifile = (function(){
  'use strict';
  var curhl = {};
  return {
    init : function() {
      var hl;
      hl = window.location.hash.substring(2);
      if(hl) {
        hifile.highlight(hl);
      }
      document.getElementById('col').addEventListener("click", hifile.update);
    },
    highlight : function(hl){
      var col = document.getElementById('L'+hl);
      var line = document.getElementById('H'+hl);
      if(col) {
        col.className += " hl";
        line.className += " hl";
        curhl.col = col;
        curhl.line = line;
      }
    },
    update : function (e) {
      var hash, hl;
      e.preventDefault();
      if(curhl.col) {
        curhl.col.className = "ln";
        curhl.line.className = "cl";
      }
      hl = e.target.innerText;
      hifile.highlight(hl);
      hash = "#L"+hl;
      if(history.pushState) {
        history.pushState(null, null, hash);
      }
      else {
        location.hash = hash;
      }
    }
  };
})();
