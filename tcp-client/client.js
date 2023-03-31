//socket handle
var sid = -1;

//arraybuffer to string
function ab2str(buf) {
	return String.fromCharCode.apply(null, new Uint8Array(buf));
}

//string to arraybuffer
function str2ab(str) {
	var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
	var bufView = new Uint16Array(buf);
	for (var i = 0, strLen = str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
}

//main
chrome.app.runtime.onLaunched.addListener(function () {
	console.log("connecting...");

	chrome.sockets.tcp.create({}, function (createInfo) {
		sid = createInfo.socketId;
		console.log("socket created (%d)", sid);

		chrome.sockets.tcp.onReceiveError.addListener(function (info) {
			console.log("could not receive on socket (%d), error code (%d)", info.socketId, info.resultCode);
		});

		chrome.sockets.tcp.onReceive.addListener(function (info) {
			console.log("received data -- %s", ab2str(info.data));
		});

		chrome.sockets.tcp.connect(sid, "127.0.0.1", 3000, function (result) {
			if (result < 0) {
				console.log("could not connect socket (%d), error code (%d)", sid, result)
			} else {
				console.log("socket connected (%d)", sid);
			}
		});
	});
});


//exit
chrome.runtime.onSuspend.addListener(function () {
	console.log("disconnecting...");
	chrome.sockets.tcp.disconnect(sid);
});

