var socket = eio('wss://' + location.hostname+(location.port?":"+location.port:""));
console.log("trying to open socket");
socket.on('open', function(){
	console.log("socket ready!");
	socket.on('message', function(data){
		console.log(data);
	});
	socket.on('close', function(){});
	socket.send( JSON.stringify({type:"setstate",entities:{harish:{id:"harish",createtime: 1}}}));
});


document.getElementById("google").onclick = function(){	
	window.open("https://" + location.hostname+(location.port?":"+location.port:"") + "/r/google/login", "_blank", "location=no");
};

document.getElementById("facebook").onclick = function(){
	window.open("https://" + location.hostname+(location.port?":"+location.port:"") + "/r/facebook/login", "_blank", "location=no");
};


function sendAuth(auth) {
	socket.send(JSON.stringify({
		type: "setstate",
		auth: auth
	}));
}

function onMessage(e) {
	console.log(e.data);
	var data = e.data, auth = {};
	auth[data.provider]={
		code: data.code
	};
	sendAuth(auth);
}
window.addEventListener("message", onMessage);
