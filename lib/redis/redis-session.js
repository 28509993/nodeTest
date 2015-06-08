
var matrix = require('./redis-matrix')
    ,util=require('util')
    ,Q=require('q')
    ,hash=require('../util/hash').hash

exports=module.exports=function (options){
    var fieldkey='session',
        fielduser='user'
        ,PREFIX_AUTH='auth:';
    //opt { host: 'localhost', port: 6379, db: 0 }
    function Store(session,opt){
        Object.defineProperty(this, 'session', { value: session });
    }
    Store.prototype.load = function(){
        var self=this;
        var key=self.session.storeKey();
        var mkeys=[fieldkey,fielduser];
        var deferred = Q.defer();
        var redis;
        matrix(options).then(function(client){
            redis=client;
            client.hmget(key, mkeys, function (err, arrdata) {
                if (err) return  deferred.reject(err);
                var rddata={}
                rddata[fieldkey]=arrdata[0];
                rddata[fielduser]=arrdata[1];
                deferred.resolve(rddata);
            })
        }).done(function(client){
            redis.releasePool1&&redis.releasePool1()
        },function(err){
            deferred.reject(err);
            redis.releasePool1&&redis.releasePool1()
        })
        return deferred.promise;
    }

    //0 delete
    Store.prototype.expire=function(ttl) {
        var self = this;
        var sess = self.session;
        var key = sess.storeKey();
        var deferred = Q.defer();
        var redis;
        matrix(options)
            .then(function (client) {
                redis=client;
                client.expire(key, ttl, function () {
                    deferred.resolve();
                });
            })
            .done(function () {
                redis.releasePool1 && redis.releasePool1()
            }, function () {
                deferred.reject(err);
                redis.releasePool1 && redis.releasePool1()
            });
        return deferred.promise;
    }


    Store.prototype.save=function(data){
        var self=this;
        var sess=self.session;
        if (!sess.user||!sess.user['USER_ID']) return Q();
        var key=sess.storeKey();
        var deferred = Q.defer();
        var data={}
        data[fieldkey]=JSON.stringify(sess.cookies||{});
        data[fielduser]=JSON.stringify(sess.user||{});
        var ttl= sess.cookies.maxAge/1000;
        var redis;
        matrix(options).then(function(client){
            redis=client;
            client.hmset(key,data, function(err){
                if (err) return    deferred.reject(err);
                self.expire(ttl).then(function(){
                    var uhashname = PREFIX_AUTH + sess.user['USER_ID']
                        , ufield = hash(sess.clientIP);
                    client.hset(uhashname, ufield, key, function () {
                        deferred.resolve();
                    });
                });
            });
        }).done(function(){
            redis&&redis.releasePool1 && redis.releasePool1()
        },function(){
            deferred.reject(err);
            redis&&redis.releasePool1 && redis.releasePool1()
        })
        return deferred.promise;
    }

    return function(session,opts){
        return new Store(session,opts)
    } ;
}
