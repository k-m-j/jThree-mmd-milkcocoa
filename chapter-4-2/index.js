jThree( function( j3 ) {

    // milkcocoaの設定
    var appId = '<アプリケーション固有のキー>';     // https://mlkcca.com/edit/ で確認できるapp_id  .mlkcca.com は含まない
    var dataPath = 'jthird';

    $( "#loading" ).remove();
    j3.Trackball();

    // 3D空間にマーカーオブジェクトを設置する
    var html_txt = "";
    var txr_txt = "";
    var mesh_joint = "";
    $.each(motionData[0].joint, function (key, val) {
        // スプライト用ラベルの生成
        html_txt += '<div id="txt-' + key + '">' + key + '</div>';
        // ラベルテクスチャの生成
        txr_txt += '<txr id="txr-' + key + '" html="#txt-' + key + '" />';
        // スプライトの長さは文字列長に依存
        var sprite_width = key.length * 0.3;
        // Kinectで Right～ 部位は黒くする
        var material = (key.indexOf("Right") != -1)? 'mtl-black':'mtl-red';
        // マーカーオブジェクトの定義
        mesh_joint += '<mesh id="kpos-bindex-' + key + '" geo="#geo-sphere" mtl="#'+material+'" style="positionY: 100 ;"><sprite mtl="#nameMtl" style="positionY: 0.5 ; mtlMap: #txr-' + key + '; scale: ' + sprite_width + ' 1 1;" /></mesh>';
    });
    // ラベル文字列の追加
    j3("import").contents().find("#ContentField").append(html_txt);
    // ラベルテクスチャの追加
    j3("head").append(txr_txt);
    // bodyIndexの数だけ置換して繰り返して、jThreeに追加
    j3("scene").append(function(mesh_joint){
        var str = '';
        for(var i = 0;i<6;i++){
            str += mesh_joint.replace(/bindex/g,i);
        }
        return str;
    }(mesh_joint));

    // milkcocoaのデータ受け取り
    var milkcocoa = new MilkCocoa(appId + '.mlkcca.com');
    var ds = milkcocoa.dataStore(dataPath);
    ds.on('send', function (data) {
        console.log(data.value);
        update(data.value);
    });

    // モーション更新関数
    function update(data){
        // bodyIndex取得
        var bodyIndex = data.bodyIndex;
        // jointデータ取得
        var joints = data.joint;

        // オブジェクトの位置をキネクトにあわせる
        $.each(joints,function(key,val){
            var position = new THREE.Vector3();
            // 座標データを13倍に拡大してコピー
            position.copy(this).multiplyScalar(13);
            // 該当の関節位置を反映する
            j3("#kpos-" + bodyIndex + "-" + key).css("position","" + position.x + " " + position.y + " " + position.z);
        });
    }

},
function() {
    alert( "このブラウザはWebGLに対応していません。" );
} );

var motionData = [
    {
        "bodyIndex": 3,
        "joint": {
            "SpineBase": {
                "x": "0.1166515",
                "y": "-0.05276975",
                "z": "1.599339"
            },
            "SpineMid": {
                "x": "0.1150713",
                "y": "0.2532754",
                "z": "1.568028"
            },
            "Neck": {
                "x": "0.1125305",
                "y": "0.5442983",
                "z": "1.524035"
            },
            "Head": {
                "x": "0.1171212",
                "y": "0.6969755",
                "z": "1.500615"
            },
            "ShoulderLeft": {
                "x": "-0.05750675",
                "y": "0.4148814",
                "z": "1.545458"
            },
            "ElbowLeft": {
                "x": "-0.1718967",
                "y": "0.2244138",
                "z": "1.597716"
            },
            "WristLeft": {
                "x": "-0.2315814",
                "y": "0.04355317",
                "z": "1.536442"
            },
            "HandLeft": {
                "x": "-0.2569415",
                "y": "-0.03165385",
                "z": "1.486298"
            },
            "ShoulderRight": {
                "x": "0.2869881",
                "y": "0.4109205",
                "z": "1.51142"
            },
            "ElbowRight": {
                "x": "0.3712417",
                "y": "0.1988527",
                "z": "1.515925"
            },
            "WristRight": {
                "x": "0.3939014",
                "y": "0.01810756",
                "z": "1.407925"
            },
            "HandRight": {
                "x": "0.3939719",
                "y": "-0.04848276",
                "z": "1.335695"
            },
            "HipLeft": {
                "x": "0.03472912",
                "y": "-0.05066065",
                "z": "1.571345"
            },
            "KneeLeft": {
                "x": "0.01502982",
                "y": "-0.3363405",
                "z": "1.458231"
            },
            "AnkleLeft": {
                "x": "0.04233205",
                "y": "-0.6698315",
                "z": "1.513231"
            },
            "FootLeft": {
                "x": "0.03484768",
                "y": "-0.6953715",
                "z": "1.408395"
            },
            "HipRight": {
                "x": "0.193386",
                "y": "-0.05252728",
                "z": "1.556058"
            },
            "KneeRight": {
                "x": "0.1989516",
                "y": "-0.3921293",
                "z": "1.626759"
            },
            "AnkleRight": {
                "x": "0.1582946",
                "y": "-0.6769487",
                "z": "1.766732"
            },
            "FootRight": {
                "x": "0.1488003",
                "y": "-0.7041606",
                "z": "1.661325"
            },
            "SpineShoulder": {
                "x": "0.1133184",
                "y": "0.4736215",
                "z": "1.537059"
            },
            "HandTipLeft": {
                "x": "-0.2685788",
                "y": "-0.09766701",
                "z": "1.455045"
            },
            "ThumbLeft": {
                "x": "-0.2476086",
                "y": "-0.03834457",
                "z": "1.432111"
            },
            "HandTipRight": {
                "x": "0.3958712",
                "y": "-0.1113237",
                "z": "1.289252"
            },
            "ThumbRight": {
                "x": "0.4221855",
                "y": "-0.06024741",
                "z": "1.303385"
            }
        }
    }
]