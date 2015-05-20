var gulp = require('gulp'),
concat = require('gulp-concat');


gulp.task('watch', ['build'], function(e) {
    'use strict';
    gulp.watch('./src/*.js', ['build']);
    gulp.watch('./examples/*.html', ['build']);

    e();
});

gulp.task('build', function(e) {
  'use strict';
  // Build the JS
  return gulp.src([
    'src/envy-*.js',
  ])
  .pipe(concat('envy-slider.js'))
  .pipe(gulp.dest('dist/'));
});
