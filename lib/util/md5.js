/**
 * Created by Administrator on 2014/12/20.
 */
var crypto = require('crypto');
function md5  (str, encoding){
    return crypto
        .createHash('md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
};

exports=module.exports=md5;