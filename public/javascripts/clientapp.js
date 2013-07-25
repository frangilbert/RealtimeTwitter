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
        var socket = io.connect(window.location.host);
        
        socket.on('connect', function(data){
			//socket.emit('subscribe', {channel:'tweet-channel'});
            console.log('Connected');
		});
            
        socket.on('reconnecting', function(data){
			console.log('Reconnecting');
		});

        socket.on('disconnect', function(data){
			socket.emit('disconnect');
		}); 
        
        socket.on('message', function (data) {
            if(data.coordinates !== undefined && data.coordinates !== null){
            //    var coords = data.coordinates.coordinates;

            //    map.setOptions();
            //    var marker = new google.maps.Marker({
            //        animation: google.maps.Animation.DROP,
            //        position: new google.maps.LatLng(coords[1], coords[0]),
            //        map: map,
            //        title:data.text
            //    });

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