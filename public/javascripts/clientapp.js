var ui = {};

$().ready(function(){
	ui.init();
});

(function ($) {
    ui.init = function(){
        var mapInit = ui.maps();
        google.maps.event.addDomListener(window, 'load', mapInit);

        ui.twitterStream();
        
    },

    ui.twitterStream = function(){
        var checkClearMap = function(){
            
        }
        
        var socket = io.connect('http://hidden-caverns-9063.herokuapp.com');
        socket.on('tweets', function (data) {
            if(data.coordinates !== undefined && data.coordinates !== null){
                var coords = data.coordinates.coordinates;

                map.setOptions();
                var marker = new google.maps.Marker({
                    animation: google.maps.Animation.DROP,
                    position: new google.maps.LatLng(coords[1], coords[0]),
                    map: map,
                    title:data.text
                });

                console.log(data);
            }
        });
    },

    ui.maps = function(){
        var mapOptions = {
            zoom: 3,
            center: new google.maps.LatLng(47.6842897, 17.3434897),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        
    }
} (jQuery));