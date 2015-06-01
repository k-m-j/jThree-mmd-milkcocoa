jThree( function( j3 ) {

    $( "#loading" ).remove();
    j3.Trackball();

    // MMDのTHREE.jsオブジェクト取得
    var mmd = j3( "mmd" ).three(0);
    // bone情報を取得
    var bones = mmd.children[ 0 ].bones;

    // bone <-> kinect index 変換表作成
    $.each( jointList,function(key,val){
        // bonesをスキャンして操るボーンを探す
        bones.forEach(function(bone,idx){
            if(bone.name===val.name){
                // 操る先のボーンが見つかったらindexを記録する jointList.jointName.index
                val.index=idx;
                return false;
            }
        });
    });

    // ワールド座標系を更新する
    bones[0].updateMatrixWorld();
    // jointList に登録された Bones の座標をローカル→ワールド座標変換
    // Bone指標オブジェクトの生成
    var boneHandle = "";
    $.each( jointList, function( key, val ) {
        // 子ボーンが指定されていなかったら(末端なので)終了
        if ( !val.child ) return;
        // 対象のボーン取得
        var bone = bones[ val.index ];
        var child = bones[ jointList[ val.child ].index ];

        // bone位置のワールド座標取得
        var w_boneVector = new THREE.Vector3();
        // 座標をワールド座標に変換
        bone.parent.localToWorld( w_boneVector.copy( bone.position ) );

        // Bone状態を表示させるハンドルオブジェクトの生成
        boneHandle += '<mesh id="bonehandle-' + val.index + '" class="handle" geo="#geo-cube" mtl="#mtl-blue" style="position: '+w_boneVector.x+' '+w_boneVector.y+' '+w_boneVector.z+';"><mesh geo="#geo-corn" mtl="#mtl-blue" style="positionY:0.6;"></mesh></mesh>';
        // コンソールに処理済みのボーン情報を表示(確認用)
        console.log("bone[" + val.index + "] (" + bone.name + ") assoc_kinect[" + key + "] has child: bone[" + jointList[val.child].index + "] (" + child.name + ") assoc_kinect[" + val.child + "]");
    } );
    // Bone状態を表示させるハンドルオブジェクトの生成(jThreeに反映)
    j3("#bonehandles").append(boneHandle);


    // 状態制御コード
    var lock_id = null;                  // 現在操作中の物体のID
    var handle_rotate = null;            // rotate操作中の軸
    var handle_start_y= null;            // クリック開始地点(画面高さ)
    var handle_rotate_start_3d = null;   // 回転初期値

    // 操作物体の確定
    j3(".handle").click(
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
    // マウスを動かしたとき(常に走る)
    $("body").mousemove(function(e) {
        if(lock_id && handle_rotate){
            // 回転操作中
            var moveDelta = handle_start_y - e.pageY;        // ボタンを押したときからの位置変動を計算(Yのみ)
            var resultRotate = handle_rotate_start_3d + (-moveDelta / 20);    // 最終角度を計算
            j3("#" + lock_id).css('rotate' + handle_rotate, resultRotate );  // 回転を適用
        }
    });
    // マウスボタンを離したとき(ハンドルの消去)
    $("body").mouseup(function(){
        handle_rotate = null;
    });

    $("#display-guide").click(function(){
        if(j3("#bonehandles").css("display")){
            console.log('Display off');
            j3("#bonehandles").css("display",false);
        }else{
            console.log('Display on');
            j3("#bonehandles").css("display",true);
        }
    });


    // モーション更新関数
    j3.update( function(d){
        // 胴体-首 , 左肩-左手 , 右肩-右手 , 左腰-左つま先 , 右腰-右つま先 にそれぞれ親から子に遡ってモーションを探索する
        ["SpineMid","ShoulderLeft","ShoulderRight","HipLeft","HipRight"].forEach(function(key,idx){

            // 子がある場合のみ向きを反映する(末端は向きを変えない)
            while ( jointList[key].child ) {
                // 作用ボーン取得
                var bone = bones[jointList[key].index];

                // 関節の回転角度取得
                var rot_x = j3("#bonehandle-" + jointList[key].index).css('rotateX');
                var rot_y = j3("#bonehandle-" + jointList[key].index).css('rotateY');
                var rot_z = j3("#bonehandle-" + jointList[key].index).css('rotateZ');

                // boneのポジション
                var w_pos = new THREE.Vector3();
                // 現在のboneの位置をワールド座標に変換
                bone.parent.localToWorld( w_pos.copy( bone.position ) );
                // ジョイントハンドルの位置をモデルに合わせる
                j3("#bonehandle-" + jointList[key].index).css('position','' + w_pos.x + ' ' + w_pos.y + ' ' + w_pos.z );

                // boneの向き先
                var rotation = new THREE.Vector3();
                rotation.set( rot_x,  rot_y,  rot_z);
                // オイラー角をクォータニオンに変換
                bone.quaternion.setFromEuler(rotation, 'XYZ');

                // ワールド座標系を更新
                bone.parent.updateMatrixWorld(true);

                // 子ボーンへ辿って繰り返す
                key = jointList[key].child;
            }
        });  // End forEach
    }); // End update

},
function() {
    alert( "このブラウザはWebGLに対応していません。" );
} );

// Kinectの間接名
var jointList = {
    SpineMid: {
        name: "上半身",
        child: "Neck"
    },
    Neck: {
        name: "首",
        child: "Head"
    },
    Head: {
        name: "頭"
    },
    ShoulderLeft: {
        name: "左腕",
        child: "ElbowLeft"
    },
    ElbowLeft: {
        name: "左ひじ",
        child: "WristLeft"
    },
    WristLeft: {
        name: "左手首",
        child: "HandLeft"
    },
    HandLeft: {
        name: "左中指１"
    },
    ShoulderRight: {
        name: "右腕",
        child: "ElbowRight"
    },
    ElbowRight: {
        name: "右ひじ",
        child: "WristRight"
    },
    WristRight: {
        name: "右手首",
        child: "HandRight"
    },
    HandRight: {
        name: "右中指１"
    },
    HipLeft: {
        name: "左足",
        child: "KneeLeft"
    },
    KneeLeft: {
        name: "左ひざ",
        child: "AnkleLeft"
    },
    AnkleLeft: {
        name: "左足首",
        child: "FootLeft"
    },
    FootLeft: {
        //name: "左つま先"
        name: "左つま先ＩＫ"
    },
    HipRight: {
        name: "右足",
        child: "KneeRight"
    },
    KneeRight: {
        name: "右ひざ",
        child: "AnkleRight"
    },
    AnkleRight: {
        name: "右足首",
        child: "FootRight"
    },
    FootRight: {
        //name: "右つま先"
        name: "右つま先ＩＫ"
    }
    /*
    SpineShoulder:
    HandTipLeft:
    ThumbLeft: "左親指１",
    HandTipRight:
    ThumbRight: "右親指１"*/
};
