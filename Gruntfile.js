"use strict";

module.exports = function(grunt) {
    require("load-grunt-tasks")(grunt);

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            test: {
                options: {
                    jshintrc: "test/.jshintrc"
                },
                files: {
                    src: "test/**/*.js"
                }
            },
            src: ["Gruntfile.js", "src/**/*.js"]
        },
        mochaTest: {
            options: {
                reporter: "spec"
            },
            unit: {
                options: {
                    require: ["test/setup.js"]
                },
                src: ["test/*_test.js"]
            },
            e2e: {
                options: {
                    require: ["test/e2e/setup.js"]
                },
                src: "test/e2e/*_test.js"
            }
        },
        express: {
            test: {
                options: {
                    script: "src/server.js",
                    output: "Listening on port",
                    node_env: "test"
                }
            }
        }
    });

    grunt.registerTask("default", "test");

    grunt.registerTask("test", ["jshint", "mochaTest:unit", "express:test", "mochaTest:e2e", "express:test:stop"]);
};
