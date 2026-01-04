import CONSTS from "./consts.js";
const blocks = {};

blocks.warn = text => [
	{
		type: "section",
		text: {
			type: "mrkdwn",
			text
		},
		accessory: {
			type: "button",
			text: {
				type: "plain_text",
				text: "Close"
			},
			action_id: "cancel"
		}
	}
];

blocks.createAutomationStep1 = ({ automationName, automationShortDescription, automationLongDescription, automationColor }) => [
	{
		type: "section",
		text: {
			type: "mrkdwn",
			text: "First, define the basics of your automation. You'll be able to change this later!"
		}
	},
	{
		type: "input",
		element: {
			type: "plain_text_input",
			action_id: "ignore-automation-name",
			placeholder: {
				type: "plain_text",
				text: "Max 35 characters"
			},
			initial_value: automationName
		},
		label: {
			type: "plain_text",
			text: "Automation name",
			emoji: true
		},
		optional: false
	},
	{
		type: "input",
		element: {
			type: "plain_text_input",
			action_id: "ignore-automation-short-description",
			placeholder: {
				type: "plain_text",
				text: "Max 140 characters"
			},
			initial_value: automationShortDescription
		},
		label: {
			type: "plain_text",
			text: "Short description",
			emoji: true
		},
		optional: true
	},
	{
		type: "input",
		element: {
			type: "plain_text_input",
			multiline: true,
			action_id: "ignore-automation-long-description",
			placeholder: {
				type: "plain_text",
				text: "Min 175 characters; max 4000 characters"
			},
			initial_value: automationLongDescription
		},
		label: {
			type: "plain_text",
			text: "Long description",
			emoji: true
		},
		optional: false
	},
	{
		type: "input",
		element: {
			type: "plain_text_input",
			action_id: "ignore-automation-color",
			placeholder: {
				type: "plain_text",
				text: "Hex code (optional)"
			},
			initial_value: automationColor
		},
		label: {
			type: "plain_text",
			text: "App Color",
			emoji: true
		},
		optional: false
	},
	{
		type: "actions",
		elements: [
			{
				type: "button",
				text: {
					type: "plain_text",
					text: ":x: Cancel",
					emoji: true
				},
				value: "cancel",
				action_id: "cancel"
			},
			{
				type: "button",
				text: {
					type: "plain_text",
					text: ":arrow_forward: Save & Next",
					emoji: true
				},
				value: "create-automation-step2",
				action_id: "create-automation-step2"
			}
		]
	}
];

blocks.createAutomationStep2 = ({ automationRefreshToken }) => [
	{
		type: "section",
		text: {
			type: "mrkdwn",
			text: "Enter your app configuration refresh token. Your actual configuration token is used to create and manage your automation, but it expires soon after being issued. The refresh token is used to renew the first token, and so it is all that is necessary to maintain the bot."
		}
	},
	{
		type: "section",
		text: {
			type: "mrkdwn",
			text: "To get this token, go to https://api.slack.com/apps. At the bottom, in \"Your App Configuration Tokens,\" click \"Generate Token.\" Make sure to choose this workspace."
		}
	},
	{
		type: "input",
		element: {
			type: "plain_text_input",
			action_id: "ignore-automation-configuration-refresh-token",
			placeholder: {
				type: "plain_text",
				text: "xoxe-TOKEN"
			},
			initial_value: automationRefreshToken
		},
		label: {
			type: "plain_text",
			text: "Refresh Token (the second token)",
			emoji: true
		},
		optional: false
	},
	{
		type: "actions",
		elements: [
			{
				type: "button",
				text: {
					type: "plain_text",
					text: ":arrow_backward: Save & Back",
					emoji: true
				},
				value: "create-automation-step1",
				action_id: "create-automation-step1"
			},
			{
				type: "button",
				text: {
					type: "plain_text",
					text: ":x: Cancel",
					emoji: true
				},
				value: "cancel",
				action_id: "cancel"
			},
			{
				type: "button",
				text: {
					type: "plain_text",
					text: ":white_check_mark: Create!",
					emoji: true
				},
				value: "create-automation",
				action_id: "create-automation"
			}
		]
	},
	{
		type: "context",
		elements: [
			{
				type: "plain_text",
				text: "Your tokens will be used to create and edit your automations, and will remain in the database thereafter. If you want the tokens to be removed, you can do that at any time through /manage-config-tokens."
			},
			{
				type: "mrkdwn",
				text: "Keep in mind that your automation and tokens are under your account, and that means you can always take control of them through the Slack page at https://api.slack.com/apps if you have issues. The developer of Automation Creator (<https://github.com/lraj23|lraj23> created this open source at <https://github.com/lraj23/automation-creator|lraj23/automation-creator>) is not responsible for the actions taken by your automations."
			}
		]
	}
];

blocks.appHomePage = automation => [
	{
		type: "header",
		text: {
			type: "plain_text",
			text: "Welcome to " + automation.displayInformation.automationName + "!"
		}
	},
	{
		type: "section",
		text: {
			type: "mrkdwn",
			text: "From here you can view and edit your automation!"
		}
	},
	{
		type: "header",
		text: {
			type: "plain_text",
			text: "Trigger"
		}
	},
	{
		type: "section",
		text: {
			type: "mrkdwn",
			text: "Choose the trigger for your automation here. This is what will cause your automation to run."
		}
	},
	{
		type: "actions",
		elements: [
			{
				type: "static_select",
				placeholder: {
					type: "plain_text",
					text: "Choose a trigger",
					emoji: true
				},
				options: Object.entries(CONSTS.AUTOMATION_CREATOR_TRIGGERS).map(trigger => ({
					text: {
						type: "plain_text",
						text: trigger[1].text,
						emoji: true
					},
					value: trigger[0]
				})),
				initial_option: automation.currentState.trigger.type ? {
					text: {
						type: "plain_text",
						text: CONSTS.AUTOMATION_CREATOR_TRIGGERS[automation.currentState.trigger.type].text,
						emoji: true
					},
					value: automation.currentState.trigger.type
				} : undefined,
				action_id: "edit-automation-trigger",
			},
			...(automation.currentState.trigger.type ? CONSTS.AUTOMATION_CREATOR_TRIGGERS[automation.currentState.trigger.type].hasDetail ? [{
				joinedChannel: {
					type: "conversations_select",
					placeholder: {
						type: "plain_text",
						text: "Choose a channel",
						emoji: true
					},
					initial_conversation: blocks.isValidDetail(automation.currentState.trigger.detail) ? automation.currentState.trigger.detail : undefined,
					action_id: "edit-automation-trigger-detail"
				},
				addedReaction: {
					type: "conversations_select",
					placeholder: {
						type: "plain_text",
						text: "Choose a channel",
						emoji: true
					},
					initial_conversation: blocks.isValidDetail(automation.currentState.trigger.detail) ? automation.currentState.trigger.detail : undefined,
					action_id: "edit-automation-trigger-detail"
				}
			}[automation.currentState.trigger.type]] : [] : [])
		]
	},
	...blocks.appHomePageTriggerDetailWarning(automation.currentState),
	{
		type: "divider"
	},
	...blocks.appHomePageTriggerSpecific(automation.currentState),
	...blocks.appHomePageSteps(automation.currentState)
];

blocks.appHomePageTriggerDetailWarning = currentState => {
	if (!currentState.trigger.detail) return [];
	if (currentState.trigger.detail === "Unavailable") return [{
		type: "context",
		elements: [
			{
				type: "mrkdwn",
				text: "This channel doesn't seem to be available. If it's private, try adding this automation to that channel first and then trying again. Sorry, but automations do not work in direct messages."
			}
		]
	}];
	else return [];
};

blocks.appHomePageTriggerSpecific = currentState => {
	if (!blocks.isValidDetail(currentState.trigger.detail)) return [];
	return CONSTS.AUTOMATION_CREATOR_TRIGGERS[currentState.trigger.type].hasSpecific ? [{
		addedReaction: {
			type: "input",
			element: {
				type: "plain_text_input",
				placeholder: {
					type: "plain_text",
					text: "No colons",
					emoji: true
				},
				initial_value: currentState.trigger.specific || undefined,
				action_id: "edit-automation-trigger-specific"
			},
			label: {
				type: "plain_text",
				text: "Enter the name of the emoji",
				emoji: true
			},
			optional: false,
			dispatch_action: true
		}
	}[currentState.trigger.type], { type: "divider" }] : [];
};

blocks.appHomePageSteps = currentState => {
	if (!currentState.trigger.type) return [];
	if (CONSTS.AUTOMATION_CREATOR_TRIGGERS[currentState.trigger.type].hasDetail && !blocks.isValidDetail(currentState.trigger.detail)) return [];
	if (CONSTS.AUTOMATION_CREATOR_TRIGGERS[currentState.trigger.type].hasSpecific && !currentState.trigger.specific) return [];
	else return [
		{
			type: "header",
			text: {
				type: "plain_text",
				text: "Step"
			}
		},
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: "Set the step for your automation! This is what happens when your automation is triggered."
			}
		},
		{
			type: "actions",
			elements: [
				{
					type: "static_select",
					placeholder: {
						type: "plain_text",
						text: "Choose an action",
						emoji: true
					},
					options: Object.entries(CONSTS.AUTOMATION_CREATOR_STEPS).map(step => ({
						text: {
							type: "plain_text",
							text: step[1].text,
							emoji: true
						},
						value: step[0]
					})),
					initial_option: currentState.steps[0] ? {
						text: {
							type: "plain_text",
							text: CONSTS.AUTOMATION_CREATOR_STEPS[currentState.steps[0].type].text,
							emoji: true
						},
						value: currentState.steps[0].type
					} : undefined,
					action_id: "edit-automation-step"
				}
			]
		},
		{
			type: "divider"
		}
	];
};

blocks.isValidDetail = detail => detail === "Unavailable" ? false : detail;

blocks.appHomePageOther = automation => [
	{
		type: "section",
		text: {
			type: "mrkdwn",
			text: automation.displayInformation.automationName + " was created by <@" + automation.tokens.authed_user.id + "> using Automation Creator. Its trigger is \"" + CONSTS.AUTOMATION_CREATOR_TRIGGERS[automation.currentState.trigger.type].text + ",\" and it takes the action \"" + (CONSTS.AUTOMATION_CREATOR_STEPS[automation.currentState.steps[0]?.type]?.text || "None") + ".\" Contact them to learn more!"
		}
	}
];

export default blocks;