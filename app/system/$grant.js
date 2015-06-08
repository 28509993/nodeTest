var path=require('path')
    ,mcomm=require(path.resolve('lib/mid-comm'))
exports=module.exports  =function (){
    function login(){
        var self = this;
        var raw={}
        function callSaveSession(result) {
            raw = result;
            if (dataOK(result) && result.SYS_USER) {
                self.req.session.user=result.SYS_USER;
                return self.req.session.save();
            }
            throw  new Error('');
        }

        function beginer() {
            return self.request.call(self, self.proxyUrl())
        }

        mcomm.Q.fcall(beginer)
            .then(callSaveSession)
            .then(function () {
                raw && raw.SYS_USER && (delete raw.SYS_USER.USER_PWD)
                raw.jumpurl='/index.html?p=0#!/';
                self.json(raw);
            }).fail(function(){
                self.jError('login fail!',1001)
            })
    }

    ;!function(){
        login.delay=false;
    }();

    return [login];

}()
