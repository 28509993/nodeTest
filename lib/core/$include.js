/**
 * Created by Administrator on 2015/3/7.
 */


var path=require('path')
    ,fs=require('fs')
    ,util=require('util');

exports=module.exports=function (pathname,plugs){
    var exportfuncs={};
    var fileList = [];
    //add root
    fs.readdirSync(pathname).forEach(function(item){
        if(fs.statSync(path.join(pathname , item)).isFile()){
            (/^\$/i).test(item)&&fileList.push(path.join(pathname , item));
        }
    });

    var plugs = Array.isArray(plugs)?plugs: function (){
        var dirList=[];
        var targetPath=pathname;
        fs.readdirSync(targetPath).forEach(function(item){
            if(fs.statSync(path.join( targetPath, item)).isDirectory()){
                dirList=dirList.concat(item)
            }
        })
        return dirList;
    }();

    function walk(targetPath,deepth){
        if (deepth<=0) return ;
        var dirList = fs.readdirSync(targetPath);
        dirList.forEach(function(item){
            if(fs.statSync(path.join(targetPath , item)).isFile()){
                (/^\$/i).test(item)&&fileList.push(path.join(targetPath , item));
            }
        });
        dirList.forEach(function(item){
            if(fs.statSync(path.join(targetPath , item)).isDirectory()){
                walk(path.join(targetPath , item),deepth-1);
            }
        });
    }
    plugs.forEach(function(branch){
        var targetPath=path.join( pathname, branch);
        walk(targetPath,2)
    });

    function getFuncName(_callee) {
        return typeof(_callee)==='function'?(/function\s*(\w*)/i).exec(_callee+'')[1]:undefined;
    }

    fileList.forEach(function(item){
        var filename=item;
        var arrFuns=require(filename);
        if ( !Array.isArray(arrFuns)){
            return ;
        }
        var funcObj
        arrFuns.forEach(function(fun){
            if (typeof(fun)==='function'){
                var fnName= (fun.alias|| getFuncName(fun) ).toUpperCase();
                funcObj=funcObj||{};
                funcObj[fnName]=fun;
            }
        });
        if ( !funcObj){
            return ;
        }
        var layers=path.relative(pathname,item).split(path.sep).slice(0,-1);
        var mother=exportfuncs;
        layers.forEach(function (layer){
            var layer1=layer.toUpperCase();
            mother=  mother[layer1]||(mother[layer1]={})
        })
        util._extend(mother,funcObj);
    });


    var mainfile=path.join( pathname, '$main.js');
    if(fs.statSync(mainfile).isFile()){
        var mainFuc=require(mainfile);
        if (typeof(mainFuc)==='function'){
            exportfuncs['$main']=mainFuc;
        }
    }
    return exportfuncs;
}


