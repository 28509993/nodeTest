/**
 * Created by Administrator on 2014/11/28.
 */
var mysql = require('mysql')
    ,execute=require('./sql-execute')
    ,Q=require('q');
var pool;
exports=module.exports=function (autoCommit){
    var deferred = Q.defer();
    pool.getConnection(function (err, conn) {
        if (err) {
            return deferred.reject(err);
        }
        conn.autoCommit = autoCommit;
        if (autoCommit) {
            return deferred.resolve(conn);
        }
        conn.beginTransaction(function (err1) {
            if (err1) {
                conn.release();
                return deferred.reject(err);
            }
            deferred.resolve(conn);
        });
    });
    return deferred.promise;
}


exports. complete=execute.complete;
exports.failure =execute.failure;
exports.select=execute.select;
exports. insert=execute.insert;
exports.remove =execute.remove;
exports.update=execute.update;
exports. query=execute.query;

exports.quickSelect=function(options, data){
    var qb= module.exports;
    var conn
        , deferred = Q.defer()
    qb(true).then(function(db){
        conn=db;
        return qb.select(conn, options,data);
    }).then(function (rst) {
        var v=onlyone&&rst?  rst[0]:rst;
        deferred.resolve(v);
    }).done(function () {
        qb.complete(conn);
    }, function (err) {
        console.log(err);
        qb&&qb.failure(conn);
        deferred.reject(err);
    })
    return deferred.promise;
}

exports.quickTable=function(cond,onlyone){
    var qb= module.exports;
    var conn
        , deferred = Q.defer()
    qb(true).then(function(db){
        conn=db;
        var tabname=cond.$table;
        delete cond.$table;
        return qb.select(conn, {table: tabname},{cond:cond});
    }).then(function (rst) {
        var v=onlyone&&rst?  rst[0]:rst;
        deferred.resolve(v);
    }).done(function () {
        qb.complete(conn);
    }, function (err) {
        console.log(err);
        qb&&qb.failure(conn);
        deferred.reject(err);
    })
    return deferred.promise;
}

exports.quickSql=function(sql,parames){
    var qb= module.exports;
    var conn
        , deferred = Q.defer()
    qb(true).then(function(db){
        conn=db;
        return qb.query(conn,sql,parames||[]);
    }).then(function (rst) {
        deferred.resolve(rst);
    }).done(function () {
        qb.complete(conn);
    }, function (err) {
        console.log(err);
        qb&&qb.failure(conn);
        deferred.reject(err);
    })
    return deferred.promise;
}

exports.init=function(options){
    pool||Object.defineProperty(exports, 'options', { value: options });
    var newOpt={
        host: options.host|| 'localhost',
        user: options.user,
        password: options.password,
        database:options.database,
        port:options.port|| 3306,
        connectionLimit: 10,
        supportBigNumbers: true
    };
    pool  = mysql.createPool(newOpt);
}


