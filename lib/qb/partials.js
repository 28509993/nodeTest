/**
 * Created by Administrator on 2014/12/2.
 */
var orms=require('../data/orms')

function eq(options,cond){
    if (!cond) return   {cs:' WHERE 1=1 ',ps:[]}
    var cs=[];
    var ps=[];
    for(c in cond){
        var cname=c.toUpperCase();
        if (orms[options.table] && orms[options.table].columns[cname]){
            cs=cs.concat(cname+'=?')
            ps=ps.concat(cond[c])
        }
    }
    if (cs.length<=0) return   {cs:' WHERE 1=1 ',ps:[]}
    cs=' WHERE '.concat( cs.join(' AND '),' ');
    return {cs:cs,ps:ps}
}

function insertparse(value,options){
    var fs=[];
    var fv=[];
    var ps=[];
    for(f in value){
        var cname=f.toUpperCase();
        if (orms[options.table] && orms[options.table].columns[cname]){
            fs=fs.concat(cname)
            fv=fv.concat('?')
            ps=ps.concat(value[f])
        }
    }
    fs=  fs.join(',');
    fv=  fv.join(',');
    return {fs:fs,fv:fv,ps:ps}
}

function updateparse(options,value,cond){
    var fs=[];
    var ps=[];
    for(f in value){
        var cname=f.toUpperCase();
        if (orms[options.table] && orms[options.table].columns[cname]){
            fs=fs.concat(cname+'=?')
            ps=ps.concat(value[f])
        }
    }
    fs=  fs.join(',');
    var e=eq(options,cond);
    ps=ps.concat(e.ps);
    return {fs:fs,cs: e.cs,ps:ps}
}

function table(options){
    return (options.table|| options.name).toUpperCase();
}

function colums(options){
    if (options._columns_) return options._columns_;
    if (!options.columns)  {
        options.columns=(orms[options.table]).columns;
        if (!options.columns) throw new Error(options.table+' not exists!')
    }
    var cols=[];
    for(c in options.columns){
        var cname=c.toUpperCase();
        if (orms[options.table] && orms[options.table].columns[cname]){
            cols=cols.concat(cname);
        }
    }
    cols=cols.join(',')
    options._columns_=cols
    return cols;
}

exports = module.exports =
     {
        eq:eq,table:table,colums:colums,
        insertparse:insertparse,updateparse:updateparse
    }



