/* usage: attach hifile.init() to winow onload event */
var hifile = (function(){
  var curhl;
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
      var el = document.getElementById('H'+hl);
      if(el) {
        el.className += " hl";
        curhl = el;
      }
    },
    update : function (e) {
      var hash, hl;
      e.preventDefault();
      if(curhl) {
        curhl.className = "cl";
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
