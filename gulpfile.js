const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const useref = require('gulp-useref');
const minifyjs = require('gulp-babel-minify');
const gulpIf = require('gulp-if');
const cssnano = require('gulp-cssnano');
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
// const include = require('gulp-include-template');
const include = require('gulp-file-include');
const gzip = require('gulp-gzip');

gulp.task('default', ['watch:dev']);
gulp.task('watch', ['sass'], function() {
    gulp.watch('app/scss/**/*.scss', ['sass']);
});

gulp.task('watch:dev', ['django:dev'], () => {
    gulp.watch('app/**/*.scss', ['django:dev']);
    gulp.watch('app/**/*.js', ['django:dev']);
    gulp.watch('app/**/*.html', ['django:dev']);
});

// Convert sass/scss to standard css
gulp.task('sass', function() {
    return gulp.src('app/scss/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
          stream: true
        }));
});

// Show live updates in browser
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'preview',
            index: 'PREVIEW.index.template.html'
        },
    })
});


// Call build:django:minify first, then use this to
// replace css/js paths with django template tags
// e.g. '/css/base.min.css' will be replaced with '{% static projects/css/base.min.css %}'
gulp.task('django:build:staticpaths', function() {
    return gulp.src('django/**/*.template.html') 
        .pipe(replace(/(css\/\w*\.min\.css)|(js\/\w*\.min\.js)/g, "{% static '$&' %}"))
        .pipe(gulp.dest('django/'))
    
});

gulp.task('django:build:minify', function() {
    return gulp.src('app/**/*.*.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', minifyjs()))
        .pipe(gulpIf('*.css', cssnano()))
//        .pipe(injectsvg())
        .pipe(replace(/[ ]{2,}/g, ''))
        .pipe(replace(/(\r\n){2,}/g, '\r\n'))
        .pipe(replace(/([%}]{1}})((\r\n)+)/g, '$1'))
        .pipe(gulp.dest('django/'));
});

gulp.task('django:build:images', function() {
    return gulp.src('app/images/*/**')
        // Caching images that ran through imagemin
//        .pipe(cache(imagemin({
//             interlaced: true,
//        })))
        .pipe(gulp.dest('django/static/projects/images'));
})

gulp.task('django:build:css', function() {
    return gulp.src('app/css/**/*.css')
        .pipe(cssnano())
        .pipe(gulp.dest('django/static/projects/css'));
});

// Move resources generated in build:django:minify
// to where they should be
gulp.task('django:build:gathercss', function() {
    return gulp.src('django/css/**/*.min.css')
        .pipe(gulp.dest('django/static/projects/css'));
});
gulp.task('django:build:gatherjs', function() {
    return gulp.src('django/js/**/*.min.js')
        .pipe(gulp.dest('django/static/projects/js'));
});

gulp.task('django:build:flatpages', function() {
    return gulp.src('django/**/*.template.html')
        .pipe(replace(/{% block (title|header) %}.*%}/g, '{{ flatpage.title }}'))
        .pipe(replace(/{% block content %}.*%}/g, '{{ flatpage.content }}'))
        .pipe(replace(/{% extends '(.*?)' %}/g, function(match) {
            let fname = /{% extends '(.*?)' %}/g.exec(match)[1];
            fname = fname.replace('.template.html', '.flat.html');

            return '{% extends \'flatpages/' + fname + '\' %}';
        }))
        .pipe(rename(function(path) {
            path.dirname = '',
            path.basename = path.basename.replace('.template', ''),
            path.extname = '.flat.html'
        }))
        .pipe(gulp.dest('django/templates/flatpages'))
});

gulp.task('django:clean', function() {
   return del.sync('django');
});

gulp.task('django:clean:temp', function() {
    return del.sync(['django/css', 'django/js']);//, 'django/*.template.html']);
});

gulp.task('django:build', function(callback) {
    runSequence('django:clean',
        'sass',                             // Construct css from scss
        'django:build:minify',              // Copy html files and minify any css/js found
        [
            'django:build:staticpaths',     // Inject full path to static assets
            'django:build:images',          // Copy images
            'django:build:css'              // Copy css
        ],
        [
            'django:build:gathercss',       // Copy minified css
            'django:build:gatherjs',        // Copy minified js
        ],
        'django:clean:temp',
        'django:build:flatpages',
        callback
   );
});

gulp.task('django:publish', function() {
    return gulp.src('django/**')
    .pipe(rsync({
        options: {
            chmod: "Du=rwx,Dgo=rx,Fu=rw,Fgo=r"
        },
        
        username: 'pi',
        hostname: '192.168.1.115',
        destination: "path",
        recursive: true,
        root: 'django',
        progress: true
    }));
});


gulp.task('django', function(callback) {
    runSequence('django:build', 'django:publish', callback);
});


/*
 * DEV
 * Same as django() except files are pushed to development server for
 * testing.
 */ 

// Same as django:build but without obfuscating js/css
gulp.task('django:dev:build', (callback) => {
    runSequence('django:clean',
        'sass',                             // Construct css from scss
        'django:dev:build:minify',              // Copy html files and minify any css/js found
        [
            'django:build:staticpaths',     // Inject full path to static assets
            // 'django:build:images',          // Copy images
            'django:build:css'              // Copy css
        ],
        [
            'django:build:gathercss',       // Copy minified css
            'django:build:gatherjs',        // Copy minified js
        ],
        'django:clean:temp',
        // 'django:build:flatpages',
        callback
   );
});

// Same as django:build:minify but without obfuscating js/css
gulp.task('django:dev:build:minify', function() {
    return gulp.src('app/**/*.*.html')
        .pipe(useref().on('error', logError))
        .pipe(include().on('error', logError))
        // .pipe(gulpIf('**/*.{css,js}', gzip({
        //     append: false,
        //     skipGrowingFiles: true
        // })))
        // .pipe(gulpIf('*.css', gzip()))
        // .pipe(gulpIf('*.js', iife()))
        // .pipe(gulpIf('*.js', minifyjs()))
        // .pipe(gulpIf('*.css', cssnano()))
//        .pipe(injectsvg())
        .pipe(replace(/[ ]{2,}/g, ''))
        .pipe(replace(/(\r\n){2,}/g, '\r\n'))
        .pipe(replace(/([%}]{1}})((\r\n)+)/g, '$1'))
        .pipe(gulp.dest('django/'));
});

gulp.task('django:dev:clean', function() {
    let options = {
        'dryRun': false,
        'force': true
    };
    del.sync('C:\\Users\\beato\\Documents\\dev\\django-dev\\beatonma.org\\projects\\templates', options);
    del.sync('C:\\Users\\beato\\Documents\\dev\\django-dev\\beatonma.org\\projects\\static', options);
});

// Push constructed files to dev server
gulp.task('django:dev:publish', function(callback) {
    return gulp.src('django/**')
        .pipe(gulp.dest('C:\\Users\\beato\\Documents\\dev\\django-dev\\beatonma.org\\projects'));
});

gulp.task('django:dev:publish:static', () => {
    return gulp.src('django/static/**/*')
        .pipe(gulp.dest('C:\\Users\\beato\\Documents\\dev\\django-dev\\beatonma.org\\static\\'));
});

// Update django static files on the dev server
gulp.task('django:dev:refreshstatic',
    shell.task(
        ['python3 manage.py collectstatic --noinput'],
        {cwd: 'C:\\Users\\beato\\Documents\\dev\\django-dev\\beatonma.org\\'}));

// Build files and copy to dev server location
gulp.task('django:dev', function(callback) {
    runSequence(
        // 'django:dev:clean',
        'django:dev:build',
        'django:dev:publish',
        'django:dev:publish:static',
        callback
        // 'django:dev:refreshstatic'
    );
});


function logError(err) {
    console.error(err);
    this.emit('end');
}