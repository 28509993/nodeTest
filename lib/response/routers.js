/**
 * Created by Administrator on 2014/12/10.
 */

var express = require('express')
    ,URL = require('url')
    ,Q=require('q')
    ,http = require('http')
    ,httpProxy = require('http-proxy')
    //,request = require('request')
    //, domain = require('domain')
//,WebSocketClient = require('websocket').client;
    ,querystring=require('querystring')
    , rule = {
        //login:  /^\/login/i,
        //anything: /(?:\/.*)?/,
        //list:   /(?:\/\?p=\d+)?/i,
        //frame:   /\/(.+|action)/i,
        //frame:   /\/action/i,
        main: /^\/index.html/i,
        home:   /^\/$/,
        //$:      /\/?$/i,
        //$0:      /$/i,
        bizrest2:'/:who/:what',
        bizrest:'/',
        bizrest3:'/:where/:who/:what'
    };


var proxycach={};
function getClientIP(req){
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress
        || req.socket.remoteAddress || req.connection.socket.remoteAddress;
};

 function $$route(routers){
    var doAnswer=require('./answer')
    var router = express.Router({strict:true})
    router.use(doAnswer.autoProxy);
    router.use(function(req,res,next){
        req._URI_=URL.parse(req.originalUrl, true); //req.ur
        req._URI_.host=getClientIP(req);
        next();
    });
    router.use(rule.home,function(req,res,next){
        res.redirect('/index.html');
    })
    router.use(rule.main,function(req,res,next){
        routers['$main']?  doAnswer(req,res,next, routers['$main']):next()
    })
    router.use('/',function(req,res,next){
        var routelayers=req._URI_.pathname.toUpperCase().replace(/^\//g,'').split('/');
        var routefun=routers;
        for(var i= 0,n=routelayers.length;i<n;i++){
            routefun=routefun[routelayers[i]];
            if (!routefun||typeof(routefun)==='function')  break;
        }
        routefun=routefun&&typeof(routefun)==='function'&& i===routelayers.length-1
            ?routefun:null;
        if (!routefun){
            next();
            return ;
        }
        doAnswer(req,res,next, routefun);
    })
    return router;
}

/*
$$route.autoProxyPath=function(url,xserver){
    if (xserver){
        var poxy;
        for (var item in proxycach ){
            item.xurl===xserver&&(poxy=item.proxy);
        }
        poxy=poxy||httpProxy.createProxyServer({target:xserver});
        proxycach[url]=proxycach[url]||{url:url,xurl:xserver,proxy:poxy};
    }
    return proxycach[url];
}*/

function useautoproxy(req,res,next){

    next();
    /*
    var target= $$route.autoProxyPath(req._URI_.pathname);
    if (!target||!target.proxy) { next(); return ;}
    var proxy= target.proxy;

    proxy.on('error', function(err) {
        next(err);
    });
    proxy.web(req, res);
    */

    /*
    req.pipe(request( target.xurl +req.originalUrl)
        .on( 'error',function ( err ) {  next(err);      }) )
        .pipe(res); */

//    var d = domain.create();
//    d.on('error', function (err) {
//        LOG.error(err);
//        next(err);
//    });

//    var d = domain.create();
//    d.on('error', function (err) {
//        LOG.error(err);
//        next(err);
//    });
    //d.add(req);
    //d.add(res);
    //d.run( function () {      }    )


}

exports=module.exports=$$route;


