/**
 * Created by Administrator on 2015/2/26.
 */


;(!function(){

    var rooHref;
    var plugins=['avalon'];
    var p= avalon.webType;
    var routePages= {
        "11":{"href":"/modules/enter/login.html","title":"登录"},
        "12":{"href":"/modules/enter/forget.html","title":"忘记密码"}
    }
    var defaultPage ={"href":'/modules/empty.html'};
    p==='-1'&&(rooHref ='layout/enter.html',defaultPage=routePages['11'])
    p!=='-1'&&(plugins=plugins.concat('json!/frameInfo','json!/routePages'),routePages=undefined)
    p==='0'&&(rooHref ='layout/shell.html');

    define(plugins, function(avalon,frameInfo,_routePages_) {
        routePages = _routePages_ ||routePages;
        defaultPage.href= p==='0'&&frameInfo.homepage?frameInfo.homepage:defaultPage.href;
        ;!function(){

            avalon.ListenerJoin('showWaitSpinner',function(b){
                var el= document.getElementById("frameSpin");
                if (!el) return ;
                el.style.display= !b?'none':'block';
            })

        }()

        ;!function() {
            ;!function(vm){

            }(avalon.define({
                $id: 'vm-body',
                rootHref: rooHref
            }))

        }()

        ;!function(){
            var hashchange = 'hashchange',  DOC = document;
            var documentMode = DOC.documentMode,
                supportHashChange = ('on' + hashchange in window) && ( documentMode === void 0 || documentMode > 7 );
            supportHashChange&&avalon.bind(window, "hashchange", function() {
                var vm=avalon.vmodels["vm-page"];
                vm.changePage();
            });

            ;!function(vm){
                Object.defineProperty(avalon, "pageHref", {
                    set: function (val) {  location.hash =val; }
                });

                vm.changePage = function(url) {
                    var url = (url || location.hash).replace(/[#!]/g, "");
                    url=routePages?(routePages[url.replace(/^\//g, "")]||defaultPage).href:url;
                    vm.pageHref=url;
                    avalon.templateCache[url] ||avalon.ListenerEmit('showWaitSpinner',true);
                }
                vm.renderPange = function(){
                    avalon.ListenerEmit('showWaitSpinner',false);
                }
                vm.changePage();
            }(avalon.define({
                $id: 'vm-page',
                pageHref:'',
                changePage:undefined,
                renderPange:undefined
            }))

        }()
    });
}())

