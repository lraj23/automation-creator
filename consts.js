const CONSTS = {};

CONSTS.AUTOMATION_CREATOR_SCOPES = [
	"app_mentions:read",
	"channels:history",
	"channels:join",
	"channels:manage",
	"channels:read",
	"channels:write.invites",
	"chat:write",
	"chat:write.customize",
	"chat:write.public",
	"commands",
	"groups:history",
	"groups:read",
	"groups:write",
	"groups:write.invites",
	"im:history",
	"im:read",
	"im:write",
	"mpim:history",
	"mpim:read",
	"mpim:write",
	"reactions:read",
	"reactions:write",
	"usergroups:read",
	"usergroups:write",
	"users.profile:read",
	"users:read",
	"users:write"
];

CONSTS.AUTOMATION_CREATOR_BOT_SCOPES = [
	"channels:history",
	"channels:read",
	"chat:write",
	"chat:write.customize",
	"chat:write.public",
	"groups:history",
	"groups:read",
	"im:history",
	"im:read",
	"mpim:history",
	"mpim:read",
	"users:read",
	"commands"
];

CONSTS.GET_READABLE_VALUES = values => Object.fromEntries(Object.values(values).map(block => Object.entries(block)).flat());

CONSTS.AUTOMATION_CREATOR_TRIGGERS = {
	manual: {
		text: "Button",
		hasDetail: false,
		hasSpecific: false,
		permittedSteps: [
			"sendMessage"
		]
	},
	joinedChannel: {
		text: "Join Channel",
		hasDetail: true,
		hasSpecific: false,
		permittedSteps: [
			"sendMessage"
		]
	},
	addedReaction: {
		text: "Add Reaction",
		hasDetail: true,
		hasSpecific: true,
		permittedSteps: [
			"sendMessage",
			"addReaction"
		]
	}
};

CONSTS.AUTOMATION_CREATOR_STEPS = {
	sendMessage: {
		text: "Send a Message",
		hasDetail: true,
		hasSpecific: true
	},
	addReaction: {
		text: "Add a Reaction",
		hasDetail: false,
		hasSpecific: true
	}
}

CONSTS.WEB_PATHS = {
	"/": ["index.html", "text/html"],
	"/general.css": ["general.css", "text/css"],
	"/index.js": ["index.js", "text/js"],
	"/create": ["create.html", "text/html"],
	"/create.js": ["create.js", "text/js"]
};

export default CONSTS;