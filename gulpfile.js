// Gulp
const gulp = require('gulp');
const runSequence = require('run-sequence');
const merge = require('merge-stream');
const gulpIf = require('gulp-if');
const debug = require('gulp-debug');
const browserSync = require('browser-sync').create();

// Compilation
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');  // CSS compatibility
const inline64 = require('gulp-inline-base64');
const babel = require('gulp-babel');

// File reduction/combination
const concat = require('gulp-concat');
const useref = require('gulp-useref');
const include = require('gulp-file-include');

// Minification/obfuscation
const minifycss = require('gulp-cssnano');
const minifyjs = require('gulp-babel-minify');

// Text processing
const find = require('gulp-find');
const replace = require('gulp-replace');

// Filesystem
const del = require('del');
const rename = require('gulp-rename');
const rsync = require('gulp-rsync');

const TEST_SERVER = 'beatonma.com';


const SRC_PATH = 'src/';
const DIST_PATH = 'dist/';
const BUILD_PATH = 'build/';
const TEMP_PATH = BUILD_PATH + 'temp/';
const FLATPAGE_TEMPLATES = [
    'base.template.html',
    'empty.template.html',
    'null.template.html',
];
gulp.task('default', ['build']);
gulp.task('meta', ['js:find_references']);


// gulp.task('watch', ['sass'], () => {
//     console.log('Using dev directory \'' + DEV_BASE_PATH + '\'');
//     gulp.watch(SRC_PATH + '**/*.scss', ['sass']);
// });


gulp.task('watch', ['dev'], () => {
    console.log('Using dev directory \'' + DEV_BASE_PATH + '\'');
    gulp.watch(SRC_PATH + '**/*.scss', ['dev:autorefresh']);
    gulp.watch(SRC_PATH + '**/*.js', ['dev:autorefresh']);
    gulp.watch(SRC_PATH + '**/*.html', ['dev:autorefresh']);
});

gulp.task('testwatch', [], () => {
    gulp.watch(SRC_PATH + '**/*.scss', ['test']);
    gulp.watch(SRC_PATH + '**/*.js', ['test']);
    gulp.watch(SRC_PATH + '**/*.html', ['test']);
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


gulp.task('jsx:babel', () => {
    return gulp.src(SRC_PATH + '**/react/**/*.js')
        .pipe(include({ basepath: '@root' })).on('error', log)  // Process @@include)
        .pipe(debug())
        .pipe(babel({
            plugins: ['transform-react-jsx']
        })).on('error', log)
        .pipe(gulp.dest(BUILD_PATH + 'react-generated/'))
});


// Build join js/css files
gulp.task('build:concat', ['jsx:babel'], () => {
    return gulp.src(SRC_PATH + '**/*.html')
        .pipe(useref())     // join scripts/stylesheets together
        .pipe(include({ basepath: '@root' })).on('error', log)
        .pipe(gulp.dest(TEMP_PATH));
});


gulp.task('build:minify', [
    'build:minifyjs',
    'build:minifycss',
    'build:minifyhtml'
]);


gulp.task('build:minifyjs', () => {
    return gulp.src(TEMP_PATH + '**/*.js')
        .pipe(minifyjs())
        .pipe(gulp.dest(DIST_PATH));
});


gulp.task('build:minifycss', () => {
    return gulp.src([SRC_PATH + '**/*.css', TEMP_PATH + '**/*.css'])
        .pipe(rename((path) => {
            // Move to apps/appname/static/appname/css
            path.dirname = path.dirname.replace(/apps[/\\](.+?)[/\\]css/g, 'apps/$1/static/$1/css');
            path.extname = '.min.css';
        }))
        .pipe(minifycss())
        .pipe(gulp.dest(DIST_PATH));
});


gulp.task('build:minifyhtml', () => {
    return gulp.src(TEMP_PATH + '**/*.html')
        .pipe(replace(/(apps\/.*\/static\/.*)?\/?((js|css)\/.*\.(js|css))/g, '{% static \'$2\' %}'))   // Fix filenames generated by useref in :concat and insert {% static %} tag
        .pipe(replace(/[ ]{2,}/g, ''))  // Remove extra spaces
        .pipe(replace(/(\r\n){2,}/g, '\r\n'))   // Remove extra line breaks
        .pipe(replace(/([%}]{1}})([\r\n]+)/g, '$1'))    // Remove line breaks after django template stuff
        .pipe(gulp.dest(DIST_PATH));
})


gulp.task('build:images', () => {
    return gulp.src(SRC_PATH + '**/images/**/*')
        .pipe(rename((path) => {
            // Move to apps/appname/static/appname/images
            path.dirname = path.dirname.replace(/apps[/\\](.+?)[/\\]images/g, 'apps/$1/static/$1/images');
        }))
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task('collectstatic', () => {
    return gulp.src(SRC_PATH + 'static/**/*')
        .pipe(gulp.dest(DIST_PATH + 'main/static/main/'));
});


// Replace generic tags with flatpage-specific ones
// Replace 'extends' declarations with the flatpage version
// Rename to .flat.html extension
// TODO Remove dynamic tags e.g. {% if %}, {% for %}, etc.
gulp.task('build:flatpages', () => {
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


gulp.task('clean', () => {
    return del.sync(DIST_PATH + '**/*');
});


gulp.task('clean:temp', () => {
    return del.sync([TEMP_PATH, DIST_PATH + '/apps/']);
});


gulp.task('unwrap', () => {
    // Move everything up a directory, removing 'apps' parent directory
    return gulp.src(DIST_PATH + '/**/*')
        .pipe(rename((path) => {
            path.dirname = path.dirname.replace(/^apps[/\\]/, '');
        }))
        .pipe(gulp.dest(DIST_PATH));
});


gulp.task('build', ['sass'], (callback) => {
    runSequence(
        'clean',
        'build:concat',
        'build:minify',
        [
            'build:flatpages',
            'build:images',
            'collectstatic',
        ],
        'unwrap',
        'clean:temp',
        callback);
});


/*
 * build:debug - same as build except js/css minification is bypassed
 */
gulp.task('nominify', ['nominify:js', 'nominify:css', 'build:minifyhtml']);

gulp.task('nominify:js', () => {
    return gulp.src(TEMP_PATH + '**/*.js')
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task('nominify:css', () => {
    return gulp.src([SRC_PATH + '**/*.css', TEMP_PATH + '**/*.css'])
        .pipe(rename((path) => {
            // Move to apps/appname/static/appname/css
            path.dirname = path.dirname.replace(/apps[/\\](.+?)[/\\]css/g, 'apps/$1/static/$1/css');
            path.extname = '.min.css';
        }))
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task('build:debug', ['sass'], (callback) => {
    console.log('Debug build initiated...');
    return runSequence(
        'clean',
        'build:concat',
        'nominify',
        [
            'build:flatpages',
            'build:images',
            'collectstatic',
        ],
        'unwrap',
        'clean:temp',
        callback);
});


gulp.task('test', ['build'], () => {
    return gulp.src(DIST_PATH + '**')
        .pipe(rsync({
            options: {
                chmod: 'Du=rwx,Dgo=rx,Fu=rw,Fgo=r',
                e: 'ssh -i "keyfile"'
            },
            username: "username",
            hostname: TEST_SERVER,
            destination: "path",
            recursive: true,
            root: DIST_PATH,
            progress: false
        }));
});


function log(err) {
    err.showStack = true;
    console.error(err);
    this.emit('end');
}


/**
 * Additional meta-tools that provide information without contributing
 * to dist output. Outputs to BUILD_PATH
 */
gulp.task('js:find_references', () => {
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
