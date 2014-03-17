


$(function() {


    var socket = io.connect();
    var streaming = false;

    console.log("hello");
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
    });

    socket.on('tweet', function(data) {
        var name = data.name,
            message = data.message;

        var newTweet = '<div><h5>' + name + ':</h5><h6>' + message + '</h6></div><hr>';
        $('#tweet-box').prepend(newTweet);

    });

    function searchCity() {
        if ($('#city-input').val() != "" && streaming == false)
        {
            socket.emit('search', $('#city-input').val());
            streaming = true;
        }
    }
});
