
;!function(){

    require.config({
        baseUrl: '',
        paths: {
            jquery: 'js/jquery.min',
            text: 'js/text',
            domReady: 'js/domReady',
            css: 'js/css',
            json: 'js/json',
            mmHistory: 'js/mmHistory',
            mmRouter: 'js/mmRouter',
            mmPromise:'js/mmPromise',
            avalon: 'js/avalon',
            bootstrap: 'js/bootstrap',
            'hg-common': 'js/belong/hg-common',
            'hg-frame': 'js/belong/hg-frame',

            toastr: 'js/toastr',
            layer:'js/layer.min',
            fixie1:'js/ie-emulation-modes-warning',
            fixie2:'js/ie10-viewport-bug-workaround',

            'css-toastr':'css/toastr',
            'css-style':'css/style',
            'css-custom':'css/customtheme'
        },
        priority: ['text', 'css','json'],
        shim: {
            layer:{
                deps:["jquery"],
                exports: "layer"},
            jquery: {
                exports: "jQuery"
            },
            bootstrap: {
                exports: 'bootstrap'
            },
            avalon: {
                exports: "avalon",
                init: function () {
                    avalon.config({loader: false}) //debug:true
                }

            }
        }
    });
    //懒得写depens
    var plugins1=['avalon','jquery','domReady!','fixie1','fixie2',
        'mmPromise' ,'mmRouter','hg-common','layer',
       'css!css-toastr','css!css-custom','css!css-style'];
    var plugins2=[ 'bootstrap', 'hg-frame'];
    //var isEnter=(/^\/avalon_enter.html/i).test( url );
    //location.hash.replace(/#!/g, "")
    require(plugins1,function(){
        layer.use('layer.ext.js');
        avalon.log("前期加载avalon等完毕，开始构建根VM与加载其他模块")
        avalon.templateCache.empty = "&nbsp;"

        require(plugins2, function () {//第二块，添加根VM（处理共用部分）
            avalon.log("所有模块加载完毕");
            avalon.scan(document.body)
            //avalon.history.start({basepath:'/'});
        });
    });

}()

