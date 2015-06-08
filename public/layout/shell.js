/**
 * Created by Administrator on 2015/2/15.
 */

define(["avalon"], function(avalon) {

    var vmNavbar=avalon.define({
        $id: 'vm-navbar',
        loginName:'王敏1',
        loginRole:'超级管理员',
        userMenus:[]
    });
    function getuserdata(){
        var deferred = Promise.defer();
        avalon.post({url:"/testdata"}).done(function(data){
            /*
             avalon.each(data.userMenus,function(i,item){
             item.hint||(item.hint={});
             item.hint.style||(item.hint.style='fa arrow');
             })
             vmNavbar.userMenus=data.userMenus;
             */
            deferred.resolve();
        }).fail(function(e) {
            deferred.reject(e);
        });
        return deferred.promise;
    }
    function getuserMenus(){
        var deferred = Promise.defer();
        require(['json!/userMenus'],function(userMenus){
            avalon.each(userMenus,function(i,item){
                item.hint||(item.hint={});
                item.hint.style||(item.hint.style='fa arrow');
            })
            vmNavbar.userMenus=userMenus;
            deferred.resolve();
        });
        return deferred.promise;
    };

    return Promise.all([getuserdata(),getuserMenus()]);
});


