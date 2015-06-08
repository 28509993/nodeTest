/**
 * Created by Administrator on 2014/11/12.
 */

var path=require('path')
    ,fs=require('fs')
    ,fs=require('fs')
    ,cwddir=process.cwd()
    , async = require("async");
exports.cwd=cwddir;


exports.walkdir =function(filepath) {
    var files=[];
    if ( fs.statSync(filepath).isDirectory()){
        fs.readdirSync(filepath).forEach(
            function(file){
                if ( fs.statSync(path.join(filepath,file)).isDirectory()){
                    files.push(file)
                }
            }
        )
    }
    return files;
}

exports.deepdirfiles=function(dir){
    var files=[];
    if (!fs.existsSync(dir)){
        return files;
    }
    var stat =fs.statSync(dir);
    if (stat.isFile()){
        return files.push(dir);
    }
    if (stat.isDirectory()){
        fs.readdirSync(dir).forEach(function(file){
            var sfile=path.join(dir,file);
            var sstat =fs.statSync(sfile);
            if (sstat.isFile()){
                files= files.concat ( sfile);
            }else if(sstat.isDirectory()) {
                files= files.concat (  exports.deepdirfiles(sfile));
            }
        })
    }
    return files;
};

exports.deepdirdirs=function(dir){
    var files=[];
    if (!fs.existsSync(dir)){
        return files;
    }
    var stat =fs.statSync(dir);
    if (stat.isDirectory()){
        //files= files.concat ( dir);
        fs.readdirSync(dir).forEach(function(file){
            var sfile=path.join(dir,file);
            var sstat =fs.statSync(sfile);
            if(sstat.isDirectory()) {
                files= files.concat ( sfile);
                files= files.concat (  exports.deepdirdirs(sfile));
            }
        })
    }
    return files;
};

exports.fileDir=function(file){
    var file=file||'';
    return file.slice(0,file.indexOf(path.basename(file)));
};

exports.isAbsolute = function(path){
    if ('/' == path[0]) return true;
    if (':' == path[1] && '\\' == path[2]) return true;
    if ('\\\\' == path.substring(0, 2)) return true; // Microsoft Azure absolute path
};

exports.findfilebydir= function(file,dirs){
    if (exports.isAbsolute(file)) return file;
    for(var i= 0,n=dirs.length;i<n;i++){
        var newfile=path.join(dirs[i],file);
        if (fs.existsSync(newfile)){
            return fs.realpathSync(newfile);
        }
    }
}

exports.rearchdirs= function(parentdir,childdir,extdirs){
    var resutdirs =[];
    var extdirs =extdirs||[''];
    var filepath =parentdir;
    var targedirs= path.relative(parentdir,childdir).split(path.sep);
    targedirs =[''].concat(targedirs);
    targedirs.forEach(function(dir){
        filepath=path.join(filepath,dir);
        extdirs.forEach(function(extdir){
            if (dir!==extdir ||dir===''){
                var newfilepath= path.join(filepath,extdir);
                var flag=true;
                resutdirs.forEach(function(old){
                    if (old===newfilepath){
                        flag=false;
                    }
                });
                flag&&resutdirs.push(path.join(filepath,extdir));
            }
        });
    });
    resutdirs.reverse();
    return resutdirs;
}


exports.perfectfile=function(file,orgidir){
    var file=file||'';
    var orgidir=orgidir||'';
    file=path.join(orgidir,file);
    file=path.normalize(file);
    if (fs.existsSync(file)){
        return fs.realpathSync(file);
    }
    if (file.indexOf(cwddir)<0){
        file=path.join(cwddir,file);
        file=path.normalize(file);
        if (fs.existsSync(file)){
            return fs.realpathSync(file);
        }
    }
};

exports.perfectJs=function(file){
    return path.extname(file)?file:file+'.js'
};

exports.perfectHtml=function(file){
    return path.extname(file)?file:file+'.html'
};



function mkdirs(p, mode, f, made) {
    if (typeof mode === 'function' || mode === undefined) {
        f = mode;
        mode = 0777 & (~process.umask());
    }
    if (!made)
        made = null;

    var cb = f || function () {};
    if (typeof mode === 'string')
        mode = parseInt(mode, 8);
    p = path.resolve(p);

    fs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdirs(path.dirname(p), mode, function (er, made) {
                    if (er) {
                        cb(er, made);
                    } else {
                        mkdirs(p, mode, cb, made);
                    }
                });
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                fs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) {
                        cb(er, made);
                    } else {
                        cb(null, made)
                    };
                });
                break;
        }
    });
}
// single file copy
function copyFile(file, toDir, cb) {
    async.waterfall([
        function (callback) {
            fs.exists(toDir, function (exists) {
                if (exists) {
                    callback(null, false);
                } else {
                    callback(null, true);
                }
            });
        }, function (need, callback) {
            if (need) {
                mkdirs(path.dirname(toDir), callback);
            } else {
                callback(null, true);
            }
        }, function (p, callback) {
            var reads = fs.createReadStream(file);
            var writes = fs.createWriteStream(path.join(path.dirname(toDir), path.basename(file)));
            reads.pipe(writes);
            //don't forget close the  when  all the data are read
            reads.on("end", function () {
                writes.end();
                callback(null);
            });
            reads.on("error", function (err) {
                console.log("error occur in reads");
                callback(true, err);
            });

        }
    ], cb);

}

// cursively count the  files that need to be copied

function _ccoutTask(from, to, cbw) {
    async.waterfall([
        function (callback) {
            fs.stat(from, callback);
        },
        function (stats, callback) {
            if (stats.isFile()) {
                cbw.addFile(from, to);
                callback(null, []);
            } else if (stats.isDirectory()) {
                fs.readdir(from, callback);
            }
        },
        function (files, callback) {
            if (files.length) {
                for (var i = 0; i < files.length; i++) {
                    _ccoutTask(path.join(from, files[i]), path.join(to, files[i]), cbw.increase());
                }
            }
            callback(null);
        }
    ], cbw);

}
// wrap the callback before counting
function ccoutTask(from, to, cb) {
    var files = [];
    var count = 1;

    function wrapper(err) {
        count--;
        if (err || count <= 0) {
            cb(err, files)
        }
    }
    wrapper.increase = function () {
        count++;
        return wrapper;
    }
    wrapper.addFile = function (file, dir) {
        files.push({
            file : file,
            dir : dir
        });
    }

    _ccoutTask(from, to, wrapper);
}


function copyDir(from, to, cb) {
    if(!cb){
        cb=function(){};
    }
    async.waterfall([
        function (callback) {
            fs.exists(from, function (exists) {
                if (exists) {
                    callback(null, true);
                } else {
                    console.log(from + " not exists");
                    callback(true);
                }
            });
        },
        function (exists, callback) {
            fs.stat(from, callback);
        },
        function (stats, callback) {
            if (stats.isFile()) {
                // one file copy
                copyFile(from, to, function (err) {
                    if (err) {
                        // break the waterfall
                        callback(true);
                    } else {
                        callback(null, []);
                    }
                });
            } else if (stats.isDirectory()) {
                ccoutTask(from, to, callback);
            }
        },
        function (files, callback) {
            // prevent reaching to max file open limit
            async.mapLimit(files, 10, function (f, cb) {
                copyFile(f.file, f.dir, cb);
            }, callback);
        }
    ], cb);
}

exports.copyDir=copyDir;