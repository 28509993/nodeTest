/**
 * Created by Administrator on 2014/11/5.
 */

(function(g){
    var CONSTANT={};
    CONSTANT.Sucess='Success';
    CONSTANT.Failure='Failure'
    g.CONSTANT=CONSTANT;
    g.dataOK=function(data){
        return data&&data.TResult === 'Success';
    }
    return g;
})((typeof window === 'undefined') ? global : window)


