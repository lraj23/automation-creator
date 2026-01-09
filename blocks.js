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
			text: "First, define the basics of your automation. Keep in mind that you won't be able to change this later."
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
			text: "Enter your app configuration refresh token. Your actual configuration token is used to create your automation, but it expires soon after being issued. The refresh token is used to renew the first token, and so it is all that is necessary."
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
				text: "Your tokens will be used to create and edit your automations, and will not be stored thereafter."
			},
			{
				type: "mrkdwn",
				text: "Keep in mind that your automation and tokens are under your account, and that means you can always take control of them through the Slack page at https://api.slack.com/apps if you have issues. The developer of Automation Creator (<https://github.com/lraj23|lraj23> created this open source at <https://github.com/lraj23/automation-creator|lraj23/automation-creator>) is not responsible for the actions taken by your automations."
			}
		]
	}
];

blocks.appHomePage = async automation => [
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
	...blocks.appHomePageManualButton(automation.activeState),
	...(await blocks.appHomePageWithAIButton(automation.editingState)),
	{
		type: "divider"
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
				initial_option: automation.editingState.trigger.type ? {
					text: {
						type: "plain_text",
						text: CONSTS.AUTOMATION_CREATOR_TRIGGERS[automation.editingState.trigger.type].text,
						emoji: true
					},
					value: automation.editingState.trigger.type
				} : undefined,
				action_id: "edit-automation-trigger",
			},
			...(automation.editingState.trigger.type ? CONSTS.AUTOMATION_CREATOR_TRIGGERS[automation.editingState.trigger.type].hasDetail ? [{
				joinedChannel: {
					type: "conversations_select",
					placeholder: {
						type: "plain_text",
						text: "Choose a channel",
						emoji: true
					},
					initial_conversation: blocks.isValidDetail(automation.editingState.trigger.detail) ? automation.editingState.trigger.detail : undefined,
					action_id: "edit-automation-trigger-detail"
				},
				addedReaction: {
					type: "conversations_select",
					placeholder: {
						type: "plain_text",
						text: "Choose a channel",
						emoji: true
					},
					initial_conversation: blocks.isValidDetail(automation.editingState.trigger.detail) ? automation.editingState.trigger.detail : undefined,
					action_id: "edit-automation-trigger-detail"
				}
			}[automation.editingState.trigger.type]] : [] : [])
		]
	},
	...blocks.appHomePageTriggerDetailWarning(automation.editingState),
	{
		type: "divider"
	},
	...blocks.appHomePageTriggerSpecific(automation.editingState),
	...blocks.appHomePageSteps(automation.editingState),
	...blocks.appHomePageStepsDetailWarning(automation.editingState),
	...blocks.appHomePageStepsSpecific(automation.editingState),
	...blocks.appHomePageUpdateButton(automation.editingState)
];

blocks.appHomePageWithAI = async automation => [
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
		type: "actions",
		elements: [
			{
				type: "button",
				text: {
					type: "plain_text",
					text: "Create Manually",
					emoji: true
				},
				value: "edit-automation-manual-create",
				action_id: "edit-automation-manual-create"
			}
		]
	},
	{
		type: "divider"
	},
	{
		type: "header",
		text: {
			type: "plain_text",
			text: "Prompt"
		}
	},
	{
		type: "section",
		text: {
			type: "mrkdwn",
			text: "Describe your automation to the AI. It should have a trigger of either being a button, a reaction added in a specific channel, or someone joining a specific channel"
		}
	},
	{
		type: "input",
		element: {
			type: "plain_text_input",
			multiline: true,
			action_id: "edit-automation-with-ai-request",
			placeholder: {
				type: "plain_text",
				text: "Describe the automation"
			},
			initial_value: automation.editingState?.aiRequest || undefined
		},
		label: {
			type: "plain_text",
			text: "Describe your automation",
			emoji: true
		},
		optional: false,
		dispatch_action: true
	},
	...await blocks.appHomePageWithAIResponse(automation.editingState)
];

blocks.appHomePageWithAIResponse = async editingState => {
	if (!await CONSTS.TEST_GENERATE()) {
		return [];
	}
	if (!editingState.aiResponse) return [];
	const response = editingState.aiResponse.split(" ");
	if (response[0] === "notClear") return [{
		type: "section",
		text: {
			type: "mrkdwn",
			text: "Automation Creator AI was not able to figure out exactly what you want. Make sure you specify your trigger, with the channel and emoji if applicable. Also specify the step with the required details. When you need to specify a certain channel, right click that channel and press Copy Link, then paste that in place of the channel."
		}
	}];
	return [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: "This is what the AI understood. Please confirm this is what you want before saving your automation:"
			}
		},
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: "You want your automation to run when " + CONSTS.AUTOMATION_CREATOR_TRIGGERS[response[0]]?.when?.split("{detail}")?.join("<#" + response[1] + ">")?.split("{specific}")?.join(":" + response[2] + ":") + ". When that happens, it will " + CONSTS.AUTOMATION_CREATOR_STEPS[response[3]]?.then?.split("{detail}")?.join("<#" + response[4].split("\n")[0] + ">")?.split("{specific}")?.join(editingState.aiResponse.split("\n").slice(1).join("\n"))
			}
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Confirm & Save",
						emoji: true
					},
					style: "primary",
					value: "save-automation-with-ai",
					action_id: "save-automation-with-ai"
				}
			]
		}
	];
};

blocks.appHomePageManualButton = activeState => {
	if (!activeState) return [];
	if (activeState.trigger.type !== "manual") return [];
	return [{
		type: "actions",
		elements: [
			{
				type: "button",
				text: {
					type: "plain_text",
					text: "Run automation",
					emoji: true
				},
				value: "run-automation-manual",
				action_id: "run-automation-manual"
			}
		]
	}];
};

blocks.appHomePageWithAIButton = async () => [
	{
		type: "actions",
		elements: [
			{
				type: "button",
				text: {
					type: "plain_text",
					text: ":sparkles: Generate with AI",
					emoji: true
				},
				value: "edit-automation-ai-generate",
				action_id: "edit-automation-ai-generate"
			}
		]
	},
	...(!(await CONSTS.TEST_GENERATE()) ? [{
		type: "context",
		elements: [
			{
				type: "mrkdwn",
				text: "Generating with AI has temporarily been turned off since the AI service is down..."
			}
		]
	}] : [])
];

blocks.appHomePageTriggerDetailWarning = editingState => {
	if (!editingState.trigger.detail) return [];
	if (editingState.trigger.detail === "Unavailable") return [{
		type: "context",
		elements: [
			{
				type: "mrkdwn",
				text: "This channel doesn't seem to be available. If it's private, try adding this automation to that channel first and then trying again. Sorry, but automations do not work in direct messages."
			}
		]
	}];
	return [{
		type: "context",
		elements: [
			{
				type: "mrkdwn",
				text: "Just make sure that this automation is in <#" + editingState.trigger.detail + "> for it to function!"
			}
		]
	}];
};

blocks.appHomePageTriggerSpecific = editingState => {
	if (!blocks.isValidDetail(editingState.trigger.detail)) return [];
	return CONSTS.AUTOMATION_CREATOR_TRIGGERS[editingState.trigger.type].hasSpecific ? [{
		addedReaction: {
			type: "input",
			element: {
				type: "plain_text_input",
				placeholder: {
					type: "plain_text",
					text: "No colons",
					emoji: true
				},
				initial_value: editingState.trigger.specific || undefined,
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
	}[editingState.trigger.type], { type: "divider" }] : [];
};

blocks.appHomePageSteps = editingState => {
	if (!editingState.trigger.type) return [];
	if (CONSTS.AUTOMATION_CREATOR_TRIGGERS[editingState.trigger.type].hasDetail && !blocks.isValidDetail(editingState.trigger.detail)) return [];
	if (CONSTS.AUTOMATION_CREATOR_TRIGGERS[editingState.trigger.type].hasSpecific && !editingState.trigger.specific) return [];
	return [
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
					options: Object.entries(CONSTS.AUTOMATION_CREATOR_STEPS).filter(step => CONSTS.AUTOMATION_CREATOR_TRIGGERS[editingState.trigger.type].permittedSteps.includes(step[0])).map(step => ({
						text: {
							type: "plain_text",
							text: step[1].text,
							emoji: true
						},
						value: step[0]
					})),
					initial_option: editingState.steps[0] ? {
						text: {
							type: "plain_text",
							text: CONSTS.AUTOMATION_CREATOR_STEPS[editingState.steps[0].type].text,
							emoji: true
						},
						value: editingState.steps[0].type
					} : undefined,
					action_id: "edit-automation-step"
				},
				...(editingState.steps[0] ? CONSTS.AUTOMATION_CREATOR_STEPS[editingState.steps[0].type].hasDetail ? [{
					sendMessage: {
						type: "conversations_select",
						placeholder: {
							type: "plain_text",
							text: "Choose a channel",
							emoji: true
						},
						initial_conversation: blocks.isValidDetail(editingState.steps[0].detail) ? editingState.steps[0].detail : undefined,
						action_id: "edit-automation-step-detail"
					},
					addReaction: {
						type: "conversations_select",
						placeholder: {
							type: "plain_text",
							text: "Choose a channel",
							emoji: true
						},
						initial_conversation: blocks.isValidDetail(editingState.steps[0].detail) ? editingState.steps[0].detail : undefined,
						action_id: "edit-automation-step-detail"
					}
				}[editingState.steps[0].type]] : [] : [])
			]
		},
		...(blocks.appHomePageStepsDetailWarning(editingState).length ? [] : [{
			type: "divider"
		}])
	];
};

blocks.appHomePageStepsDetailWarning = editingState => {
	if (!editingState.steps[0]) return [];
	if (!editingState.steps[0].detail) return [];
	if (editingState.steps[0].detail !== "Unavailable") return [
		{
			type: "context",
			elements: [
				{
					type: "mrkdwn",
					text: "Just make sure that this automation is in <#" + editingState.steps[0].detail + "> for it to function!"
				}
			]
		}
	];
	return [
		{
			type: "context",
			elements: [
				{
					type: "mrkdwn",
					text: "This channel doesn't seem to be available. If it's private, try adding this automation to that channel first and then trying again. Sorry, but automations do not work in direct messages."
				}
			]
		},
		{
			type: "divider"
		}
	];
};

blocks.appHomePageStepsSpecific = editingState => {
	if (!editingState.steps[0]) return [];
	if (CONSTS.AUTOMATION_CREATOR_STEPS[editingState.steps[0].type].hasDetail && !blocks.isValidDetail(editingState.steps[0].detail)) return [];
	return CONSTS.AUTOMATION_CREATOR_STEPS[editingState.steps[0].type].hasSpecific ? [{
		sendMessage: {
			type: "input",
			element: {
				type: "plain_text_input",
				placeholder: {
					type: "plain_text",
					text: "Message",
					emoji: true
				},
				initial_value: editingState.steps[0].specific || undefined,
				action_id: "edit-automation-step-specific"
			},
			label: {
				type: "plain_text",
				text: "Enter the message to send",
				emoji: true
			},
			optional: false,
			dispatch_action: true
		},
		addReaction: {
			type: "input",
			element: {
				type: "plain_text_input",
				placeholder: {
					type: "plain_text",
					text: "No colons",
					emoji: true
				},
				initial_value: editingState.steps[0].specific || undefined,
				action_id: "edit-automation-step-specific"
			},
			label: {
				type: "plain_text",
				text: "Enter the name of the emoji",
				emoji: true
			},
			optional: false,
			dispatch_action: true
		}
	}[editingState.steps[0].type], { type: "divider" }] : [];
};

blocks.appHomePageUpdateButton = editingState => {
	if (!editingState.steps[0]) return [];
	if (CONSTS.AUTOMATION_CREATOR_STEPS[editingState.steps[0].type].hasDetail && !blocks.isValidDetail(editingState.steps[0].detail)) return [];
	if (CONSTS.AUTOMATION_CREATOR_STEPS[editingState.steps[0].type].hasSpecific && !editingState.steps[0].specific) return [];
	return [{
		type: "actions",
		elements: [
			{
				type: "button",
				text: {
					type: "plain_text",
					text: "Save",
					emoji: true
				},
				style: "primary",
				value: "save-automation",
				action_id: "save-automation"
			}
		]
	}];
};

blocks.isValidDetail = detail => detail === "Unavailable" ? false : detail;

blocks.appHomePageOther = automation => [
	{
		type: "section",
		text: {
			type: "mrkdwn",
			text: automation.displayInformation.automationName + " was created by <@" + automation.tokens.authed_user.id + "> using Automation Creator. Its trigger is \"" + (CONSTS.AUTOMATION_CREATOR_TRIGGERS[automation.activeState?.trigger?.type]?.text || "None") + ",\" and it takes the action \"" + (CONSTS.AUTOMATION_CREATOR_STEPS[automation.activeState?.steps[0]?.type]?.text || "None") + ".\" Contact them to learn more!"
		}
	},
	...(automation.activeState?.trigger?.type === "manual" ? [{
		type: "actions",
		elements: [
			{
				type: "button",
				text: {
					type: "plain_text",
					text: "Run automation",
					emoji: true
				},
				style: "primary",
				value: "run-automation-manual",
				action_id: "run-automation-manual"
			}
		]
	}] : [])
];

export default blocks;