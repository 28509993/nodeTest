/**
 * Created by Administrator on 2014/12/17.
 */

var EE = require('events').EventEmitter
    , util = require('util')
    , path=require('path')
    ,md5=require('../util/md5')
    , Q = require("q")
    ,tplparse=require('../core/tpl-parse')
    ,mime=require('../core/mime')
    ,Readable  = require('stream').Readable
    ,typeUtil=require('../util/type-util')
    ,urlutil=require('../util/url-util')
    , formidable = require('formidable')
    ,request=require('request')
    ,logger=require('../core/logger')
    ,proxyspool= require('./proxys-pool')
    ,Business=require('../core/business');

require('../core/$extend')

var defer = typeof setImmediate === 'function'
    ? setImmediate
    : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) }


function Answer(req,res,next){
    EE.call(this);
    Business.call(this);
    var expires = new Date();
    this.req=req;
    this.res=res;
    this.next=next;
    this.LOG=logger();
    this.fields=undefined;
    this.forwarddata=undefined;
    this.URI=req._URI_;
    this.headers={
        'Cache-Control': 'public,max-age=0'
        ,'Expires':expires.toUTCString()
    };
    this.ETag=undefined;
    Object.defineProperty(this, "url", {
        get: function () { return this.req.originalUrl; }
    });
}
util.inherits(Answer, EE);
util.inherits(Answer, Business);

Answer.prototype.setETag=function(raw,etag){
    etag ||( this.ETag = '"' + md5(raw) + '"')
    this.headers['ETag']=this.ETag;
    this.headers['Last-Modified']=options['Last-Modified'] ||(new Date()) .toUTCString();
}

Answer.prototype.rawCache=function(key,cache,raw){
    var self=this;
    var obj=cache[key];
    var _raw=raw;
    if (!obj){
        self.setETag(_raw);
        cache[key]  ={raw:_raw,ETag:self.ETag,'Last-Modified':self.headers['Last-Modified']};

    }else {
        _raw=obj.raw;
        self.setETag(_raw,obj.ETag);
    }
    return _raw;
}

Answer.prototype.waitPost=function(){
    var self=this;
    if (self.req.method!== 'POST' || self.forwarddata) {
        return Q();
    }
    var deferred = Q.defer();
    var form = new formidable.IncomingForm()
    self.forwarddata={};
    self.req.forwarddata={};
    form.parse(self.req,function(error, delayFields, files) {
        if (error)  return deferred.reject(error);
        self.forwarddata = delayFields;
        self.req.forwarddata == delayFields;
        self.fields = util._extend(self.fields || {}, delayFields);
        deferred.resolve()
    });
    return deferred.promise;
}


Answer.prototype. pipeRequest=function(url,data){
    var self=this;
    var options=!data?{method:"GET"}:{method:"POST",json:data}
    setCookie.call(self,options);
    request(url,options )
        .on( 'error',function ( err ) {  self.next(err);      })
        .pipe(self.res);
}

function setCookie(data){
    var self=this;
    data.headers=data.headers||{};
    data.headers.Cookie = self.req.header('Cookie');

}

Answer.prototype.request=function(url,data){
    var deferred = Q.defer()
        ,self=this;
    var options=!data?{method:"GET"}:{method:"POST",json:data}
    setCookie.call(self,options);
    request(url,options,function (err,response,body) {
            if (err) return deferred.reject(err);
            var bodydata = body;
            try {
                if (typeUtil.isString(bodydata) && bodydata.slice(0, 1) === '{') {
                    bodydata = JSON.parse(bodydata);
                    deferred.resolve(bodydata);
                }
                else {
                    deferred.reject(new Error(body || 'receive data is not json!'));
                }
            } catch (errbd) {
                deferred.reject(errbd);
            }

        }
    )
    return deferred.promise;
}

Answer.prototype. proxyUrl=function(group){
    var self=this;
    var para= util._extend({},self.URI.query);
    para= util._extend(para,self.fields)
    var url=urlutil.objectToUrl(self.URI.pathname,para);
    var surl=proxyspool.serverUrl(group||'0')
    return  surl+url;
    //require('./lib/response/proxys').serverUrl('0')
}

Answer.prototype.html=function(raw){
    //senduncompressbuff.call(this, [].concat(raw,Array.prototype.slice.call(arguments,0)))
    this.send(raw,{type:'html',cached:true})
}

Answer.prototype.send=function(raw,options){
    var options=options||{}
    options.type= options.type||'txt';
    this.headers['Content-Type']= mime.types[options.type];
    if (options.cached && this.ETag === this.req.headers[ 'if-none-match'] ){
        this.res.writeHead(304, "Not Modified");
        this.res.end();
        return ;
    }
    senduncompressbuff.call(this,raw)
}

////suport jsonp
function date2str(data){
    if (typeof(data)!=='object') return ;
    if (Object.prototype.toString.call(data)==='[object Array]'){
        data.forEach(function(item){
            date2str(item);
        })
    }else{
        for (var i in data){
            var v=data[i];
            if (Object.prototype.toString.call(v)==='[object Date]'){
                data[i]= v.format('yyyy-MM-dd hh:mm:ss');
            }else{
                date2str(v);
            }
        }
    }
}

Answer.prototype.json=function(raw){
    this.headers['Content-Type']= mime.types['json']+';charset=utf-8';
    date2str(raw);


    var raw= typeUtil.isString( raw)? raw: (raw.TResult||(raw.TResult='Success'),JSON.stringify( raw));
    /*
    if (this.params&&this.params.callback) {
        data=this.params.callback+'('+data+')';
        answer.res.writeHead(200, {'Content-Type':'text/javascript;'});
        answer.res.end(data); //.json
    }else{
        this.res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
        this.res.end(data);
    }*/
    senduncompressbuff.call(this, raw)
}

Answer.prototype.renderTpl=function(tplfile,options){
    return tplparse.render(tplfile,options);
}

Answer.prototype.jError=function(msg,code){
    var msg=msg;
    if (Object.prototype.toString.call(msg)==='[object Error]'){
        msg=msg.message;
    }
    var data={TResult:'Failure',TDesc:msg};
    code&&(data.TCode=code)
    this.json(data);
}

function senduncompressbuff(raw){
    var self=this;
    var buffer = new Readable;
    buffer.push(raw);
    buffer.push(null);
    self.res.writeHead(200,self.headers);
    buffer.pipe(self.res);
}

module.exports=function doAnswer(req,res,next,dofn) {
    var answer = new Answer(req, res, next);
    answer.fields = req._URI_.query;
    //user need  autohrize
    if (dofn.auth && (!req.session || !req.session.user)) {
        answer.jError('user not login!', 10)
        return;
    }
    //delay for get post cache data
    try{
        if (dofn.delay) {
            dofn.call(answer);
        } else {
            answer.waitPost.call(answer)
                .then(function () {
                    dofn.call(answer);
                })
                .fail(next)
        }
    }catch(err){
        next(err);
    }


}

module.exports.autoProxy=function(req,res,next) {
    var px=req.headers[ 'anti-proxy'];
    if (!px) return next();

    if (!req.session || !req.session.user) {
        var answer = new Answer(req, res, next);
        answer.jError('user not login!', 10)
        return;
    }
    var proxy = proxyspool(px);
    if (!proxy) {
        var answer = new Answer(req, res, next);
        answer.jError('Not Found !', 50)
        return;
    }
    proxy.on('error', function (err) {
        var answer = new Answer(req, res, next);
        answer.jError('connect proxy error!', 51);
    });
    proxy.web(req, res);

}