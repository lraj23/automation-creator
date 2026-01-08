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
		when: "you press a button",
		hasDetail: false,
		hasSpecific: false,
		permittedSteps: [
			"sendMessage"
		]
	},
	joinedChannel: {
		text: "Join Channel",
		when: "someone joins the {detail} channel",
		hasDetail: true,
		hasSpecific: false,
		permittedSteps: [
			"sendMessage"
		]
	},
	addedReaction: {
		text: "Add Reaction",
		when: "someone reacts to a message in {detail} with {specific}",
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
		then: "send \"{specific}\" in {detail}",
		hasDetail: true,
		hasSpecific: true
	},
	addReaction: {
		text: "Add a Reaction",
		then: "react to the reacted message with {specific}",
		hasDetail: false,
		hasSpecific: true
	}
}

CONSTS.WEB_PATHS = {
	"/": ["index.html", "text/html"],
	"/general.css": ["general.css", "text/css"],
	"/general.js": ["general.js", "text/js"],
	"/index.js": ["index.js", "text/js"],
	"/create": ["create.html", "text/html"],
	"/create.js": ["create.js", "text/js"],
	"/create/2": ["create2.html", "text/html"],
	"/create2.js": ["create2.jS", "text/js"]
};

CONSTS.GENERATE_MANIFEST = (displayInformation, token) => ({
	token,
	manifest: JSON.stringify({
		display_information: {
			name: displayInformation.automationName,
			long_description: displayInformation.automationLongDescription,
			description: displayInformation.automationShortDescription,
			background_color: displayInformation.automationColor
		},
		settings: {
			socket_mode_enabled: false,
			interactivity: {
				is_enabled: true,
				request_url: process.env.AUTOMATION_CREATOR_API_URL + "/interactivity",
				message_menu_options_url: process.env.AUTOMATION_CREATOR_API_URL + "/interactivity"
			},
			event_subscriptions: {
				request_url: process.env.AUTOMATION_CREATOR_API_URL + "/event-subscriptions",
				bot_events: [
					"app_home_opened",
					"message.im",
					"message.channels",
					"message.groups",
					"message.mpim",
					"reaction_added",
					"member_joined_channel"
				]
			}
		},
		features: {
			app_home: {
				home_tab_enabled: true,
				messages_tab_enabled: true,
				messages_tab_read_only_enabled: false
			},
			bot_user: {
				display_name: displayInformation.automationName,
				always_online: true
			}
		},
		oauth_config: {
			redirect_urls: [
				process.env.AUTOMATION_CREATOR_API_URL + "/installed"
			],
			scopes: {
				bot: CONSTS.AUTOMATION_CREATOR_SCOPES
			}
		}
	})
});

CONSTS.AI_GENERATE = async userMessage => {
	const response = await fetch(process.env.AUTOMATION_CREATOR_AI_API_URL, {
		method: "POST",
		headers: { Authorization: "Bearer " + process.env.AUTOMATION_CREATOR_AI_API_KEY, "Content-Type": "application/json" },
		body: JSON.stringify({
			model: "openai/gpt-oss-120b",
			messages: [{ role: "system", content: "You are the Automation Creator AI. Your goal is to help the user to design their automation based on how they describe it. There are three possible triggers: manual (pressing the \"Run Automation\" button), addedReaction (someone reacting with a specific emoji in a specific channel), and joinedChannel (someone joined a certain channel). There are two total possible steps: addReaction (reacting to a reacted message with a specific emoji) and sendMessage (sending a specific message in a certain channel). However, addReaction is only a valid step if the trigger was addedReaction—otherwise it is invalid and should not be considerd.\nThe user message consists of the user's request for an automation. You need to determine what the trigger is, as well as decide the step to take in the automation, ensuring it is compatible with the trigger.\nOnce again the IDs for each trigger and step are: manual is pressing a button, a trigger; addedReaction is reacting with a specific emoji in a specific channel, a trigger; joinedChannel is joining a specific channel, a trigger; addReaction is reacting with a specific emoji on a specific message already reacted to, a step; and sendMessage is sending a specific message in a specific message. Your final output MUST be this precisely, replacing items in {} with appropriate values:\n{trigger id} {trigger channel} {trigger emoji} {step id} {step channel} \n{step content}\nIf the trigger does not require a channel or an emoji, replace that id with an empty string, leading to more than one adjacent space if necessary. Otherwise, use the id of the channel as provided by the user (should be CXXXXXXXXXX, may often be part of a channel link), and the name of the emoji as provided. If the step does not require a channel (it is addReaction), just use the channel of the message reacted to, which should be the same as the trigger channel. Else, if the step does not require a emoji (it is sendMessage), put the content of the message there.\nIf you are missing the channel id or any other critical information required to accurately come up with a final result, your final answer should just simply be \"notClear\"." }, { role: "user", content: userMessage }]
		})
	});
	return await response.json();
};

CONSTS.TEST_GENERATE = async () => {
	try {
		return (await fetch(process.env.AUTOMATION_CREATOR_AI_API_URL, {
			method: "POST",
			headers: { Authorization: "Bearer " + process.env.AUTOMATION_CREATOR_AI_API_KEY, "Content-Type": "application/json" },
			body: JSON.stringify({
				model: "qwen/qwen3-32b",
				messages: [{ role: "system", content: "Respond with just the word \"Hi!\"" }, { role: "user", content: "Hello!" }]
			})
		})).ok;
	} catch (e) {
		return false;
	}
};

export default CONSTS;