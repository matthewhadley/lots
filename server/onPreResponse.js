'use strict';

module.exports = function(request, reply){
  // pre-populate view context
  // http://blog.cedric-ziel.com/articles/manipulating-hapijs-view-context/
  var response = request.response;
  if (response.variety === 'view') {
    response.source.context = response.source.context || {};
    var context = response.source.context;

    context.lots = context.lots || null;
    return reply();
  }
  return reply();
};
