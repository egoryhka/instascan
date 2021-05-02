var gulp = require('gulp');
var rename = require('gulp-rename');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var babelify = require('babelify');
var babel = require('gulp-babel');
var transform = require('gulp-transform');
var umd = require('gulp-umd');

var babelOptions = {
  ignore: /zxing\.js$/i,
  presets: ['env'],
  plugins: ['transform-runtime']
};

var build = function (file) {
  return browserify(file, { noParse: [ require.resolve('./src/vendor/zxing') ] })
    .transform(babelify, babelOptions)
    .bundle()
    .pipe(source('instascan.js'));
}

var mockImportsInZXing = function (content, file) {
  if (/zxing\.js$/i.test(file.relative)) {
    return content.replace(/require\([^)]+\)/g, '{}');
  } else {
    return content;
  }
};

gulp.task('default', ['build', 'watch']);

gulp.task('watch', function () {
  gulp.watch('./src/*.js', ['build']);
  gulp.watch('./*.js', ['build']);
});

gulp.task('build-package', function () {
  return gulp.src('./src/**/*.js')
    .pipe(transform('utf-8', mockImportsInZXing))
    .pipe(babel(babelOptions))
    .pipe(gulp.dest('./lib/'));
});

gulp.task('copy_dts', function () {
  return gulp.src('./definitions/*.d.ts')
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['build-package', 'copy_dts'], function () {
  return build('./export.js')
    .pipe(gulp.dest('./dist/'));
});

gulp.task('release', ['build-package', 'copy_dts'], function () {
  return build('./export.js')
    .pipe(buffer())
    .pipe(uglify({
        parse: {
            // parse options
        },
        compress: {
            // compress options
        },
        mangle: false /*{
            // mangle options

            properties: {
                // mangle property options
            }
        }*/,
        output: {
            // output options
        },
        sourceMap: {
            // source map options
        },
        nameCache: null, // or specify a name cache object
        toplevel: false,
        ie8: false,
        warnings: "verbose"
    }))
    .pipe(umd())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist/'));
});
