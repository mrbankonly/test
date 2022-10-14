const PubNub = require("pubnub");

let pubnub = null;

const onStatus = (s, channel) => {
	if (s.category === "PNConnectedCategory") {
		console.log("Status: SUCCESS, Channel: " + channel);
	} else {
		console.log("Status: Failed, Channel: " + channel);
		console.log("Response: ", s);
	}
};

const PubNubFunc = {
	listen: (channel) => {
		if (!pubnub) throw new Error("pubnub not registered correctly");
		if (!channel) throw new Error(channel + " required");
		return (callback) => {
			pubnub.subscribe({ channels: [channel] });
			pubnub.addListener({
				message: (response) => {
					if (response.channel !== channel) return;
					callback({ response, channel, payload: response.message });
				},
				status: (s) => onStatus(s, channel),
			});
			console.log("Listen Running, Pubnub Channel: " + channel);
		};
	},
	publish: (channel) => (message) => {
		if (!pubnub) throw new Error("pubnub not registered correctly");
		pubnub.publish({ channel, message }, function (status, response) {
			if (status.error) {
				console.log(status, response, channel);
			}
		});
	},
	initPubnub: ({ PUBLISHKEY = process.env.PUBLISHKEY, SUBSCRIBEKEY = process.env.SUBSCRIBEKEY, UUID = process.env.UUID }) => {
		pubnub = new PubNub({
			publishKey: PUBLISHKEY,
			subscribeKey: SUBSCRIBEKEY,
			uuid: UUID,
		});
	},
};

module.exports = PubNubFunc