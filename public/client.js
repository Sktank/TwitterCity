
$(function() {

    // client side globals
    var socket = io.connect();
    var streaming = false;
    var map;
    var markersArray = [];
    var count = 0;

    // hashtag word cloud
    var hashtags = {};
    var hashtagCount = 0;
    var canDrawHashtagCloud = true;

    // message word cloud
    var words = {};
    var wordCount = 0;
    var canDrawCloud = true;


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
        hashtags = {};
        hashtagCount = 0;
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
            icon: '/img/twitter-icon-map-tiny-2.png'
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
            trimWordCloud();
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

    var stopWords = /^(still|tell|want|got|youre|means|going|gonna|like|just|thats|u|\?|dont|w|get|@\.\.\.|hes|come|also|para|que|en|really|know|shes|way|yeah|fr|go|last|guys|el|lol|ur|ok|@|oh|im|i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall)$/;

    function updateWordCloud(message) {
        var messageWords,
            word,
            cloudRedrawTime = 3000;

        //remove all punctuation
        message = message.replace(/[\.,-\/#!$%\^&\*;:{}=\-"'_`~()]/g,"").replace(/\s{2,}/g," ");

        console.log(message);
        messageWords = message.split(" ");
        for (var i = 0; i < messageWords.length; i++) {
            word = messageWords[i];

            if(!word.toLowerCase().match(stopWords)) {
                if (words[word]) {
                    words[word] = words[word] + 1;
                }
                else {
                    words[word] = 1;
                }
                wordCount = wordCount + 1
            }
        }


        // only redraw once every given number of seconds
        if (canDrawCloud) {
            canDrawCloud = false;
            drawCloud(words, wordCount);
            setTimeout(function() {
                canDrawCloud = true;
            }, cloudRedrawTime);
        }

        // delete words that are not helping
        if (wordCount > 10000) {
            for (var wordItem in words) {
                if (words[wordItem] < 3) {

                }
            }
        }
    }

    function loopTrimWordCloud() {
        var interval = 20000;
        function trimWordCloud() {
            if (streaming) {
                for (var wordItem in words) {
                    if (words[wordItem] < 3) {
                        delete words[wordItem];
                    }
                }
                setTimeout( trimWordCloud(), interval );
            }
        }
        setTimeout(trimWordCloud(), interval );
    }
});


//function updateWordCloud2(cloudId, message, words, wordCount, canDraw) {
//    var messageWords,
//        word,
//        cloudRedrawTime = 5000;
//
//    //remove all punctuation
//    message = message.replace(/[\.,-\/#!$%\^&\*;:{}=\-"'_`~()]/g,"").replace(/\s{2,}/g," ");
//
//    console.log(message);
//    messageWords = message.split(" ");
//    for (var i = 0; i < messageWords.length; i++) {
//        word = messageWords[i];
//
//        if(!boringWords[word.toLowerCase()]) {
//            if (this[words][word]) {
//                this[words][word] = this[words][word] + 1;
//            }
//            else {
//                this[words][word] = 1;
//            }
//            this[wordCount] = this[wordCount] + 1
//        }
//    }
//
//    if (this[canDraw]) {
//        this[canDraw] = false;
//        drawCloud(cloudId, this[words], this[wordCount]);
//
//        setTimeout(function() {
//            this[canDraw] = true;
//        }, cloudRedrawTime);
//    }
//    // only redraw cloud once every 10 seconds max
//}