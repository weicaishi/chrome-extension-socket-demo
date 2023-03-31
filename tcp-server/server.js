chrome.app.runtime.onLaunched.addListener(function () { //main
    console.log("connecting...");
    chrome.sockets.tcpServer.create({}, function (createInfo) {
        console.log("chrome.sockets.tcpServer...");
        listenAndAccept(createInfo.socketId);
    });

});

function listenAndAccept(socketId) {
    chrome.sockets.tcpServer.listen(socketId,
        "127.0.0.1", 3001, function (resultCode) {
            onListenCallback(socketId, resultCode)
        });
}


var serverSocketId;
function onListenCallback(socketId, resultCode) {
    if (resultCode < 0) {
        console.log("Error listening:" +
            chrome.runtime.lastError.message);
        return;
    }
    serverSocketId = socketId;
    chrome.sockets.tcpServer.onAccept.addListener(onAccept)
}

function ab2str(buf) { //arraybuffer to string
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) { //string to arraybuffer
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function onAccept(info) {
    if (info.socketId != serverSocketId)
        return;


    var data = new ArrayBuffer(40);
    // A new TCP connection has been established.
    chrome.sockets.tcp.send(info.clientSocketId, data,
        function (resultCode) {
            console.log("Data sent to new TCP client connection.")
        });
    // Start receiving data.
    chrome.sockets.tcp.onReceive.addListener(function (recvInfo) {
        if (recvInfo.socketId != info.clientSocketId)
            return;
        console.log("RECV" + ab2str(recvInfo.data));

        chrome.sockets.tcp.send(info.clientSocketId, recvInfo.data,
            function (resultCode) {
                console.log("Data sent to new TCP client connection.")
            });

        // recvInfo.data is an arrayBuffer.
    });
    chrome.sockets.tcp.setPaused(info.clientSocketId, false);
}

chrome.runtime.onSuspend.addListener(function () { //exit
    console.log("disconnecting...");
    chrome.sockets.tcpServer.onAccept.removeListener(onAccept);
    chrome.sockets.tcpServer.disconnect(serverSocketId);
});


