'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      options: JSON.parse(require('fs').readFileSync(require.resolve('./.jshintrc'), 'utf8')),
      files: {
        src: ['app.js', 'lib/lots.js', 'bin/LOTS']
      }
    },
    mochaTest: {
      files: ['test/unit/stub.js']
    },
    mochaTestConfig : {
      options: {
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      }
    },
    shell: {
      'mocha-istanbul': {
        command: 'node_modules/istanbul/lib/cli.js cover -- node_modules/mocha/bin/_mocha test/unit/lots.js --colors --reporter spec',
        options: {
            stdout: true,
            stderr: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-shell');

  // alias tasks
  grunt.registerTask('test', ['jshint', 'shell:mocha-istanbul']);
};
