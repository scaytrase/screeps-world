const tsDir = "dist/ts";
const jsDir = "dist/js";

module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-screeps");
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-contrib-copy')

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        screeps: {
            options: grunt.file.readJSON("env.json"),
            dist: {
                src: ["dist/js/*.js"]
            }
        },
        ts: {
            default: {
                tsconfig: "./tsconfig.json"
            }
        },

        clean: {
            "ts": [tsDir],
            "js": [jsDir],
            "dist": ["dist/"],
        },

        // Copy all source files into the dist folder, flattening the folder structure by converting path delimiters to underscores
        copy: {
            // Pushes the game code to the dist folder so it can be modified before being send to the screeps server.
            screeps: {
                files: [{
                    expand: true,
                    cwd: tsDir + '/',
                    src: "**",
                    dest: jsDir + '/',
                    filter: "isFile",
                    rename: function (dest, src) {
                        // Change the path name utilize underscores for folders
                        return dest + src.replace(/\//g, '.');
                    },
                }],
                options: {
                    process: function (content, srcpath) {
                        let srcdir = srcpath
                            .substring(0, srcpath.lastIndexOf("/"))
                            .replace(tsDir, '');

                        content = '' +
                            '//' + srcpath + "\n" +
                            '//' + srcdir + "\n" + content;

                        if (srcdir !== '') {
                            content = content
                                .replace(/require\("(\.)\/(.*)"\)/g, 'require(".' + srcdir + '.$2")');
                        }

                        content = content
                            .replace(/require\("(\.\.?)\/([\w_]+)\/(.*)"\)/g, 'require("$2.$3")')
                            .replace(/require\("\.\.?\/(.*)"\)/g, 'require("$1")');

                        return content;
                    },
                }
            }
        },
        watch: {
            scripts: {
                files: ["src/**"],
                tasks: ["ts", "copy:screeps", "screeps"],
                options: {
                    spawn: false,
                    debounceDelay: 50,
                },
            },
        },
    });

    grunt.registerTask("default", ["clean", "ts", "copy:screeps", "screeps"]);
};
