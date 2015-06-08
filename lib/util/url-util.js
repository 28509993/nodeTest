/**
 * Created by Administrator on 2014/12/25.
 */

var typeutil=require('./type-util')

exports.objectToUrl = function(url,data){
    //only number string , //date??
    var url=url;
    if (url && data){
        for (var key in data){
            if (typeutil.isString(data[key])|| typeutil.isNumber(data[key])){
                if (url.indexOf('?')<0){
                    url=url+'?'
                }else {
                    if (url.slice(url.length-1)!=='?'){
                        url=url+'&'
                    }
                }
                url=url+''+key+'='+ encodeURIComponent(data[key]);//data[key]; //encodeURIComponent(data[key])
            }
        }
    }
    return url;
}