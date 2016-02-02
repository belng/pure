import xmpp from 'node-xmpp';
import { bus, config } from "../../core";

let options, xmppClient, backOff = 1;


options = {
  type: 'client',
  jid: config.gcm.appid + '@gcm.googleapis.com',
  password: config.gcm.password,
  port: 5235,
  host: 'gcm.googleapis.com',
  legacySSL: true,
  preferredSaslMechanism : 'PLAIN'
};

function onConnect() {
	backOff = 1;
}

function onMessage(message) {
}

function onACK() {
}
function onStanza(stanza) {
	if(stanza.is("message")) onMessage(stanza);
	else onACK(stanza);
}

function onError() {
	setTimeout(connect, backOff * 1000);
	backOff *= 2;
	if(backOff > 128) backOff = 128;
}
function connect() {
	xmppClient = new xmpp.Client(options);
	xmpp.on("online", onConnect);
	xmpp.on("stanza", onStanza);
}

function push(stanza) {
}
