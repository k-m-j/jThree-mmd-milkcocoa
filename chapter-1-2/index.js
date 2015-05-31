jThree( function( j3 ) {
    $( "#loading" ).remove();
    j3.Trackball();
},
function() {
    alert( "This browser does not support WebGL." );
} );
