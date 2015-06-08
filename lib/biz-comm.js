/**
 * Created by Administrator on 2015/3/17.
 */
var util=require('util')
var base=require('./biz/base');
util._extend(exports,base);

exports.init=function(){
    return base.init();
}