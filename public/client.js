


$(function() {

    // client side globals
    var socket = io.connect();
    var streaming = false;
    var map;
    var markersArray = [];
    var count = 0;


    // initialize the google map
    initMap();

    // stream button functionality
    $("#search-btn").click(function() {
        searchCity();
    });
    $("#stop-btn").click(function() {
        if (streaming == true) {
            socket.emit('stop');
            streaming = false;
        }
    });
    $("#clear-btn").click(function() {
        $('#tweet-box').empty();
        $('#tweet-info').empty();
        clearMap();
    });


    // This function is called when you receive streaming data
    socket.on('tweet', function(data) {
        var name = data.name,
            message = data.message,
            location = data.location,
            geoLocation = new google.maps.LatLng(location[0], location[1]);


        // add the tweet to the tweet box
        var newTweet = '<div id="tweet-' + count + '"><h5>' + name + ':</h5><h6>' + message + '</h6></div><hr>';
        $('#tweet-box').prepend(newTweet);

        // add a new marker to the map
        var marker = new google.maps.Marker({
            position: geoLocation,
            map: map,
            title: message,
            icon: '/twitter-icon-map-tiny-2.png'
        });
        markersArray.push(marker);

        // reveal tweet on marker click
        google.maps.event.addListener(marker, 'click', function() {
            $('#tweet-info').html(newTweet);
        });
        count = count + 1;
    });

    socket.on('cityLocation', function(location) {
        console.log(location);
        map.setCenter(new google.maps.LatLng(location.lat, location.lng));
        map.setZoom(8);
    });



    // Utility Functions

    // search for a city
    function searchCity() {
        if ($('#city-input').val() != "" && streaming == false)
        {
            socket.emit('search', $('#city-input').val());
            streaming = true;
        }
    }

    // initialize the map
    function initMap() {
        var mapOptions = {
            center: new google.maps.LatLng(20, -30),
            zoom: 2
        };
        var mapCanvas = document.getElementById("map-canvas");
        console.log(mapCanvas);
        map = new google.maps.Map(mapCanvas, mapOptions);
    }

    function clearMap() {
        for (var i = 0; i < markersArray.length; i++ ) {
            markersArray[i].setMap(null);
        }
        markersArray.length = 0;
    }

});
