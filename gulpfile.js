const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const sass = require('gulp-dart-sass');
const prefix = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const mqpacker = require('@lipemat/css-mqpacker');
const notify = require('gulp-notify');
const ngrok = require('ngrok');

gulp.task('browser-sync', function () {
    browserSync.init({
        startPath: '/index.html',
        server: {
            baseDir: "./dist",
            directory: true
        }
    }, async function (err, bs) {
        const tunnel = await ngrok.connect({
            port: bs.options.get('port'),
            region: 'eu'
        });
        console.log(' ------------------------------------------------');
        console.log(`  ngrok control panel: http://localhost:4040`);
        console.log(`public URL running at: ${tunnel}`);
        console.log(' ------------------------------------------------');
    });
    gulp.watch('./scss/**/*.scss', gulp.series('sass'));
    gulp.watch('./**/*.{html,css,js,php}').on('change', browserSync.reload);
});

// Compile sass into CSS (/dist/css/) & auto-inject into browser
gulp.task('sass', function () {
    const processors = [
        mqpacker({sort: true})
    ];
    return gulp.src('./scss/**/*.scss')
        .pipe(plumber({
            errorHandler: notify.onError({
                title: 'SASS compile error!',
                message: '<%= error.message %>'
            })
        }))
        .pipe(sourcemaps.init())
        // outputStyle: nested (default), expanded, compact, compressed
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(prefix("last 2 versions"))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('default', gulp.series('sass', 'browser-sync'));
