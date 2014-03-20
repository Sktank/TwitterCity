
$(function() {

    // client side globals

    function Visualize() {
        var socket = io.connect();
        var streaming = false;
        var map;
        var markersArray = [];
        var count = 0;

        // hashtag word cloud
        this.hashtags = {};
        this.hashtagCount = 0;
        this.canDrawHashtagCloud = true;
        this.cleanHashtagCloud = null;
        this.hashCloudId = '#hash-tweet-cloud';

        // message word cloud
        this.words = {};
        this.wordCount = 0;
        this.canDrawCloud = true;
        this.cleanWordCloud = null;
        this.wordCloudId = '#tweet-cloud';

        var self = this;


        // initialize the google map
        initMap();

        // stream button functionality
        $("#search-btn").click(function() {
            var padding = 5;
            searchCity();
            $('html, body').animate({
                scrollTop: $("#search-btn").offset().top - padding
            }, 500);
        });
        $("#stop-btn").click(function() {
            if (streaming == true) {
                socket.emit('stop');
                streaming = false;
                if (self.cleanHashtagCloud) {
                    clearInterval(self.cleanHashtagCloud)
                }
                if (self.cleanWordCloud) {
                    clearInterval(self.cleanWordCloud)
                }

            }
        });
        $("#clear-btn").click(function() {
            $('#tweet-box').empty();
            $('#tweet-info').empty();
            clearMap();
            refreshParams();
            $('#tweet-cloud').empty();
            $('#hash-tweet-cloud').empty();
        });


        // This function is called when you receive streaming data
        socket.on('tweet', function(data) {
            var name = data.name,
                message = data.message,
                location = data.location,
                tags = data.tags,
                geoLocation = new google.maps.LatLng(location[0], location[1]);


            // add the tweet to the tweet box
            var tagsLabel = ""
            if (tags) {
                tagsLabel = "#" + tags.replace(" ", "#")
            }
            var newTweet = '<div id="tweet-' + count + '"><h5>' + name + ': ' + tagsLabel + '</h5><h6>' + message + '</h6></div><hr>';
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

            // update Word Clouds
            if (tags) {
                updateWordCloud(self.hashCloudId, tags, self.hashtags, self.hashtagCount, 'canDrawHashtagCloud');
            }
            if (message) {
                updateWordCloud(self.wordCloudId, message, self.words, self.wordCount, 'canDrawCloud');
            }

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
                loopTrimWordCloud(self.words, 'cleanWordCloud');
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

        function refreshParams() {
            self.words = {};
            self.wordCount = 0;
            self.hashtags = {};
            self.hashtagCount = 0;
            self.cleanWordCloud = null;
            self.cleanHashtagCloud = null;
        }

        var stopWords = /^(still|tell|want|got|youre|means|going|gonna|like|just|thats|u|\?|dont|w|get|@\.\.\.|hes|come|also|para|que|en|really|know|shes|way|yeah|fr|go|last|guys|el|lol|ur|ok|@|oh|im|i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall)$/;

        function updateWordCloud(cloudId, message, words, wordCount, canDraw) {
            var messageWords,
                word,
                cloudRedrawTime = 5000;


            //remove all punctuation
            message = message.replace(/[\.,-\/#!$%\^&\*;:{}=\-"'_`~()]/g,"").replace(/\s{2,}/g," ");

            console.log(cloudId + ": " + message);
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

            console.log(Object.keys(words).length);
            console.log(self.canDrawCloud);

            // only redraw once every given number of second
            if (self[canDraw]) {
                self[canDraw] = false;
                drawCloud(cloudId, words, wordCount);

                setTimeout(function() {
                    console.log("can draw again");
                    self[canDraw] = true;
                }, cloudRedrawTime);
            }
        }

        function loopTrimWordCloud(words, type) {
            var interval = 30000;
            this[type] = setInterval(function () {
                console.log(interval);
                if (streaming) {
                    for (var wordItem in words) {
                        if (words[wordItem] == 1) {
                            delete words[wordItem];
                        }
                    }
                }
            }, interval);
        }
    }

    Visualize();
});
