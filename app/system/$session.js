
exports=module.exports  =function (){
    function sessioncache(){
        var self=this;
        self.mustAuth=false;
        var user =mcomm.util._extend({},self.req.session.user||{});
        delete user.USER_PWD;
        self.json(user);
    }

    ;!function(){
        sessioncache.alias="sessioncache";
    }();

    return [sessioncache];

}()
