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

        console.log("bone[" + val.index + "] (" + bone.name + ") assoc_kinect[" + key + "] has child: bone[" + jointList[val.child].index + "] (" + child.name + ") assoc_kinect[" + val.child + "]");
    } );
    // Bone状態を表示させるハンドルオブジェクトの生成(jThreeに反映)
    j3("#bonehandles").append(boneHandle);

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
