/**
 * Created by Administrator on 2014/12/29.
 */
var Q=require('q');
z = require('./partials');
//data ={cond,value,condext}


exports. complete=function(conn) {
    if (!conn) return Q() ;
    if (conn.autoCommit) {
        conn.release();
        return Q() ;
    }
    var deferred = Q.defer();
    conn.commit(function (err) {
        try{
            conn.release();
        }catch(e){
        }
        if (err) return deferred.reject(err);
        deferred.resolve();
    });
    return deferred.promise;
}

exports.failure =function(conn) {
    if (!conn) return Q();
    if (conn.autoCommit) {
        conn.release();
        conn.qb=undefined;
        return Q();
    }
    var deferred = Q.defer();
    conn.rollback(function (err) {
        try{
            conn.release();
            conn.qb=undefined;
        }catch(e){
        }
        if (err) {
            return deferred.reject(err);
        }
        deferred.resolve();
    });
    return deferred.promise;
}

exports.select=function (conn, options, data) {
    var data=data||{};
    var deferred = Q.defer();
    options.table=z.table(options);
    var sql = 'SELECT '.concat(z.colums(options));
    var from = ' FROM '.concat(options.table);
    var eq = z.eq(options,data.cond);
    sql = sql.concat(from, eq.cs, data.condext?' AND '+data.condext:'');
    console.log(sql)
    conn.query(sql, eq.ps, function (err, result) {
        if (err) {
            return deferred.reject(err);
        }
        deferred.resolve(result);
    });
    return deferred.promise;
}


exports. insert=function(conn,options,data){
    var deferred = Q.defer();
    options.table=z.table(options);
    var parse = z.insertparse(data.value,options)
    var sql='INSERT INTO '.concat(options.table,'(',parse.fs,')','VALUES(',parse.fv,')');
    console.log(sql)
    conn.query(sql,parse.ps,function(err,result){
        if (err) return deferred.reject(err);
        deferred.resolve(result.affectedRows);
    });
    return deferred.promise;
}

exports.remove =function(conn,options,data){
    var deferred = Q.defer();
    options.table=z.table(options);
    var sql= 'DELETE FROM '.concat(options.table);
    var eq= z.eq(options,data.cond);
    sql=sql.concat(eq.cs,data.condext?' AND '+data.condext:'');
    console.log(sql)
    conn.query(sql,eq.ps,function(err,result){
        if (err) {
            return deferred.reject(err);
        }
        deferred.resolve(result.affectedRows);
    });
    return deferred.promise;
}

exports.update=function(conn,options,data){
    var deferred = Q.defer();
    options.table=z.table(options);
    var parse= z.updateparse(options,data.value,data.cond);
    var sql= 'UPDATE '.concat(options.table,' SET ',parse.fs);
    sql=sql.concat(parse.cs,data.condext?' AND '+data.condext:'');
    console.log(sql)
    conn.query(sql,parse.ps,function(err,result){
        if (err) {
            return deferred.reject(err);
        }
        deferred.resolve(result.affectedRows);
    });
    return deferred.promise;
}

exports. query=function(conn,sql,parames){
    var deferred = Q.defer();
    console.log(sql)
    conn.query(sql,parames||[],function(err,result){
        if (err) return deferred.reject(err);
        deferred.resolve(result);
    });
    return deferred.promise;
}

