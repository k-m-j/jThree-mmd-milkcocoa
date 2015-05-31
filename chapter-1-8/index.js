jThree( function( j3 ) {
    $( "#loading" ).remove();
    j3.Trackball();
    j3.MMD.play(true);

    // フレームレート計測
    var fps = 0;
    var field_fps = $("#stat-fps");
    j3.update(function(d){
        fps = Math.floor(1000 / d);
        field_fps.html('' + fps + ' fps');
    });

    // モーション制御ボタンの挙動
    $("#btn-play").click(function (){
        j3.MMD.play(true);
    });
    $("#btn-stop").click(function (){
        j3.MMD.pause();
    });

},
function() {
    alert( "This browser does not support WebGL." );
});
