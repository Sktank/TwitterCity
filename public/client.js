

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
            searchCity();
        })
});
