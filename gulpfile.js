var gulp = require('gulp'),
concat = require('gulp-concat');


gulp.task('build', function(e) {
  'use strict';
  // Build the JS
  return gulp.src([
    'src/envy-*.js',
  ])
  .pipe(concat('envy-slider.js'))
  .pipe(gulp.dest('dist/'));
});
