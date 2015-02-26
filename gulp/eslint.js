'use strict';

var eslint = require('gulp-eslint');

module.exports = function(gulp, conf) {
  gulp.task('lint', function() {
    return gulp.src([
        '!node_modules/**/*.js',
        '!public/**/*.js',
        '**/*.js'
      ])
      .pipe(eslint())
      .pipe(eslint.format())
      .on('data', function(file) {
        if (file.eslint.messages && file.eslint.messages.length) {
          file.eslint.messages.forEach(function(message) {
            if (message.severity === 2) {
              gulp.fail = true;
            }
          });
        }
      });
  });
};
