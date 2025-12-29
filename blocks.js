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

blocks.createAutomationStep2 = ({ automationConfigurationToken, automationRefreshToken }) => [
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

export default blocks;