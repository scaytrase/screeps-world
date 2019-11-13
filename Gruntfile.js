module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        screeps: {
            options: grunt.file.readJSON('env.json'),
            dist: {
                src: ['dist/*.js']
            }
        },
        ts: {
            default: {
                tsconfig: './tsconfig.json'
            }
        },
        watch: {
            scripts: {
                files: ['src/**'],
                tasks: ['ts', 'screeps'],
                options: {
                    spawn: false,
                    debounceDelay: 50,
                },
            },
        },
    });

    grunt.registerTask("default", ["ts", "screeps"]);
};
