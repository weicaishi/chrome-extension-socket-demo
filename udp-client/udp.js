var socketId;

chrome.app.runtime.onLaunched.addListener(function () { //main
    console.log("********************");

    // Create the Socket
    chrome.sockets.udp.create({}, function (socketInfo) {
        socketId = socketInfo.socketId;
        // Setup event handler and bind socket.
        chrome.sockets.udp.onReceive.addListener(onReceive);
        chrome.sockets.udp.bind(socketId, "127.0.0.1", 8000, function (result) {
            if (result < 0) {
                console.log("Error binding socket.");
                return;
            }
            console.log("********************");
            var data = new ArrayBuffer(40);
            chrome.sockets.udp.send(socketId, data, '127.0.0.1', 8001, function (sendInfo) {
                console.log("sent " + sendInfo.bytesSent);
            });
        });
    });


});

// Handle the "onReceive" event.
var onReceive = function (info) {
    if (info.socketId !== socketId)
        return;
    console.log("********************");
    console.log(ab2str(info.data));
    chrome.sockets.udp.send(socketId, info.data, '127.0.0.1', 8001, function (sendInfo) {
        console.log("sent " + sendInfo.bytesSent);
    });
};

function ab2str(buf) { //arraybuffer to string
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

chrome.runtime.onSuspend.addListener(function () { //exit

});