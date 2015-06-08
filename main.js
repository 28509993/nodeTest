#!/usr/bin/env node
process.env.development=true;
//var Q=require('q');
var path=require('path')
    , mcomm=require('./lib/mid-comm')
    , scomm=require('./lib/self-comm')
    , bcomm=require('./lib/biz-comm')
    , setting= require(path.resolve('setting.json'))
    ,proxypool=require('./lib/response/proxys-pool');

scomm.logger.init(setting.log)
scomm.qb.init(setting.mysql);

proxypool.setProxys(setting.proxys);
var logger=scomm.logger();

function start(){
    var app=require('./app/app')(setting);
    app.set('port',setting.server.port);
    //scomm.masterFork(app);
    var server = app.listen(setting.server.port, function() {
        console.log('Express server listening on port ' + server.address().port);
    });

}

mcomm.Q.all([
    bcomm.init(setting.mysql),
    scomm.matrix.valid(setting.session.redis)
    //,scomm.proxyValid(setting.bizproxy)

]).done(start);

process.on('uncaughtException', function (err) {
    logger.error(err);
});

//浙A133UV  A66765

/*
function dddd(fn){
    fn();
}

 function testa( a){
     var deferred = mcomm.Q.defer()


     dddd(function(){
         deferred.resolve('resove')
     })

     return deferred.promise;
 }



testa('a').then(function(dd){
    console.log(dd)
});
console.log('dddddddddddd')
*/
//maria 6306
//console.log(scomm.tplparse.restore('resource/main_frame.html'));

/*
*
 Q.all([
 test(10),//执行三个函数
 test(20),
 test(30)
 ])
 .spread(function (x, y,z) {//三个函数返回的三个值
 console.log(x, y,z);
 return x+y+z;
 })
 .done(function(str){//完成前面的后执行
 console.log(str)
 });
* */

/*
var routes=[];
routes[routes.length]={id:'/101',index:1,url:'/system/core/avengers.html',title:'工作区'};
routes[routes.length]={id:'/102',index:1,url:'/system/core/dashboard.html',title:'功能区'};
routes[routes.length]={id:'/1001',index:1,url:'/system/sign/signin.html',title:'用户登录'};
routes[routes.length]={id:'/1002',index:1,url:'/system/sign/alterpwd.html',title:'密码修改'};
routes[routes.length]={id:'/1003',index:1,url:'/system/sign/signin.html',title:'用户登录'};
routes[routes.length]={id:'/1004',index:1,url:'/rtm/query/queryMeter.html',title:'表具查询'};

routes.forEach(function(item){
    console.log(item.id+'-----'+scomm.hash(item.url))
})
*/

