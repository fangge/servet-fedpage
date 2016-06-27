module.exports = function(grunt) {

    'use strict';

    require('load-grunt-tasks')(grunt);
    var path = require('path');
    var fs = require('fs');
    var pkg = require('./package');
    var proj_namespace = path.join(pkg.description, pkg.name, pkg.version, '\/');
    var ASSETS_URL = 'http://assets.dwstatic.com/'+ pkg.description + '/' + pkg.name + '/' + pkg.version + '/';
    var ipAddress = require('network-address')();

    var get_files = require('grunt-adiejs-static/lib/get_files').get_files,
        get_data = require('grunt-adiejs-static/lib/data').get_data,
        get_layout = require('grunt-adiejs-static/lib/layout').get_layout,
        render_file = require('grunt-adiejs-static/lib/render').render_file,
        write_file = require('grunt-adiejs-static/lib/write_file').write_file,
        get_helper_functions = require('grunt-adiejs-static/lib/get_helper_functions').get_helper_functions,
        ejs_static = require('grunt-adiejs-static/lib/ejs_static'),
        _ = require('grunt-adiejs-static/node_modules/underscore'),
        middleware_directory = require('grunt-contrib-connect/node_modules/connect/lib/middleware/directory'),
        //accepts = require('grunt-contrib-connect/node_modules/connect/node_modules/compression/node_modules/accepts'),
        accepts = require('accepts'),
        url = require('url');

    var renderTpl = function (req, res, next){
        var reqPathName = decodeURIComponent(url.parse(req.originalUrl).pathname),
            reqFileName = reqPathName.substring(reqPathName.lastIndexOf('/')+1),
            localPathName = path.resolve('src/', reqPathName.substring(1)),
            renderedFile;

        fs.readFile(localPathName, function(err, file) {
            if (err) {return next();}

            var options = {
                path_to_data: 'src/data/config.json',
                file_extension: '.html',
                underscore: true
            },
                config_cover = ejs_static.get_files(options),
                config_default = {}, 
                htmlfiles;  // local html file array
            fs.readdir(path.resolve('src/'), function(err, arr) {
                if (err) {console.log(err)}

                htmlfiles = _.filter(arr, function(item) {
                    return item.lastIndexOf('.html') !== -1;
                });
                htmlfiles = _.map(htmlfiles, function(item) {
                    return item.substring(0, item.lastIndexOf('.html'));
                });

                // cover config_default by config_cover
                _.each(htmlfiles, function(item) {
                    config_default[item] = {};
                    config_default[item]['path_to_layout'] = (config_cover[item] && config_cover[item]['path_to_layout']) || 'src/' + item + '.html';
                    config_default[item]['path_to_data'] = (config_cover[item] && config_cover[item]['path_to_data']) || ["src/data/global.json"];
                });

                Object.keys(config_default).forEach(function(key) {
                    if (reqFileName === key + options.file_extension) {
                        var fileData = ejs_static.get_data(key, config_default);
                        var layoutData = ejs_static.get_layout(key, config_default, options);
                        renderedFile = ejs_static.render_file(layoutData, fileData, _.extend({}, _));
                    }
                });

                // set the correct media-type, default 'text/plain'
                var type = accepts(req).types('text/plain', 'text/html', 'application/json', 'text/css', 'application/javascript', 'application/x-javascript', 'application/x-font-woff');
                switch(type){
                    case 'text/css':
                        res.setHeader('Content-Type', 'text/css');
                        break;
                    case 'application/javascript':
                        res.setHeader('Content-Type', 'application/javascript');
                        break;
                    case 'application/x-javascript':
                        res.setHeader('Content-Type', 'application/x-javascript');
                        break;
                    case 'text/plain':
                        req.url.lastIndexOf('.js')!==-1 && res.setHeader('Content-Type', 'application/javascript');
                        req.url.lastIndexOf('.css')!==-1 && res.setHeader('Content-Type', 'text/css');
                        req.url.lastIndexOf('.woff')!==-1 && res.setHeader('Content-Type', 'application/x-font-woff');
                        break;
                }
                res.end(renderedFile || file);
            });
        });
    };

    grunt.initConfig({

        // 全局变量
        banner: '/*! Project: '+pkg.name+'\n *  Version: '+pkg.version+'\n *  Date: <%= grunt.template.today("yyyy-mm-dd hh:MM:ss TT") %>\n *  Author: '+pkg.author.name+'\n */',

        connect: {
            site_src: {
                options: {
                    hostname: ipAddress,
                    port: 1024,
                    base: ['src/'],
                    livereload: true,
                    open: true, //打开默认浏览器
                    middleware: [
                        function(req, res, next){
                            return renderTpl(req,res,next);
                        },
                        middleware_directory(path.resolve('src/'))
                    ]
                }
            },
            site_dest: {
                options: {
                    hostname: ipAddress,
                    port: 1025,
                    base: ['dest/'],
                    livereload: true,
                    keepalive: true, //保持sever不退出
                    open: true //打开默认浏览器
                }
            }
        },
        cssmin: {
            options: {
                banner: '<%= banner %>'
            },
            minify: {
                expand: true,
                cwd: 'dest/css',
                src: ['*.css', '!*.min.css'],
                dest: 'dest/css',
                ext: '.css'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>',
                mangle: {
                    except: ['require', 'exports', 'module']
                },
                screwIE8:true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dest/js',
                    src: '**/*.js',
                    dest: 'dest/js'
                }]
            }
        },
        clean: {
            build: ["dest"],
            release: ["dest/slice", "dest/data", "dest/tpl"],
            zip: ["assets"],
            svn: [".tmp_svn"]
        },
        copy: {
            release: {
                expand: true,
                cwd: 'src/',
                src: ['**', '!sass', '!sass/{,*/}*', '!css/*.map', '!img/psd','!img/psd/{,*/}*', '!tmp/**', '!.svn'],
                dest: 'dest/'
            },
            zip_dest: {
                expand: true,
                cwd: 'dest/',
                src: ['js/{,*/}*', 'img/{,*/}*', 'css/*'],
                dest: 'assets/dest'
            },
            zip_src: {
                expand: true,
                cwd: 'src/',
                src: ['**', '!sass', '!sass/{,*/}*', '!css/*.map', '!img/psd','!img/psd/{,*/}*'],
                dest: 'assets/src'  
            }
        },
        autoprefixer: {
            options: {
                browsers: ['> 1%', 'last 2 versions', 'ff 17', 'opera 12.1', 'ie 8']
            },
            dist: {
                expand: true,
                flatten: true,
                src: 'src/css/*.css',
                dest: 'src/css/'
            }
        },
        watch: {
            css: {
                files: ['src/sass/{,*/}*.scss'],
                tasks:['sass']
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: ['src/*.html', 'src/css/*.css', 'src/js/*.js', 'src/tpl/*.ejs', 'src/data/*.json']
            }
        },
        imagemin: {
            options: {
                pngquant: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dest/img/',
                    src: ['**/*.{png,jpg,jpeg}'], // 优化 img 目录下所有 png/jpg/jpeg 图片
                    dest: 'dest/img/' // 优化后的图片保存位置，覆盖旧图片，并且不作提示
                }]
            }
        },
		//adisprite: {
        //    all: {
        //        srcCss: 'dest/css',
        //        srcImg: 'dest/slice',
        //        destCss: 'dest/css',
        //        destImg: 'dest/img/sprite',
        //        'padding': 5,
        //        'algorithm': 'binary-tree',
        //        'engine': 'gm',
        //        'exportOpts': {
        //            'format': 'png',
        //            'quality': 90
        //        }
        //    }
        //},
        sprite:{
            options: {
                // sprite背景图源文件夹，只有匹配此路径才会处理，默认 images/slice/
                imagepath: 'dest/slice',
                // 映射CSS中背景路径，支持函数和数组，默认为 null
                imagepath_map: null,
                // 雪碧图输出目录，注意，会覆盖之前文件！默认 images/
                spritedest: 'dest/img/sprite',
                // 替换后的背景路径，默认 ../images/
                spritepath: '../img/sprite/',
                // 各图片间间距，如果设置为奇数，会强制+1以保证生成的2x图片为偶数宽高，默认 0
                padding: 2,
                // 是否使用 image-set 作为2x图片实现，默认不使用
                useimageset: false,
                // 是否以时间戳为文件名生成新的雪碧图文件，如果启用请注意清理之前生成的文件，默认不生成新文件
                newsprite: false,
                // 给雪碧图追加时间戳，默认不追加
                spritestamp: true,
                // 在CSS文件末尾追加时间戳，默认不追加
                cssstamp: true,
                // 默认使用二叉树最优排列算法
                algorithm: 'binary-tree',
                // 默认使用`pixelsmith`图像处理引擎
                engine: 'pixelsmith'
            },
            autoSprite: {
                files: [{
                    // 启用动态扩展
                    expand: true,
                    // css文件源的文件夹
                    cwd: 'dest/css/',
                    // 匹配规则
                    src: '*.css',
                    // 导出css和sprite的路径地址
                    dest: 'dest/css/',
                    // 导出的css名
                    ext: '.css'
                }]
            }
        },
        sass: {
            dist: {
                options: {
                    outputStyle: 'expanded',
                    //nested, compact, compressed, expanded
                    sourceComments: 'map',
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: 'src/sass',
                    src: ['*.scss','!_*.scss','!*/_*.scss'],
                    dest: 'src/css',
                    ext: '.css'
                }]
            }
        },
        ejs_static: {
            release:{
                options: {
                    dest: 'dest/',
                    path_to_data: 'src/data/config.json',
                    path_to_layouts: 'src/',
                    underscores_to_dashes: false,
                    file_extension: '.html',
                    underscore: true
                }
            }
        },
        concat: {
            trans_html: {
                options: {
                    process: function(src, filepath) {
                        var regex = /((href|src)=['"][\s]*)(?!http[s]?\:|\#|\/)([\?\#\=\/\w._-]*)([\s]*['"])/g;
                        return src.replace(regex, '$1'+ASSETS_URL+'$3'+ '?t=' + new Date().getTime() + '$4');
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'dest/',
                    src: '*.html',
                    dest: 'build/'
                }]
            },
            trans_css: {
                options: {
                    process: function(src, filepath) {
                        var regex = /(\/[\w-]*\.(jpg|jpeg|gif|png))/ig;
                        return src.replace(regex, '$1' + '?t=' + new Date().getTime());
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'dest/css',
                    src: '*.css',
                    dest: 'dest/css',
                    ext: '.css'
                }]
            }
        },
        compress: {
            zip: {
                options:{
                    archive: 'assets.zip'
                },
                files: [{
                    expand: true,
                    cwd: 'assets/',
                    src: '**'
                }]
            }
        },
        timestamp: {
            default: {
                files: [{
                    expand: true,
                    cwd: 'dest/css',
                    src: '*.css',
                    dest: 'dest/css',
                    ext: '.timestamp'
                }],
                option: {
                    // Timestamp display text
                    'timestampName': 'Timetamp',
                    // Date format
                    'timestampFormat': 'yyyy/mm/dd HH:MM:ss',
                    // Add timestamp at the end of the files' content(.css/.js).
                    'timestampType': 'md5',
                    // Timestamp type like time(2014/04/02 22:17:07) | md5/sha1/ha256/sha512).
                    'fileEndStamp': true,
                    // Add timestamp at images of CSS style.
                    'cssImgStamp': true,
                    // Rename file name with timestamp inside.
                    'fileNameStamp': true
                }
            }
        }
    });

    // 默认任务
    grunt.registerTask('default', ['connect:site_src', 'watch']);

    // 自定义端口
    grunt.task.registerTask('port', 'multi port', function(arg) {
        if(arguments.length === 0){
            console.log('端口号不能为空！')
        }else{
            grunt.config.set('connect.port'+arg,{
                options: {
                    hostname: ipAddress,
                    port: arg,
                    base: ['src/'],
                    livereload: +arg+1,
                    open: true,
                    middleware: [
                        function(req, res, next){
                            return renderTpl(req,res,next);
                        },
                        middleware_directory(path.resolve('src/'))
                    ]
                }
            });

            grunt.config.set('watch.livereload',{
                options: {
                    livereload: +arg+1
                },
                files: ['src/*.html', 'src/css/*.css', 'src/js/*.js']
            })

            grunt.task.run(['connect:port'+arg, 'watch']);
        }
    });

    // webserver 查看发布目录
    grunt.registerTask('dest', ['connect:site_dest']);

    // 发布任务
    grunt.registerTask('release', ['sass', 'clean:build', 'copy:release', 'sprite', 'autoprefixer','cssmin', 'uglify','imagemin', 'ejs_static:release','concat:trans_css','concat:trans_html','clean:release','connect:site_dest']);
    // grunt.registerTask('release', ['sass', 'clean:build', 'copy:release', 'adisprite', 'uglify', 'imagemin', 'ejs_static:release', 'clean:release', 'connect:site_dest']);

    // 提交dest到静态文件svn
    grunt.task.registerTask('assets', 'commit message', function(arg) {
        grunt.config.merge({
            push_svn:{
                options: {
                    message: arg,
                    pushIgnore: ['*.html', '.DS_Store', '.idea/**', '.tmp_svn/**', '.svn/**']
                }
            }
        })
        grunt.task.run(['push_svn:assets', 'clean:svn', 'concat:trans_html']);
    });

    //替换资源路径
    grunt.registerTask('trans',[ 'concat:trans_html']);
    grunt.registerTask('transc',[ 'concat:trans_css']);

    grunt.registerTask('addtimestamp',[ 'timestamp']);

    // release后，zip打包
    grunt.registerTask('zip',['copy:zip_src', 'copy:zip_dest', 'concat:trans_html', 'compress', 'clean:zip']);

};