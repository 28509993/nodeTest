/**
 * Created by Administrator on 2015/3/6.
 */
/**
 * Created by Administrator on 2015/3/6.
 */

exports=module.exports  =function (){

    function useDemo2(){
        var self=this;
        var tplfile=path.resolve( 'resource/main_frame.html');
        var key=scomm.hash(tplfile);
        self.raw= self.rawCache(key,cache,function(){return self.renderTpl(tplfile,{branch:'system'})})
        self.json();
    }
    ;!function(){
        useDemo2.alias="22";
        useDemo2.delay=true;
    }();
    return [useDemo2];

}()
