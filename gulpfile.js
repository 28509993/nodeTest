
var gulp = require('gulp')
    ,path = require("path")
    ,deploy= require(path.resolve( "lib/core/gulp-depoly"))

gulp.task('zj' ,function( ) {
    var soucrce=path.resolve('app/car')
    var target=path.resolve('public/modules/car')
    deploy(soucrce,target);
});

gulp.task('all', ['zj'] ,function( ) {
    console.log('this is the clean task');
});

gulp.task('default', function() {
    //gulp.start('all');
    var soucrce=path.resolve('app/car')
    var target=path.resolve('public/modules/car')
    deploy(soucrce,target);
});

//npm install --save-dev gulp-uglify
//gulp