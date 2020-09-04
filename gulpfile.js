const gulp = require('gulp')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const tsify = require('tsify')
const clean = require('gulp-clean')
const watchify = require('watchify')
const gutil = require('gulp-util')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const connect = require('gulp-connect')
const sourcemaps = require('gulp-sourcemaps')
const buffer = require('vinyl-buffer')

// 配置
const paths = {
  pages: ['src/*.html'],
}

// 清除
gulp.task('clean', () => {
  return gulp
    .src(['dist/*.html', 'dist/*.js', 'dist/*.map'], {
      read: false,
    })
    .pipe(clean())
})

// 监听
const watchedBrowserify = watchify(
  browserify({
    basedir: '.',
    debug: true,
    entries: ['./src/index.ts'],
    cache: {},
    packageCache: {},
  }).plugin(tsify)
)

// 将js文件链接到模板，主入口
gulp.task('copy-html', () => {
  return gulp.src(paths.pages).pipe(gulp.dest('dist'))
})

const browserifyBundle = () => {
  return watchedBrowserify
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(
      sourcemaps.init({
        loadMaps: true,
      })
    )
    .pipe(babel())
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'))
}

gulp.task('browserify', () => {
  return browserifyBundle()
})

gulp.task('webserver', () => {
  return connect.server({
    root: "./dist",
    livereload: true,
    port: 8080,
  })
})

gulp.task(
  'default',
  gulp.series('clean', 'copy-html', 'browserify', 'webserver')
)
watchedBrowserify.on('update', browserifyBundle)
watchedBrowserify.on('log', gutil.log)
