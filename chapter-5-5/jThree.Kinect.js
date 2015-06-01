THREE.KinectEffect = function ( object, option ) {
    //objectはmmd.three.jsのSkinnedMesh

    this.object = object;

    //optionで関節名のリストと走査開始の配列を書き換え可能に
    if ( option ) {
        if(option.jointList) this.jointList = option.jointList;
        if(option.startJoints) this.startJoints = option.startJoints;
    }

    // ■■ ローカル関数 ■■
    // ベクトルの複製を取得
    this.getVectorClone = function(pos){
        var v = new THREE.Vector3();
        return v.copy(pos);
    };

    // 差分ベクトルを取得
    this.getSubVector = function(v1, v2){
        var vs = new THREE.Vector3();
        vs.subVectors(v1, v2);
        return vs;
    };

    // 法線ベクトルを取得
    this.getCrossVector = function(v1, v2){
        var vc = new THREE.Vector3();
        vc.crossVectors(v1, v2);
        vc.normalize();
        return vc;
    };

    // ボーン同士のワールド座標の差分ベクトルを取得
    this.worldSubVectors = function(bone1, bone2){
        var v1 = this.getVectorClone(bone1.position);
        bone1.parent.localToWorld(v1);
        var v2 = this.getVectorClone(bone2.position);
        bone2.parent.localToWorld(v2);
        return this.getSubVector(v1, v2);
    };

    // 2本の単位ベクトルのクォータニオンを求める
    // 参照：http://lolengine.net/blog/2014/02/24/quaternion-from-two-vectors-final
    this.getQuatanionFromVectors = function(v1, v2){
        var vecVertical = new THREE.Vector3();
        // ベクトルの内積により回転要素を算出
        var r = v1.dot(v2) + 1;
        if (r < 0.000001) {
            // 内積が0の誤差範囲の場合、法線はz軸かx軸に垂直である とする
            r = 0;
            if (Math.abs(v1.x) > Math.abs(v1.z)) {
                vecVertical.set(-v1.y, v1.x, 0);
            } else {
                vecVertical.set(0, -v1.z, v1.y);
            }
        } else {
            // 目標ベクトルと元ベクトルの法線を算出
            vecVertical.crossVectors(v1, v2);
        }
        // クォータニオンに法線ベクトルと回転を代入
        var q = new THREE.Quaternion();
        q.set(vecVertical.x, vecVertical.y, vecVertical.z, r);
        // クォータニオンを正規化
        q.normalize();
        return q;
    };

    // ■■ 初期化処理 ■■
    var bones = this.bones = this.object.bones;
    // bone <-> kinect index 変換表作成
    for(var key in this.jointList){
        var val = this.jointList[key];
        // bonesをスキャンして操るボーンを探す
        bones.forEach(function(bone,idx){
            if(bone.name===val.name){
                // 操る先のボーンが見つかったらindexを記録する list.jointName.index
                val.index=idx;
                return false;
            }
        });
    }

    // ワールド座標系を更新する
    bones[0].updateMatrixWorld();

    // 上半身→首 ベクトルと 左肩→右肩 のベクトル の法線を計測する
    this.vc1 = this.getCrossVector(this.worldSubVectors(bones[this.jointList["Neck"].index],bones[this.jointList["SpineMid"].index])
        ,this.worldSubVectors(bones[this.jointList["ShoulderRight"].index],bones[this.jointList["ShoulderLeft"].index]));


};

THREE.KinectEffect.prototype = {

    constructor: THREE.KinectEffect,

    update: function ( data ) {

        //dataは1フレーム分のKinectデータのみ受け取る
        var mmd = this.object;
        var bones = this.bones;
        var jointList = this.jointList;
        var that = this;

        // SpineBase を標準位置のベクトルとする
        var basePosition = new THREE.Vector3();
        // 高さのオフセット値(MMDの0点は地面にあるため)
        var mmdOffset = -9;
        // Kinectの値を拡大して jThreeの座標に変換
        basePosition.copy(data.SpineBase).multiplyScalar(13);
        // オフセットの適用
        basePosition.y=basePosition.y + mmdOffset;
        // MMDのボーン位置にベース座標をコピー
        bones[ 0 ].position.copy(basePosition);

        // モデル自体の向き先
        // 上半身→首 ベクトルと 左肩→右肩 のベクトル の法線を計測する

        var vc2 = this.getCrossVector( this.getSubVector( this.getVectorClone(data["Neck"]),this.getVectorClone(data["SpineMid"]))
                    ,this.getSubVector( this.getVectorClone(data["ShoulderRight"]),this.getVectorClone(data["ShoulderLeft"])));

        // 法線の角度変化から体の回転を計測する(Y軸のみ)
        var rotation = new THREE.Vector3();
        rotation.set( 0,  this.vc1.angleTo(vc2),  0);
        // オイラー角をクォータニオンに変換
        bones[ 0 ].quaternion.setFromEuler(rotation, 'XYZ');
        // ワールド座標系を更新
        bones[ 0 ].updateMatrixWorld(true);


        this.startJoints.forEach(function(key,idx) {

            while ( jointList[key].child ) {
                var bone = bones[jointList[key].index];
                var childJoint = data[jointList[key].child];

                // Kinect座標データを取得、右手系、親ボーンのローカル座標に変換してから、差分を取得
                // 子関節のローカル座標
                var kinectJointChildPpos = new THREE.Vector3();
                kinectJointChildPpos.copy(childJoint);            // 座標のコピー
                bone.parent.worldToLocal(kinectJointChildPpos);   // ローカル座標変換

                // 現在注目しているの関節のローカル座標
                var kinectJointPos = new THREE.Vector3();
                kinectJointPos.copy(data[key]);                   // 座標のコピー
                bone.parent.worldToLocal(kinectJointPos);         // ローカル座標変換

                // ローカル変換した親子の関節の座標の差を求める
                var jointLocalRot = new THREE.Vector3();
                jointLocalRot.subVectors( kinectJointChildPpos,kinectJointPos);

                // モデル側 子ボーンの定義
                var bone_child = bones[that.jointList[that.jointList[key].child].index];
                // ボーンの基本状態のベクトルの定義
                var boneBaseVector = new THREE.Vector3();
                // 子ボーンのローカル座標をボーンの基点とする
                boneBaseVector.copy(  bone_child.position);
                // 各ベクトルの正規化
                boneBaseVector.normalize();
                jointLocalRot.normalize();

                // Kinectの差分から算出したボーン回転のクォータニオンを求める
                bone.quaternion.copy(that.getQuatanionFromVectors(boneBaseVector,jointLocalRot));

                // ボーンのマトリクスをワールド座標に反映
                bone.updateMatrixWorld(true);
                //bone.parent.updateMatrixWorld(true);

                key = jointList[key].child;
            }

        });
    },

    jointList: {
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
    },

    startJoints: [ "SpineMid", "ShoulderLeft", "ShoulderRight", "HipLeft", "HipRight" ]

};

if ( window.jThree ) {
    // jThreeが有効な場合に、jThree.Kinectを定義する
    jThree.Kinect = function( selector, option ) {

        var kinect = [];
        // selector探索で見つかったら追加
        jThree( selector ).each( function() {
            kinect.push( new THREE.KinectEffect( jThree.three( this ).children[ 0 ] , option ) );
        } );

        // １つの場合はそのもの、複数の場合は先頭の要素を返す
        return kinect.length > 1 ? kinect : kinect[ 0 ];

    };

}