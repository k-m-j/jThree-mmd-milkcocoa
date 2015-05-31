jThree( function( j3 ) {
    $( "#loading" ).remove();
    j3.Trackball();

    // フレームレート計測
    var fps = 0;
    var field_fps = $("#stat-fps");
    j3.update(function(d){
        fps = Math.floor(1000 / d);
        field_fps.html('' + fps + ' fps');
    });

},
function() {
    alert( "This browser does not support WebGL." );
});
