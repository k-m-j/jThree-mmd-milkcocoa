jThree( function( j3 ) {
    $( "#loading" ).remove();
    j3.Trackball();
    j3.MMD.play(true);

    // MMDのTHREE.jsオブジェクト取得
    var obj3d = j3("mmd").three(0);
    console.log(obj3d);
    // bone情報を取得
    var bones = obj3d.children[ 0 ].bones;


    // フレームレート計測
    var fps = 0;
    var field_fps = $("#stat-fps");
    j3.update(function(d){
        fps = Math.floor(1000 / d);
        field_fps.html('' + fps + ' fps');
    });

    // bone情報を表示
    var once = false;
    var field_bones = $("#stat-bone");
    j3.update(function(d){
        //if(once) return;
        //once = true;

        // ボーン状態を記述するHTMLを作成
        $_html = "";
        $_html += '<div class="stat-box">';
        for(var b in bones)
        {
            // ボーンのクォータニオンを取得する
            $_html += bones[b].name + " quaternion.{w,x,y,z}: { "
            + fixedPoint(bones[b].quaternion.w) + " , "
            + fixedPoint(bones[b].quaternion.x) + " , "
            + fixedPoint(bones[b].quaternion.y) + " , "
            + fixedPoint(bones[b].quaternion.z) + " }<br>";
            // IKボーンは座標も取得する
            if(bones[b].name.match("ＩＫ"))
            {
                $_html += bones[b].name + " IK.{x,y,z}: { "
                + fixedPoint(bones[b].position.x) + " , "
                + fixedPoint(bones[b].position.y) + " , "
                + fixedPoint(bones[b].position.z) + " }<br>";
            }

            // ボーン60個ごとに列を分ける
            if(b != 0 && b % 60 == 0) $_html += '</div><div class="stat-box">';
        }
        $_html += '</div>';
        field_bones.html($_html);
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

function fixedPoint(val, point){
    if(!point)point = 4;
    var geta = Math.pow(10 , point);
    return Math.round(val * geta) / geta;
}