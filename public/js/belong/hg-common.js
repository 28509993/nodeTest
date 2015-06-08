/**
 * Created by Administrator on 2015/3/5.
 */
define(["avalon",'jquery','toastr' ], function(avalon,jQuery,toastr,Spinner) {
//console.log(Spinner);
    (function(root){
        root.Spinner=Spinner;

    })(window);

    (function ($) {
        $.getUrlParam = function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            return r ? decodeURI(r[2]) : null;
        }
    })(jQuery);

    (function (avalon) {
        var p= $.getUrlParam('p')||'0';
        Object.defineProperty(avalon, "webType", {
            get: function () {  return p; }
        });
    }(avalon));


    ;!function(){
        var allListener={};
        avalon.ListenerJoin=function(name ,fn){
            if (! avalon.isFunction(fn)) return ;
            var b=false;
            var namedListeners=allListener[name]||(allListener[name]=[]);
            avalon.each(namedListeners,function(i,item){
                if (item===fn){     b=true; }
            });
            b||namedListeners.push(fn);
        };
        avalon.ListenerEmit=function(name ,args){

            var namedListeners=allListener[name]||(allListener[name]=[]);
            avalon.each(namedListeners,function(i,item){
                item.call(null, args);
            });
        };

        avalon.ListenerOnce=function(name ,args){
            avalon.ListenerEmit(name,args);
            delete allListener[name] ;
        };

        avalon.ListenerRemove=function(name ,fn){
            var namedListeners=allListener[name];
            if (!namedListeners){return;  }
            if (fn){
                avalon.each(namedListeners,function(i,item){
                    if (item===fn){  namedListeners.splice(i,1)  ; }
                });
            }else{
                delete allListener[name] ;
            }
        };

    }();

    (function (avalon,toastr) {
        //toastr.options = {            "positionClass": "toast-bottom-right"        };
        avalon.aError = function(message) {
            toastr.error(message);
        };
        avalon.aWarning = function(message) {
            toastr.warning(message);
        };
        avalon.aSuccess = function(message) {
            toastr.success(message);
        };
        avalon.aInfo = function(message) {
            toastr.info(message);
        };
        avalon.aLog = function(message) {
            avalon.log(message);
            toastr.info(message);
        };
    })(avalon,toastr);

    (function (avalon) {
        avalon.post = function (options,antiProxy) {
            var deferred = Promise.defer();
            function success(data){
                avalon.debug && avalon.log(data)
                if (data.hasOwnProperty('TResult') && data.TResult == 'Success') {
                    delete data.TResult;
                    deferred.resolve(data);
                } else {
                    delete data.TResult;
                    data.TDesc = data.TDesc || 'switch data is error!'
                    deferred.reject(data);
                    if (data.hasOwnProperty('TCode')&&data.TCode===10) {
                        setTimeout("window.location.href='/index.html?p=-1'",3000)
                    }
                }
            }
            /*
            function fail(err){
                err.TDesc = options.url + '连接错误！';
                deferred.reject(err)
            }
            var jqxhr=options.data? $.post(options.url, options.data, 'json'):$.post(options.url, 'json');
            jqxhr.done(success)
                .fail(fail);*/
            function fail(ajxhr,textStatus,err){
                err.TDesc = options.url + '连接错误！';
                deferred.reject(err)
            }
            var settings={type: "POST",url:options.url,dataType:"json",timeout: 5000,
                data:options.data||{},
                error:fail,   success: success,
                headers: avalon.mix(antiProxy?{'Anti-Proxy':antiProxy+''}:{},options.headers)
            }
            $.ajax(settings);
            return deferred.promise;
        };


    })(avalon)

});