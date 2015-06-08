/**
 * Created by Administrator on 2015/3/25.
 */
var Q=require('q');
var defer = typeof setImmediate === 'function'
    ? setImmediate
    : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) };

exports=module.exports=function(err){
    var deferred = Q.defer();
    defer(function(){
        deferred.reject(err);
    });
    return deferred.promise;
}