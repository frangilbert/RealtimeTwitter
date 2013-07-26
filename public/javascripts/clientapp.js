var ui = {};

$().ready(function(){
	ui.init();
});

(function ($) {
    ui.init = function(){
        var mapInit = maps();
        google.maps.event.addDomListener(window, 'load', mapInit);

        twitterStream();
        
    },

    twitterStream = function(){
        var socket = io.connect(window.location.host);

        socket.on('loadedtweets', function(data){
			$.each(data, function(index, value){
                addToMap(JSON.parse(value));
            });
            
		});

        //Load Tweets on first connect
        socket.emit('loadtweets');
        
        socket.on('connect', function(data){			
            showMessage('Connected!', 2000);            
		});
            
        socket.on('reconnecting', function(data){
			console.log('Reconnecting');
            showMessage('Disconnected. Trying a Reconnect...', 2000);
		});

        socket.on('disconnect', function(data){
			socket.emit('disconnect');
		}); 
        
        socket.on('message', function (data) {
            addToMap(data);
            
            //OnClick Add Tweet details         
        });        
    },

    addToMap = function(data){
        var coords = data.coordinates;
            
            map.setOptions();
            var marker = new google.maps.Marker({
                animation: google.maps.Animation.DROP,
                position: new google.maps.LatLng(coords.latitude, coords.longitude),
                map: map,
                title:data.text
            });
    }

    showMessage = function(message, timeout){
        $('#connectionstatus').html(message).fadeIn('slow');

        if(timeout > 0) {
            window.setInterval(function(){
                $('#connectionstatus').fadeOut('slow');
            }, timeout);
        }
    }

    maps = function(){
        var mapOptions = {
            zoom: 3,
            center: new google.maps.LatLng(47.6842897, 17.3434897),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        
    }
} (jQuery));