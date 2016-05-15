'use strict';
 
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var watchPath = require('gulp-watch-path');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var spritesmith = require('gulp.spritesmith');


gulp.task('watchsass',function () {
    gulp.watch(['src/sass/**/*.scss','!src/sass/mixin/**','!src/sass/modules/**'], function (event) {
        var paths = watchPath(event, 'src/sass/', './css/')

        gutil.log(gutil.colors.yellow(event.type) + ' ' + paths.srcPath)
        gutil.log(gutil.colors.green('Dist ') + paths.distPath)

        gulp.src(['src/sass/**/*.scss','!src/sass/mixin/**','!src/sass/modules/**'])
            .pipe(plumber()) // 兼容错误补丁
            .pipe(sass())
            .pipe(autoprefixer('not ie <= 8'))
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('sass', function() {
    gulp.src(['src/sass/**/*.scss','!src/sass/mixin/**','!src/sass/modules/**'])
        .pipe(plumber()) // 兼容错误补丁
        .pipe(sass()) // sass语法
        .pipe(autoprefixer('not ie <= 8')) // autoprefix增加前缀，兼容> 1% 浏览器
        .pipe(gulp.dest('./css/')) // 输出文件夹
});

gulp.task('default', function () {
    gulp.run('sass');
    gulp.run('watchsass');
});
 
gulp.task('sprite', function () {
  var spriteData = gulp.src('src/images/*').pipe(spritesmith({
    imgName: 'sprite.png',
    imgPath: '../images/sprite.png',
    cssName: '../src/sass/mixin/sprite.scss',
    padding: 4,
    cssFormat: 'scss'
  }));
  return spriteData.pipe(gulp.dest('images/'));
});