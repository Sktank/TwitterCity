
$(function() {

    // client side globals
    var socket = io.connect();
    var streaming = false;
    var map;
    var markersArray = [];
    var count = 0;
    var words = {};
    var wordCount = 0;


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
        words = {};
        wordCount = 0;
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

        // update Word Cloud
        updateWordCloud(message);




    });

    socket.on('cityLocation', function(location) {
        console.log(location);
        map.setCenter(new google.maps.LatLng(location.lat, location.lng));
        map.setZoom(10);
    });



    // Utility Functions

    // search for a city
    function searchCity() {
        if ($('#city-input').val() != "" && streaming == false)
        {
            socket.emit('search', {city:$('#city-input').val(), track:$('#tag-input').val()});
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

    // clear the map
    function clearMap() {
        for (var i = 0; i < markersArray.length; i++ ) {
            markersArray[i].setMap(null);
        }
        markersArray.length = 0;
    }


    var boringWords = {'and':1, 'the':1, 'of':1, 'to':1, 'like':1, 'get':1, 'in':1,
        'is':1, 'an':1, 'your':1, 'me':1, 'with':1, 'on':1, 'are':1,
        'for':1, 'a':1, 'im':1, 'let':1, 'some':1, 'at':1, 'do':1,
        'my':1, 'it':1, 'them':1, 'was':1, 'but':1, 'that':1, 'very':1,
        'this':1, 'as':1, 'can':1, 'when':1, 'where':1, 'how':1, 'what':1,
        'who':1, 'why':1, 'u':1, 'whats':1, 'must':1, 'you':1, 'i':1,
        'these':1, 'just':1};

    function updateWordCloud(message) {
        var messageWords,
            word;

        //remove all punctuation
        message = message.replace(/[\.,-\/#!$%\^&\*;:{}=\-"'_`~()]/g,"").replace(/\s{2,}/g," ");

        console.log(message);
        messageWords = message.split(" ");
        for (var i = 0; i < messageWords.length; i++) {
            word = messageWords[i];

            if(!boringWords[word.toLowerCase()]) {
                if (words[word]) {
                    words[word] = words[word] + 1;
                }
                else {
                    words[word] = 1;
                }
                wordCount = wordCount + 1
            }
        }
        drawCloud(words, wordCount);
    }

});
