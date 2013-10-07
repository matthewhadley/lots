module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      options: JSON.parse(require('fs').readFileSync(require.resolve('./.jshintrc'), 'utf8')),
      files: {
        src: ['index.js', 'test/test.js']
      }
    },
    mochaTest: {
      files: ['test/test.js']
    },
    mochaTestConfig : {
      options: {
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      }
    },
    shell: {
      "mocha-istanbul": {
        command: 'node_modules/istanbul/lib/cli.js cover -- node_modules/mocha/bin/_mocha test/test.js --colors --reporter spec',
        options: {
            stdout: true,
            stderr: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');

  // alias tasks
  grunt.registerTask('test', ['shell:mocha-istanbul', 'jshint']);
  // default task
  grunt.registerTask('default', ['shell:mocha-istanbul', 'jshint']);
};