jThree( function( j3 ) {

    $( "#loading" ).remove();
    j3.Trackball();

},
function() {
    alert( "このブラウザはWebGLに対応していません。" );
} );
