const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const useref = require('gulp-useref');
const minifyjs = require('gulp-babel-minify');
const gulpIf = require('gulp-if');
const minifycss = require('gulp-cssnano');
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const del = require('del');
const runSequence = require('run-sequence');
const rsync = require('gulp-rsync');
const htmlmin = require('gulp-htmlmin');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const shell = require('gulp-shell');
const iife = require('gulp-iife');
const include = require('gulp-file-include');
const gzip = require('gulp-gzip');
const inline64 = require('gulp-inline-base64');
const flatmap = require('gulp-flatmap');

const PUBLIC_SERVER = '192.168.1.115';
const TEST_SERVER = '192.168.1.119';

// const DEV_BASE_PATH = 'C:\\Users\\beato\\Documents\\dev\\django-dev\\beatonma.org\\';
const DEV_BASE_PATH = 'C:\\Users\\beato\\Desktop\\beatonma.org - refactored\\';
const SRC_PATH = 'app/';
const DIST_PATH = 'dist/';
const TEMP_PATH = DIST_PATH + 'temp/';
const FLATPAGE_TEMPLATES = [
    'base.template.html',
    'empty.template.html',
    'null.template.html',
];

// Django app names.
const APP_NAMES = [
    'main',
    'mentions',
    'contact',
];
const DEFAULT_APP_NAME = APP_NAMES[0];

gulp.task('default', ['watch:dev']);
gulp.task('watch', ['sass'], () => {
    gulp.watch(SRC_PATH + 'scss/**/*.scss', ['sass']);
});

gulp.task('watch:dev', ['django:dev'], () => {
    console.log('Using dev directory \'' + DEV_BASE_PATH + '\'');
    gulp.watch(SRC_PATH + '**/*.scss', ['django:dev']);
    gulp.watch(SRC_PATH + '**/*.js', ['django:dev']);
    gulp.watch(SRC_PATH + '**/*.html', ['django:dev']);
});

// Convert sass/scss to standard css
gulp.task('sass', () => {
    return gulp.src(SRC_PATH + 'scss/**/*.scss')
        .pipe(sass().on('error', logError))
        .pipe(inline64({
            maxSize: 15 * 1024,
            debug: true,
            baseDir: SRC_PATH,
        }).on('error', logError))
        .pipe(autoprefixer().on('error', logError))
        .pipe(gulp.dest(SRC_PATH + 'css'));
});


// Build join js/css files
gulp.task('django:build:concat', () => {
    return gulp.src(SRC_PATH + '**/*.html')
        .pipe(useref())     // join scripts/stylesheets together
        .pipe(gulpIf('*.js', rename((path) => {
            console.log(path.dirname);
            console.log(path.dirname.split('\\'));
            console.log(path.basename);
            console.log(path.extname);
            console.log(path);
            console.log('');
        })))
        // .pipe(gulpIf('*.js', minifyjs()))
        // .pipe(gulpIf('*.css', minifycss()))
        // .pipe(replace(/[ ]{2,}/g, ''))  // Remove extra spaces
        // .pipe(replace(/(\r\n){2,}/g, '\r\n'))   // Remove extra line breaks
        // .pipe(replace(/([%}]{1}})([\r\n]+)/g, '$1'))    // Remove line breaks after django template stuff
        .pipe(gulp.dest(TEMP_PATH));
});




// gulp.task('django:build:minify', () => {
//     return gulp.src(SRC_PATH + '**/*')
//         .pipe(gulpIf('*.js', minifyjs()))
//         .pipe(gulpIf('*.css', minifycss()))
//         .pipe(gulpIf('*.html', replace(/[ ]{2,}/g, '')))
//         .pipe(gulpIf('*.html', replace(/(\r\n){2,}/g, '\r\n')))
//         .pipe(gulpIf('*.html', replace(/([%}]{1}})([\r\n]+)/g, '$1')))
//         .pipe(gulp.dest(TEMP_PATH))
// });

gulp.task('django:build:minify', ['django:build:minifyjs', 'django:build:minifycss', 'django:build:minifyhtml']);

gulp.task('django:build:minifyjs', () => {
    return gulp.src(TEMP_PATH + '**/*.js')
        .pipe(minifyjs())
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task('django:build:minifycss', () => {
    return gulp.src(TEMP_PATH + '**/*.css')
        .pipe(minifycss())
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task('django:build:minifyhtml', () => {
    return gulp.src(TEMP_PATH + '**/*.html')
        .pipe(replace(/[ ]{2,}/g, ''))  // Remove extra spaces
        .pipe(replace(/(\r\n){2,}/g, '\r\n'))   // Remove extra line breaks
        .pipe(replace(/([%}]{1}})([\r\n]+)/g, '$1'))    // Remove line breaks after django template stuff
        .pipe(gulp.dest(DIST_PATH));
})

// Copy image files to static 
gulp.task('django:build:images', () => {
    return gulp.src(SRC_PATH + 'images/*/**')
        .pipe(gulp.dest(DIST_PATH + 'static/main/images'))
});

gulp.task('django:build:fonts', () => {
    return gulp.src(SRC_PATH + 'fonts/**/*.woff2')
        .pipe(gulp.dest(DIST_PATH + 'static/main/fonts'));
});

// gathercss
// gatherjs


// Replace generic tags with flatpage-specific ones
// Replace 'extends' declarations with the flatpage version
// Rename to .flat.html extension
// TODO Remove dynamic tags e.g. {% if %}, {% for %}, etc.
gulp.task('django:build:flatpages', () => {
    const fps = [];
    for (let x in FLATPAGE_TEMPLATES) {
        const p = SRC_PATH + 'templates/' + FLATPAGE_TEMPLATES[x];
        fps.push(p);
    }
    return gulp.src(fps)
        .pipe(replace(/{% block (title|header) %}.*%}/g, '{{ flatpage.title }}'))
        .pipe(replace(/{% block content %}.*%}/g, '{{ flatpage.content }}'))
        .pipe(replace(/{% extends '(.*?)' %}/g, (match) => {
            // If this template extends another, it must also be a flatpage
            // template with .flat.html extension.
            let fname = /{% extends '(.*?)' %}/g.exec(match)[1];
            fname = fname.replace('.template.html', '.flat.html');
            return '{% extends \'flatpages/' + fname + '\' %}';
        }))
        .pipe(rename((path) => {
            path.dirname = '',
            path.basename = path.basename.replace('.template', ''),
            path.extname = '.flat.html'
        }))
        .pipe(gulp.dest(DIST_PATH + 'flatpages/'));
});

gulp.task('django:clean', () => {
    return del.sync(DIST_PATH + '**/*');
});

gulp.task('django:build', (callback) => {
    runSequence(
        'django:clean',
        'django:build:concat',
        'django:build:minify',
        // [
        //     'django:build:images',

        // ],
        callback);
});


// TODO update destination
// gulp.task('django:publish', () => {
//     return gulp.src(DIST_PATH + '**')
//         .pipe(rsync({
//             options: {
//                 chmod: 'Du=rwx,Dgo=rx,Fu=rw,Fgo=r'
//             },
//             username: 'pi',
//             hostname: '192.168.1.115',
//             destination: "path",
//             recursive: true,
//             root: DIST_PATH,
//             progress: true
//         }));
// });


/*
 *
 * 
 */

function log(err) {
    console.error(err);
    this.emit('end');
}