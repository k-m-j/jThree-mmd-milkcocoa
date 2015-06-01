jThree( function( j3 ) {

    // milkcocoaの設定
    var appId = '<アプリケーション固有のキー>';     // https://mlkcca.com/edit/ で確認できるapp_id  .mlkcca.com は含まない
    var dataPath = 'jthird';

    // 消すまでのコマ数
    var vanishFrames = 60;

    $( "#loading" ).remove();
    j3.Trackball();

    // jThreeのMMDオブジェクト取得
    var models = [];
    var mmdtag = [];
    var lastUpdate = [];
    for(var _bodyIndex = 0; _bodyIndex < 6 ; _bodyIndex++){
        models[_bodyIndex] = j3.Kinect( "mmd#obj-zunko-" + _bodyIndex);
        mmdtag[_bodyIndex] = j3( "mmd#obj-zunko-" + _bodyIndex);
    }

    // モーション更新関数
    var i = 0;
    // milkcocoaのデータ受け取り
    var milkcocoa = new MilkCocoa(appId + '.mlkcca.com');
    var ds = milkcocoa.dataStore(dataPath);
    ds.on('send', function (data) {
        console.log(data.value);
        update(data.value);
    });

    function update(data){
        // bodyIndex取得
        var bodyIndex = data.bodyIndex;
        // 最終更新コマを記録
        lastUpdate[bodyIndex] = i;
        mmdtag[bodyIndex].css("display",true);
        // jointデータ取得
        var joints = data.joint;
        // モーション更新
        models[bodyIndex].update( joints );
        // 古いフレームを非表示にする
        for(var _bodyIndex = 0; _bodyIndex < 6 ; _bodyIndex++) {
            if(i - lastUpdate[_bodyIndex] > vanishFrames){
                mmdtag[_bodyIndex].css("display",false);
            }
        }
        i++;
    }

},
function() {
    alert( "このブラウザはWebGLに対応していません。" );
} );
