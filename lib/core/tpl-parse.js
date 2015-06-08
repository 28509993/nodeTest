/**
 * Created by Administrator on 2014/10/14.
 */
var path = require('path')
    , util = require('util')
    , fs = require('fs')
    , read = fs.readFileSync
    ,ejs = require('ejs')
    ,hash=require('../util/hash').hash
    ,minify = require('html-minifier').minify;

var useminify=true;
var cache = {};
var proto =  function() {
}

useminify=true;
console.log('-----------,useminify=true,no compress')

//tpl file
proto.preload= function(filename) {
    var files=util.isArray(filename)?filename:[filename];
    var key='';
    files.forEach(function(file){
        key=getpretplkey(file);
        cache[key]||(cache[key] = ejs.render(read(file, 'utf8'),{filename:file,open:'{{',close : '}}'}));
    })
    if (!util.isArray(filename)){
        return cache[key];
    }
}

function getpretplkey(id){

    return hash("pretpl:"+id);
}
function gettplkey(id){
    return hash("tpl:"+id);
}

proto. restore=function  (filename){

    var key = gettplkey(filename);
    if (cache[key]) {
        return cache[key];
    }
    var tplreg =/<!--\s*\btemplate\s*\(\s*(\s*[\s\S]+\S)\s*\)\s*-->/ig;
    var embeded = read(filename, 'utf8');
    var res;
    tplreg.lastIndex=0;
    var pretplname = (res = tplreg.exec(embeded)) && res[1];

    if (!pretplname) {
        cache[key]=embeded;
        return cache[key];
    }
    pretplname =path.join( path.resolve('resource'),pretplname);
    if (!pretplname){
        throw new Error(   'can not found template file:'+pretplname );
    }
    var str=proto.preload(pretplname);
    tplreg.lastIndex=0;
    if (!useminify){
        embeded = embeded.replace(tplreg, '');
    }
    var embedreg =/<!--\s*\bembed\s*\(\s*(\s*[\s\S]+\S)\s*\)\s*-->/ig;
    str = str.replace(embedreg, embeded);
    if (useminify){
        str=minify(str,{removeComments:true,collapseWhitespace:true});
    }
    cache[key]=str;
    return cache[key];
}

proto.render = function(filename,options){
    var options =util._extend(options || {},{filename:filename,cache:true});
    var tpl=proto.restore(filename);
    //util._extend(options,{open:'{{',close : '}}'});
    var str=ejs.render(tpl, options)
    return str;
}

proto.clearCache = function(){
    cache = {};
};

//proto.minify
Object.defineProperty(proto, "minify", {
    get: function () { return useminify; },
    set: function (value) { useminify = value;  }
});


module.exports =proto;

