'use strict';
 
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var watchPath = require('gulp-watch-path');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var spritesmith = require('gulp.spritesmith');

var env = gulp.env;
var child = env._[0];
var path = child+'/';
if(!child) {
    var err = new Error( 'you must input a channel name' );
    throw err;
}
gulp.task('watchsass',function () {
    gulp.watch([path+'src/sass/**/*.scss','!'+path+'/src/sass/mixin/**','!'+path+'/src/sass/modules/**'], function (event) {
        var paths = watchPath(event, path+'src/sass/', path+'css/')

        gutil.log(gutil.colors.yellow(event.type) + ' ' + paths.srcPath)
        gutil.log(gutil.colors.green('Dist ') + paths.distPath)

        gulp.src([path+'src/sass/**/*.scss','!'+path+'src/sass/mixin/**','!'+path+'src/sass/modules/**'])
            .pipe(plumber()) // 兼容错误补丁
            .pipe(sass())
            .pipe(autoprefixer('>1%'))
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('sass', function() {
    gulp.src([path+'src/sass/**/*.scss','!'+path+'/src/sass/mixin/**','!'+path+'/src/sass/modules/**'])
        .pipe(plumber()) // 兼容错误补丁
        .pipe(sass()) // sass语法
        .pipe(autoprefixer('>1%')) // autoprefix增加前缀，兼容> 1% 浏览器
        .pipe(gulp.dest(path+'css/')) // 输出文件夹
});


gulp.task(child, function () {
    if(env.sprite) {
        gulp.run('sprite');
    }
    else {
        gulp.run('sass');
        gulp.run('watchsass');
    }
});
 
gulp.task('sprite', function () {
  var spriteData = gulp.src('./'+path+'src/images/*').pipe(spritesmith({
    imgName: 'sprite.png',
    imgPath: '../images/sprite.png',
    cssName: '../src/sass/mixin/sprite.scss',
    padding: 4,
    cssFormat: 'scss'
  }));
  return spriteData.pipe(gulp.dest(path+'images/'));
});