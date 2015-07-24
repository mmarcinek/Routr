var gulp = require('gulp'), 
    sass = require('gulp-ruby-sass') 
    notify = require("gulp-notify") 
    bower = require('main-bower-files');
    del = require('del');
    server = require('gulp-server-livereload');
    uglify = require('gulp-uglify')
    minifyCss = require('gulp-minify-css');


var config = {
     sassPath: './resources/sass',
     bowerDir: './bower_components' ,
    cssPath: './public/css/vendor',
    jsPath: './public/js/vendor'
}


gulp.task('icons', function() { 
    return gulp.src(config.bowerDir + '/fontawesome/fonts/**.*') 
        .pipe(gulp.dest('./public/css/fonts')); 
});

// -- SASS -- //

gulp.task('sass:user', function() { 
    return gulp.src(config.sassPath + '/*.scss')
         .pipe(sass({style: 'compressed'}) 
            .on("error", notify.onError(function (error) {
                 return "Error: " + error.message;
             }))) 
         .pipe(gulp.dest('./public/css')); 
});

gulp.task('sass:vendor', function() { 
    return gulp.src(config.sassPath + '/vendor/*.scss')
         .pipe(sass({
             style: 'compressed',
             loadPath: [
                 './resources/sass',
                 config.bowerDir + '/materialize/sass/',
                 config.bowerDir + '/fontawesome/scss',
             ]
         }) 
            .on("error", notify.onError(function (error) {
                 return "Error: " + error.message;
             }))) 
         .pipe(gulp.dest(config.cssPath)); 
});

gulp.task('sass', ['sass:vendor','sass:user']);

// -- BOWER -- //

gulp.task('bower:js', function() {
  return gulp.src(bower({filter: '**/*.js'}))
    .pipe(uglify())
    .pipe(gulp.dest(config.jsPath));
});

gulp.task('bower:css', function() {
  return gulp.src(bower({filter: '**/*.css'}))
    .pipe(minifyCss())
    .pipe(gulp.dest('public/css/vendor'));
});

gulp.task('bower',['bower:js','bower:css']);
gulp.task('vendor', ['bower','sass:vendor']);

// -- CLEAR -- //

gulp.task('clear:js', function() {
	del([
		'public/js/vendor/**/*',
    '!public/js/map.js'
		]);
});

gulp.task('clear:css', function() {
  del([
    'public/css/vendor/**/*',
    ]);
});

gulp.task('clear', ['clear:js','clear:css']);

// -- SERVER -- //

gulp.task('server', function() {
  gulp.src('public')
    .pipe(server({
      livereload: true,
      defaultFile: 'index.html'
    }));
});

// Rerun the task when a file changes
 gulp.task('watchList', function() {
     gulp.watch(config.sassPath + '/**/*.scss', ['sass:user']); 
});

gulp.task('watch', ['server', 'watchList']);

// -- DEFAULT -- //

  gulp.task('default', ['sass', 'icons', 'bower']);
