'use strict';

const fs = require('fs');
const gulp = require('gulp');
const bro = require('gulp-bro');
const less = require('gulp-less');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const replace = require('gulp-replace');
const uglifycss = require('gulp-uglifycss');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');
const autoprefix= new LessPluginAutoPrefix({browsers: ['last 20 versions', 'ie 9']});
const path = {
    src: {
        less:   'src/less/main.less',
        css:    'src/css/',
        min:    'src/css/main.min.css',
        js:     'src/js/main.js'
    },
    dist: {
        main:   'dist/',
        js:     'dist/docket.js'
    },
    watch: {
        js:     'src/js/**/*.js',
        less:   'src/less/**/*.less'
    }
};

gulp.task('less', () => {
    return gulp.src(path.src.less)
        .pipe(less({
            plugins: [autoprefix]
        }))
        .pipe(concat('main.css'))
        .pipe(gulp.dest(path.src.css))
        .pipe(concat('main.min.css'))
        .pipe(uglifycss({
            "uglyComments": true
        }))
        .pipe(gulp.dest(path.src.css))
});

gulp.task('js', () => {
    return gulp.src(path.src.js)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(concat('docket.js'))
        .pipe(gulp.dest(path.dist.main))
});

gulp.task('insert', ['js', 'less'], () => {
    let styles = fs.readFileSync(path.src.min, 'utf8');

    return gulp.src(path.dist.js)
        .pipe(replace(/(<style>)/, styles))
        .pipe(gulp.dest(path.dist.main))
        .pipe(concat('docket.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.dist.main))
});

gulp.task('prod', () => {
    return gulp.src(path.dist.js)
        .pipe(concat('docket.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.dist.main))
});

gulp.task('watch', () => {
    gulp.watch([path.watch.less, path.watch.js], ['insert'])
});

gulp.task('default', ['watch']);