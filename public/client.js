
$(function() {
    var socket = io.connect();
    // create a new Visualizer object
    var twitterVis = new TwitterVisualizer(socket);
    // initialize the google map
    twitterVis.initMap();

    // search for a city and begin the visualization
    $("#search-btn").click(function() {
        var padding = 5;
        twitterVis.searchCity();
        $('html, body').animate({
            scrollTop: $("#search-btn").offset().top - padding
        }, 500);
    });

    // stop the stream
    $("#stop-btn").click(function() {
        if (twitterVis.streaming == true) {
            twitterVis.socket.emit('stop');
            twitterVis.streaming = false;
            if (twitterVis.cleanHashtagCloud) {
                clearInterval(self.cleanHashtagCloud)
            }
            if (twitterVis.cleanWordCloud) {
                clearInterval(twitterVis.cleanWordCloud)
            }

        }
    });

    // clear the screen and refresh the twitter data collections
    $("#clear-btn").click(function() {
        $('#tweet-box').empty();
        $('#tweet-info').empty();
        $('#tweet-cloud').empty();
        $('#hash-tweet-cloud').empty();
        twitterVis.clearMap();
        twitterVis.refreshParams();
    });

});
