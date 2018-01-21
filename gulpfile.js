var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useRef = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var del = require('del');
var runSequence = require('run-sequence');

function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function (file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

gulp.task('clean:dist', function () {
    return del.sync('dist');
})

gulp.task('sass', function () {
    return gulp.src('app/styles/**/*.scss')
        .pipe(sass())
        .pipe(cssnano())
        .pipe(rename('site.min.css'))
        .pipe(gulp.dest('dist/styles'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('feature-styles', function () {
    var featuresRootPath = 'app/features';
    var folders = getFolders(featuresRootPath);
    var tasks = folders.map(function (folder) {
        return gulp.src(path.join(featuresRootPath, folder, '/**/*.css'))
            .pipe(concat(folder + '.css'))
            .pipe(cssnano())
            .pipe(rename(folder + '.min.css'))
            .pipe(gulp.dest('dist/styles'));
    });
});

gulp.task('feature-scripts', function () {
    var featuresRootPath = 'app/features';
    var folders = getFolders(featuresRootPath);
    var tasks = folders.map(function (folder) {
        return gulp.src(path.join(featuresRootPath, folder, '/**/*.js'))
            .pipe(concat(folder + '.js'))
            .pipe(uglify())
            .pipe(rename(folder + '.min.js'))
            .pipe(gulp.dest('dist/scripts'));
    });
});

gulp.task('fonts', function () {
    return gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'))
});

gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: 'app'
        },
    })
})

gulp.task('watch', ['browserSync', 'sass'], function () {
    gulp.watch('app/styles/**/*.scss', ['sass']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/**/*.js', browserSync.reload);
    gulp.watch('app/**/*.css', browserSync.reload);
})

gulp.task('useRef', function () {
    return gulp.src('app/*.html')
        .pipe(useRef())
        .pipe(gulp.dest('dist'))
});

gulp.task('build', function (callback) {
    runSequence(['clean:dist', 'sass', 'feature-scripts', 'feature-styles', 'useRef'],
        callback
    )
})

gulp.task('default', function (callback) {
    runSequence(['build', 'browserSync', 'watch'],
        callback
    )
})