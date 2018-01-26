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

gulp.task('default', function (callback) {
  runSequence(['sass', 'watch'],
    callback
  )
})
gulp.task('watch', ['sass'], function() {
    gulp.watch('app/scss/**/*.scss', ['sass']);
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
        .pipe(replace(/(css\/\w*\.min\.css)|(js\/\w*\.min\.js)/g, "{% static 'projects/$&' %}"))
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

//gulp.task('django:build:flatpages', function() {
//    return gulp.src('django/templates/base.template.html')
//        .pipe(replace(/{% block (title|header) %}.*%}/g, '{{ flatpage.title }}'))
//        .pipe(replace(/{% block content %}.*%}/g, '{{ flatpage.content }}'))
//        .pipe(gulp.dest('django/templates/flatpages'))
//});
// gulp.task('django:build:flatpages', function() {
//     return gulp.src('django/**/*.flat.template.html')
//         .pipe(replace(/{% block (title|header) %}.*%}/g, '{{ flatpage.title }}'))
//         .pipe(replace(/{% block content %}.*%}/g, '{{ flatpage.content }}'))
//         .pipe(gulp.dest('django/'))
// });
gulp.task('django:build:flatpages', function() {
    return gulp.src('django/**/*.template.html')
        .pipe(replace(/{% block (title|header) %}.*%}/g, '{{ flatpage.title }}'))
        .pipe(replace(/{% block content %}.*%}/g, '{{ flatpage.content }}'))
        .pipe(gulp.dest('django/templates/flatpages/'))
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