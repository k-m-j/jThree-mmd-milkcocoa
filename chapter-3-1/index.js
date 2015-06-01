jThree(
    function( j3 ) {
        $( "#loading" ).remove();
        j3.Trackball();

        var boxes = "";
        for(var i = 0; i < 10 ; i++){
            boxes += '<mesh id="pos-' + i + '" class="cubes" geo="#geo-cube" mtl="#mtl-blue" style="positionX:' + i*2 + ';"><mesh id="dir-' + i + '" geo="#geo-corn" mtl="#mtl-blue" style="positionY:0.6;"></mesh></mesh>';
        }
        j3("scene").append(boxes);
    },
    function() {
        alert( "This browser does not support WebGL." );
    }
);
