/**
 * Created by Administrator on 2014/12/11.
 */

var defer = typeof setImmediate === 'function'
    ? setImmediate
    : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) }
defer =function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) };

require('./core/constant');

exports.defer=defer;
exports.md5=require('./util/md5');
exports.hash=require('./util/hash').hash;
exports.type=require('./util/type-util');
exports.urlutil=require('./util/url-util');
exports.qb=require('./qb');
exports.qError=require('./core/q-error');

exports.matrix=require('./redis/redis-matrix');

exports.redisStore=require('./redis/redis-session');
exports.session=require('./redis/session');

exports.logger=require('./core/logger');
exports.routers=require('./response/routers');
exports.tplparse=require('./core/tpl-parse');
exports.$include=require('./core/$include');
exports.masterFork=require('./core/master-fork');

/*
var Q=require('q');
Q.fcall(function(){

    return 'aaa'
}) .then('dd').done(function(aa){
    console.log(aa)
})
*/


//Q(1).then(function(s){console.log(s)});

/*
 bind create new fn
 zlw.sayHello.call(xlj,24)
 zlw.sayHello.bind(xlj, [24])();
 zlw.sayHello.bind(xlj)(24);
 zlw.sayHello.bind(xlj)([24]);
 xlj.sayHello.bind(xlj)([24]);

 var log = Function.prototype.bind.call(console.log, console);
 log.apply(console, ["this", "is", "a", "test"]);
 if (!Function.prototype.bind) {
 Function.prototype.bind = function (oThis) {
 if (typeof this !== "function") {
 // closest thing possible to the ECMAScript 5 internal IsCallable function
 throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
 }

 var aArgs = Array.prototype.slice.call(arguments, 1),
 fToBind = this,
 fNOP = function () {},
 fBound = function () {
 return fToBind.apply(this instanceof fNOP &amp;&amp; oThis
 ? this
 : oThis,
 aArgs.concat(Array.prototype.slice.call(arguments)));
 };

 fNOP.prototype = this.prototype;
 fBound.prototype = new fNOP();

 return fBound;
 };
 }


;!function(){
    var conn;
     var qb=exports.qb({
     "host": "localhost",
     "database": "netmeter",
     "user": "root",
     "password": "123456",
     "port": 3306
     });
    qb.begin(false)
        .then(function(conn_){
            conn = conn_;
            var sql = "SELECT DATABASE() as db";
            return  qb.query1(conn, sql)
        }).then(function(d){
            console.log(d);
        })
}();
*/

/*
*
*
 function hyphen(target) {
 //转换为连字符线风格
 return target.replace(/([a-z\d])([A-Z]+)/g, "$1-$2").toLowerCase()
 }

 function camelize(target) {
 //转换为驼峰风格
 if (target.indexOf("-") < 0 && target.indexOf("_") < 0) {
 return target //提前判断，提高getStyle等的效率
 }
 return target.replace(/[-_][^-_]/g, function(match) {
 return match.charAt(1).toUpperCase()
 })
 }
*
* */