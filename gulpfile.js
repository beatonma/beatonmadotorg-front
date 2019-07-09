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
const find = require('gulp-find');
const rename = require('gulp-rename');
const shell = require('gulp-shell');
const iife = require('gulp-iife');
const include = require('gulp-file-include');
const gzip = require('gulp-gzip');
const inline64 = require('gulp-inline-base64');
const flatmap = require('gulp-flatmap');
const concat = require('gulp-concat');
const merge = require('merge-stream');

const PUBLIC_SERVER = '192.168.1.117';
const TEST_SERVER = '192.168.1.119';

const DEV_BASE_PATH = 'F:\\active\\beatonma.org\\back\\';
const SRC_PATH = 'src/';
const DIST_PATH = 'dist/';
const BUILD_PATH = 'build/';
const TEMP_PATH = DIST_PATH + 'temp/';
const FLATPAGE_TEMPLATES = [
    'base.template.html',
    'empty.template.html',
    'null.template.html',
];

// Django app names.
const APP_NAMES = [
    'contact',
    'main',
    'mentions',
];
const DEFAULT_APP_NAME = APP_NAMES[0];


gulp.task('default', ['dev']);
gulp.task('dev', ['watch']);
gulp.task('build', ['django:build'])
gulp.task('test', ['django:publish:test']);
gulp.task('public', ['django:publish:public']);
gulp.task('meta', ['js:find_references'])


gulp.task('watch', ['sass'], () => {
    gulp.watch(SRC_PATH + '**/*.scss', ['sass']);
});


gulp.task('watch', ['django:dev'], () => {
    console.log('Using dev directory \'' + DEV_BASE_PATH + '\'');
    gulp.watch(SRC_PATH + '**/*.scss', ['django:dev']);
    gulp.watch(SRC_PATH + '**/*.js', ['django:dev']);
    gulp.watch(SRC_PATH + '**/*.html', ['django:dev']);
});


// Convert sass/scss to standard css
gulp.task('sass', () => {
    return gulp.src(SRC_PATH + '**/*.scss')
        .pipe(sass().on('error', log))
        .pipe(inline64({
            maxSize: 16 * 1024,
            debug: true,
            baseDir: SRC_PATH,
        }).on('error', log))
        .pipe(rename((path) => {
            path.dirname = path.dirname.replace('scss', 'css');
        }))
        .pipe(autoprefixer().on('error', log))
        .pipe(gulp.dest(SRC_PATH));
});


// Build join js/css files
gulp.task('django:build:concat', () => {
    return gulp.src(SRC_PATH + '**/*.html')
        .pipe(useref())     // join scripts/stylesheets together
        .pipe(include().on('error', log))  // Process @@include
        .pipe(gulp.dest(TEMP_PATH));
});

gulp.task('django:build:minify', ['django:build:minifyjs', 'django:build:minifycss', 'django:build:minifyhtml']);

gulp.task('django:build:minifyjs', () => {
    return gulp.src(TEMP_PATH + '**/*.js')
        .pipe(minifyjs())
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task('django:build:minifycss', () => {
    return gulp.src([SRC_PATH + '**/*.css', TEMP_PATH + '**/*.css'])
        .pipe(rename((path) => {
            // Move to apps/appname/static/appname/css
            path.dirname = path.dirname.replace(/apps[/\\](.+?)[/\\]css/g, 'apps/$1/static/$1/css');
            path.extname = '.min.css';
        }))
        .pipe(minifycss())
        .pipe(gulp.dest(DIST_PATH));
});


gulp.task('django:build:minifyhtml', () => {
    return gulp.src(TEMP_PATH + '**/*.html')
        .pipe(replace(/(apps\/.*\/static\/.*)?\/?((js|css)\/.*\.(js|css))/g, '{% static \'$2\' %}'))   // Fix filenames generated by useref in :concat and insert {% static %} tag
        .pipe(replace(/[ ]{2,}/g, ''))  // Remove extra spaces
        .pipe(replace(/(\r\n){2,}/g, '\r\n'))   // Remove extra line breaks
        .pipe(replace(/([%}]{1}})([\r\n]+)/g, '$1'))    // Remove line breaks after django template stuff
        .pipe(gulp.dest(DIST_PATH));
})


gulp.task('django:build:images', () => {
    return gulp.src(SRC_PATH + '**/images/**/*')
        .pipe(rename((path) => {
            // Move to apps/appname/static/appname/images
            path.dirname = path.dirname.replace(/apps[/\\](.+?)[/\\]images/g, 'apps/$1/static/$1/images');
        }))
        .pipe(gulp.dest(DIST_PATH));
});


// Replace generic tags with flatpage-specific ones
// Replace 'extends' declarations with the flatpage version
// Rename to .flat.html extension
// TODO Remove dynamic tags e.g. {% if %}, {% for %}, etc.
gulp.task('django:build:flatpages', () => {
    const fps = [];
    for (let x in FLATPAGE_TEMPLATES) {
        const p = TEMP_PATH + '**/templates/**/' + FLATPAGE_TEMPLATES[x];
        fps.push(p);
    }
    return gulp.src(fps)
        .pipe(replace(/(apps\/.*\/static\/.*)?\/?((js|css)\/.*\.(js|css))/g, '{% static \'$2\' %}'))   // Fix filenames generated by useref in :concat and insert {% static %} tag
        .pipe(replace(/[ ]{2,}/g, ''))  // Remove extra spaces
        .pipe(replace(/(\r\n){2,}/g, '\r\n'))   // Remove extra line breaks
        .pipe(replace(/([%}]{1}})([\r\n]+)/g, '$1'))    // Remove line breaks after django template stuff
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
            path.dirname += '/flatpages/';
            path.basename = path.basename.replace('.template', '');
            path.extname = '.flat.html';
        }))
        .pipe(gulp.dest(DIST_PATH));
});


gulp.task('django:clean', () => {
    return del.sync(DIST_PATH + '**/*');
});


gulp.task('django:clean:temp', () => {
    return del.sync([TEMP_PATH, DIST_PATH + '/apps/']);
});


gulp.task('django:unwrap', () => {
    // Move everything up a directory, removing 'apps' parent directory
    return gulp.src(DIST_PATH + '/**/*')
        .pipe(rename((path) => {
            path.dirname = path.dirname.replace(/^apps[/\\]/, '');
        }))
        .pipe(gulp.dest(DIST_PATH));
});


gulp.task('django:build', ['sass'], (callback) => {
    runSequence(
        'django:clean',
        'django:build:concat',
        'django:build:minify',
        [
            'django:build:flatpages',
            'django:build:images',
        ],
        'django:unwrap',
        'django:clean:temp',
        callback);
});


// gulp.task('django:dev:build', ['sass'], (callback) => {
//     // Same as django:build but without minification
//     // TODO currently does not copy files that would otherwise copied by minify tasks
//     runSequence(
//         'django:clean',
//         'django:build:concat',
//         'django:build:minify',
//         [
//             'django:build:flatpages',
//             // 'django:build:fonts',    // Included in css as base64 data
//             'django:build:images',
//         ],
//         'django:unwrap',
//         'django:clean:temp',
//         callback);
// });


gulp.task('django:dev', ['django:build'], (callback) => {
    // Build and push to local dev server directory
    console.log(`Pushing content to ${DEV_BASE_PATH}...`);
    return gulp.src(DIST_PATH + '**/*')
        .pipe(gulp.dest(DEV_BASE_PATH));
});


gulp.task('django:publish:test', ['django:build'], (callback) => {
    return gulp.src(DIST_PATH + '**')
        .pipe(rsync({
            options: {
                chmod: 'Du=rwx,Dgo=rx,Fu=rw,Fgo=r'
            },
            username: 'pi',
            hostname: TEST_SERVER,
            destination: "path",
            recursive: true,
            root: DIST_PATH,
            progress: true
        }));
});


gulp.task('django:publish:public', ['django:build'], (callback) => {
    return gulp.src(DIST_PATH + '**')
        .pipe(rsync({
            options: {
                chmod: 'Du=rwx,Dgo=rx,Fu=rw,Fgo=r'
            },
            username: 'pi',
            hostname: PUBLIC_SERVER,
            destination: "path",
            recursive: true,
            root: DIST_PATH,
            progress: true
        }));
});


function log(err) {
    console.error(err);
    this.emit('end');
}


/**
 * Additional meta-tools that provide information without contributing
 * to dist output. Outputs to BUILD_PATH
 */
gulp.task('js:find_references', () => {
    // TODO find references to html id or class names and show whichever
    // values are found so we can avoid making breaking changes while
    // editing html

    return merge(
        // HTML IDs
        gulp.src([SRC_PATH + '**/*.js'])
            .pipe(find(/(querySelector\(['"]#(.*?)['"]\)|getElementById\(['"](.*?)['"]\))/g)),

        // HTML classes
        gulp.src([SRC_PATH + '**/*.js'])
            .pipe(find(/querySelector\(['"]\.(.*?)['"]\)/g))
    )
        .pipe(concat('references.txt'))

        // Show all ID references as #name
        .pipe(replace(/getElementById\('(.*?)'\)/g, '#$1,'))
        .pipe(replace(/querySelector\('(#.*?)'\)/g, '$1,'))

        // Show all class references as .name
        .pipe(replace(/querySelector\('(\..*?)'\)/g, '$1,'))

        // Reformat to one reference per line
        .pipe(replace(/\s/g, ''))
        .pipe(replace(/,+/g, '\n'))
        .pipe(gulp.dest(BUILD_PATH));
});