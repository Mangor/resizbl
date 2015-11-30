var nib = require('nib'),
    gulp = require('gulp'),
    jade = require('gulp-jade'),
    rimraf = require('gulp-rimraf'),
    stylus = require('gulp-stylus'),
    concat = require('gulp-concat'),
    changed = require('gulp-changed'),
    connect = require('gulp-connect'),
    imagemin = require('gulp-imagemin'),
    compress = require('gulp-yuicompressor'),

    fs = require('fs');

var projectConfig = {
  src: './app/source',
  sourceJS: './app/source/js',
  sourceCss: './app/source/css',
  sourceImg: './app/source/i',
  bowerSrc: './bower_components',
  dest: './app/dest',
  destJS: './app/dest/js',
  destCSS: './app/dest/css',
  destImg: './app/dest/i'
};

var jedeFiles = [
  projectConfig.src+'/**/*.jade'
];

//Jade
gulp.task('jade', function() {
  var YOUR_LOCALS = {};
  gulp.src(jedeFiles)
    .pipe(changed(projectConfig.dest+'/', {hasChanged: changed.compareSha1Digest}))
    .pipe(jade({
      pretty: true,
      locals: JSON.parse(fs.readFileSync('./package.json', 'utf8'))
    }))
    .pipe(gulp.dest(projectConfig.dest+'/'))
    .pipe(connect.reload());
});

var stylusFiles = [
  '!node_modules/**/*.styl',
  projectConfig.src+'/stylus/main.styl'
];

//compile & minify Stylus to source/css
gulp.task('stylus', function () {
  gulp.src(stylusFiles)
    .pipe(changed(projectConfig.sourceCss, {hasChanged: changed.compareSha1Digest}))
    .pipe(stylus({use: [nib()]}))
    .pipe(concat('main.css'))
    .pipe(gulp.dest(projectConfig.destCSS))
    .pipe(compress({type: 'css'}))
    .pipe(connect.reload());
});

var copyJS = [
  projectConfig.bowerSrc+'/jquery/dist/jquery.js',
  projectConfig.bowerSrc+'/lodash/lodash.js',
  './app/source/js/**/*.js'
];

//concat js files
gulp.task('js', function(){
  gulp.src(copyJS)
    // .pipe(compress({type: 'js'}))
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest(projectConfig.destJS))
    .pipe(connect.reload());
});

//img minify
gulp.task('imageMinify', function() {
  gulp.src(projectConfig.sourceImg+'/**')
    .pipe(imagemin({
      progressive: true,
      optimizationLevel: 7
    }))
    .pipe(gulp.dest(projectConfig.destImg))
    .pipe(connect.reload());
});

//clean dest dir
gulp.task('clean', function () {
  return gulp.src(projectConfig.dest, {read: false})
    .pipe(rimraf());
});

//server
gulp.task('connectDev', function () {
  connect.server({
    root: [projectConfig.dest],
    port: 3000,
    livereload: true
  });
});

//watch
gulp.task('watch', function () {
  gulp.watch(jedeFiles, ['jade']);
  gulp.watch(projectConfig.src+'/stylus/*.styl', ['stylus']);
  gulp.watch(projectConfig.sourceImg+'/**', ['imageMinify']);
  gulp.watch(projectConfig.sourceJS+'/**/*.js', ['js']);
});

gulp.task('default', ['jade', 'stylus', 'js', 'imageMinify', 'connectDev', 'watch']);
gulp.task('prod', ['clean']);