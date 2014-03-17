

var socket = io.connect();

function searchCity() {
    console.log("hit me");
    if ($('#cityInput').val() != "")
    {
        socket.emit('search', $('#cityInput').val());
    }
}

$(function() {
        console.log("hello");
        $("#searchBtn").click(function() {
            console.log("ahhh");
            $("#stopBtn").removeClass("hidden");
            searchCity();
        });

        $("#stopBtn").click(function() {
            socket.emit('stop');
        });

        socket.on('tweet', function(data) {
            var name = data.name,
                message = data.message;

            var newTweet = '<div><h5>' + name + ':</h5><h6>' + message + '</h6></div><hr>';
            $('#tweet-box').prepend(newTweet);

        });
});
