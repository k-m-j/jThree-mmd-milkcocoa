jThree(
    function( j3 ) {
        $( "#loading" ).remove();
        j3.Trackball();

        // 10個の物体を生成する
        var boxes = "";
        for(var i = 0; i < 10 ; i++){
            boxes += '<mesh id="pos-' + i + '" class="cubes" geo="#geo-cube" mtl="#mtl-blue" style="positionX:' + i*2 + ';"><mesh id="dir-' + i + '" geo="#geo-corn" mtl="#mtl-blue" style="positionY:0.6;"></mesh></mesh>';
        }
        j3("scene").append(boxes);

        // 状態制御コード
        var lock_id = null;                  // 現在操作中の物体のID
        var handle_axis = null;              // position操作中の軸
        var handle_rotate = null;            // rotate操作中の軸
        var handle_start_y= null;            // クリック開始地点(画面高さ)
        var handle_axis_start_3d = null;     // 移動初期値
        var handle_rotate_start_3d = null;   // 回転初期値
        var field_status = $("#stat-axis");  // 画面表示用のフィールド(jQuery)

        // 操作物体の確定
        j3(".cubes").click(
            function(){
                if(lock_id) j3("#" + lock_id).css('mtlColor',"#0000ff");        // 以前に操作中だった物体の色をもとに戻す
                j3(this).css('mtlColor',"#ffff00");                             // 操作中の物体の色を黄色に変える
                lock_id = j3(this).attr('id');                                  // lock_id 変数にIDを覚えておく
            }
        );

        // 回転用のハンドルを押したとき
        $(".rot-handle").mousedown(function(e){
            handle_rotate = $(this).attr("data-axis");      // ボタンの data-axis プロパティ取得{X,Y,Z}
            handle_start_y = e.pageY;                       // ボタンを押したときの画面のY座標を記憶しておく
            handle_rotate_start_3d = j3("#" + lock_id).css('rotate' + handle_rotate);  // 操作中の物体の現在の角度を記憶しておく
        });
        // 移動用のハンドルを押したとき
        $(".axis-handle").mousedown(function(e){
            handle_axis = $(this).attr("data-axis");        // ボタンの data-axis プロパティ取得{X,Y,Z}
            handle_start_y = e.pageY;                       // ボタンを押したときの画面のY座標を記憶しておく
            handle_axis_start_3d = j3("#" + lock_id).css('position' + handle_axis);  // 操作中の物体の現在の位置を記憶しておく
        });
        // マウスを動かしたとき(常に走る)
        $("body").mousemove(function(e) {
            var moveDelta = handle_start_y - e.pageY;        // ボタンを押したときからの位置変動を計算(Yのみ)
            if(lock_id && handle_rotate){
                // 回転操作中
                var resultRotate = handle_rotate_start_3d + (-moveDelta / 20);    // 最終角度を計算
                j3("#" + lock_id).css('rotate' + handle_rotate, resultRotate );  // 回転を適用
                field_status.html('page:{' + e.pageX + ' , ' + e.pageY + '}<br/>Delta: ' + moveDelta + '<br/>Rotation '+handle_rotate+': ' + fixedPoint(resultRotate)  );
            }else if(lock_id && handle_axis){
                // 移動操作中
                var resultPos = handle_axis_start_3d + (moveDelta / 20);         // 最終位置を計算
                j3("#" + lock_id).css('position' + handle_axis, resultPos );     // 移動を適用
                field_status.html('page:{' + e.pageX + ' , ' + e.pageY + '}<br/>Delta: ' + moveDelta + '<br/>Position '+handle_axis+': ' + fixedPoint(resultPos)  );
            }
        });
        // マウスボタンを離したとき(ハンドルの消去)
        $("body").mouseup(function(){
            handle_axis = null;
            handle_rotate = null;
        });
    },
    function() {
        alert( "This browser does not support WebGL." );
    }
);
// 小数を4桁で切り捨てる処理
function fixedPoint(val, point){
    if(!point)point = 4;
    var geta = Math.pow(10 , point);
    return Math.round(val * geta) / geta;
}