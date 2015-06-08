/**
 * Created by Administrator on 2015/3/7.
 */
// for index.html
exports=module.exports  =function (){
    function $main(){
        var self=this;
        self.json({main:1});
    }
    ;!function(){
        $main.alias='$main'
    }();
    return [$main];
}()
