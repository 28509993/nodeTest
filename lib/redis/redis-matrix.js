/**
 * Created by Administrator on 2014/12/19.
 */

var genericPool=require('generic-pool')
    , redis=require('redis')
    ,Q = require('q')
    , LOG=require('../core/logger')();
var cache={};
exports=module.exports=function(options){
    var pool=getPool(options);
    var deferred = Q.defer();
    pool.acquire(function(err, client) {
        if (err) return deferred.reject(err);
        deferred.resolve(client);
        client.releasePool1=function(){
            pool.release(client);
        };
    });
    return deferred.promise;
}

function getPool(options){
    var key=options.host+options.port+options.db;
    var pool=cache[key];
    if (pool) return pool;
    cache[key] =pool = genericPool.Pool({
        name     : 'sessRedis',
        create   : function(callback) {
            var client=redis.createClient(options.port, options.host);
            options.password&&client.auth(options.password);
            options.db &&  client.select(options.db);
            callback(null,client);
        },
        destroy  : function(client) { client.quit(); },
        max      : 10,
        min      : 1,
        reapIntervalMillis :300000,
        idleTimeoutMillis : 600000,
        log : true
    });
    return pool;
}

exports.valid=function(options){
    var deferred = Q.defer()
    var client=redis.createClient(options.port, options.host);
    options.db &&  client.select(options.db);
    client.on('error', function (err) {
        LOG.error('checked redis connect is error!');
        client.quit();
        client.end();
        deferred.reject(err)
    });
    client.on('connect', function () {
        LOG.info('checked, connect  to redis address [%s]is ok!', client.address);
        client.quit();
        client.end();
        deferred.resolve()
    });
    return deferred.promise;
}