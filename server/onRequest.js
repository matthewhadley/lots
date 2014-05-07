'use strict';

module.exports = function(config){

  return function(request, reply){
    console.log('here');
    request.lots = config;
    return reply();
  };
};


// module.exports = function(request, reply){


//   // pre-populate view context
//   // http://blog.cedric-ziel.com/articles/manipulating-hapijs-view-context/
//   var response = request.response;
//   if (response.variety === 'view') {
//     response.source.context = response.source.context || {};
//     var context = response.source.context;
//     context.APP = {
//       context: {}
//     };
//     context.APP.context.user = request.pre.user || {};
//     context.APP.context.locale = request.pre.locale || {};
//     context.i18n = request.pre.i18n || {};
//     context.hash = hash;
//     context._ = _;
//     return reply();
//   }
//   return reply();
// };

