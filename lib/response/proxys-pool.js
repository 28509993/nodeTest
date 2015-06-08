/**
 * Created by Administrator on 2015/3/13.
 */

//"proxys":{"0":["http://localhost:8012","http://localhost:8013"]},
var httpProxy = require('http-proxy')
    ,util=require('util')
    ,LOG=require('../core/logger')();
//drift
var cache={};
var proxys={}
var driftTime=15*60*1000;
;!function(){
    setInterval(function(){
        for(var cname in cache){
            var inner=cache[cname];
            inner.drift&&(inner.drift<Date.now())&&(inner.drift=false);
        }
    },driftTime);
}();

function serverProxy(alias) {
    var inner=innerProxy(alias);
    var proxy=  httpProxy.createProxyServer({target:inner.url});
    proxy.on('error', function(err) {
        inner.drift=Date.now()+driftTime;
        LOG.error('connect to proxy : '+inner.url);
    })
    return proxy;
}

function innerProxy(alias) {
    var px = proxys[alias];
    var pxs= px['list']||[];
    var url=  pxs[(parseInt(Math.random()*px.size))];
    var inner=cache[url];
    if (inner&&!inner.drift){
        return inner;
    }
    for (var i = 0, n = pxs.length; i < n; i++) {
        url=pxs[i]
        inner=cache[url];
        if (inner&&!inner.drift){
            return inner;
        }
    }
    return {};
}

serverProxy.serverUrl=function(alias) {
    return innerProxy(alias).url;
}

serverProxy.setProxys=function(proxys_){
    var p=proxys_||{};
    for(var item in proxys_||{}) {
        if (!Array.isArray(p[item])) continue;
        proxys[item]={size:p[item].length,list:p[item]} ;
        p[item].forEach(function (url) {
            cache[url]={url:url,drift:false};
        })
    }
}
exports=module.exports=serverProxy
