/**
 * Created by Administrator on 2014/12/19.
 */
exports=module.exports=function(req){
    var headct=req.headers['content-type'];
    var headat=req.headers['accept'];
    req.wantsJSON =  (headct&&headct.indexOf('json')>=0||headat&&headat.indexOf('json')>=0);
    return req;
};

//wantsJSONParse