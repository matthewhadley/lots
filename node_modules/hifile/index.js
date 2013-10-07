var hl = require('highlight.js'),
    // map file extensions to highlight.js languages
    exts = {
      'js' : 'javascript',
      'sh' : 'bash',
      'md' : 'markdown'
    };

/* attempt to fix multiline comments by adding extra spans */
function multiLineComments(match) {
  var ret = match,
      lines = match.split("\n"),
      ln = lines.length, i;
  if(ln > 1){
    for (i = 0; i < ln; i++) {
      if(i === 0) {
        ret = lines[i] + "</span>";
      }else if(i === ln) {
        ret = ret + '<span class="comment">' + lines[i];
      } else {
        ret = ret + "\n";
        if(lines[i] !== '') {
          ret = ret + '<span class="comment">' + lines[i] + "</span>";
        }
      }
    }
  }
  return ret;
}

module.exports = function hifile(str, ext) {
  var lines, col = '', ln;
  ext = exts[ext] || ext;
  try {
    if (ext) {
      code = hl.highlight(exts[ext] || ext, str);
    } else {
      code = hl.highlightAuto(str);
    }
  } catch (e) {
    code = hl.highlightAuto(str);
  }
  code.value = code.value.replace(/<span class="comment">(.|\n)+?<\/span>/gm, multiLineComments);
  lines = code.value.split("\n");
  lines.forEach(function(line, i, arr){
    ln = i + 1;
    arr[i] = '<div class="cl" id="H'+ln+'">'+arr[i]+'</div>';
    col = col + '<div class="ln"><a id="L'+ln+'" href="#L'+ln+'">'+ln+'</a></div>';
  });
  code = lines.join("\n");
  return '<div id="hifile"><div id="col">'+col+'</div><div id="code">'+code+'</div></div>';
};
