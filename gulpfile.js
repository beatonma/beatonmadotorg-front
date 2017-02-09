var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var rsync = require('gulp-rsync');
var htmlmin = require('gulp-htmlmin');
var replace = require('gulp-replace');
//var textsimple = require('gulp-text-simple');

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
gulp.task('django:build:templatise', function() {
    return gulp.src('django/**/*.template.html') 
        .pipe(replace(/(css\/\w*\.min\.css)|(js\/\w*\.min\.js)/g, "{% static 'projects/$&' %}"))
        .pipe(gulp.dest('django/'))
    
});

gulp.task('django:build:minify', function() {
    return gulp.src('app/**/*.template.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(replace(/[ ]{2,}/g, ''))
        .pipe(replace(/(\r\n){2,}/g, ''))
        .pipe(replace(/([%}]{1}})((\r\n)+)/g, '$1'))
        .pipe(gulp.dest('django/'));
});

gulp.task('django:build:images', function() {
    return gulp.src('app/images/*/**')
        // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            // interlaced: true,
        })))
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
gulp.task('django:build:gathertemplates', function() {
    return gulp.src('django/**/*.template.html')
        .pipe(gulp.dest('django/templates'))
});

gulp.task('django:build:flatpages', function() {
    return gulp.src('django/templates/base.template.html')
        .pipe(replace(/{% block (title|header) %}.*%}/g, '{{ flatpage.title }}'))
        .pipe(replace(/{% block content %}.*%}/g, '{{ flatpage.content }}'))
        .pipe(gulp.dest('django/templates/flatpages'))
});

gulp.task('django:clean', function() {
   return del.sync('django');
});

gulp.task('django:clean:temp', function() {
    return del.sync(['django/css', 'django/js', 'django/*.template.html']);
});

gulp.task('django:build', function(callback) {
    runSequence('django:clean',
        'sass',
        'django:build:minify',
        ['django:build:templatise', 'django:build:images', 'django:build:css'],
        ['django:build:gathercss', 'django:build:gatherjs', 'django:build:gathertemplates'],
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
        hostname: '192.168.1.119',
        destination: "path",
        recursive: true,
        root: 'django',
        progress: true
    }));
});


gulp.task('django', function(callback) {
    runSequence('django:build', 'django:publish', callback);
});