import CONSTS from "./consts.js";
import { app, apps } from "./client.js";
import "./server.js";
import "./io.js";
import { getAutomationCreator, saveState } from "./file.js";
import blocks from "./blocks.js";
const warn = async (workspaceId, channel, user, text) => await apps.getApp(workspaceId).client.chat.postEphemeral({
	channel,
	user,
	blocks: blocks.warn(text),
	text
});

app.command("/create-automation", async ({ ack, body: { user_id }, respond }) => {
	await ack();
	const automationCreator = getAutomationCreator();
	if (!automationCreator.inProgressAutomations[user_id]) automationCreator.inProgressAutomations[user_id] = {
		automationName: "",
		automationShortDescription: "",
		automationLongDescription: "",
		automationColor: ""
	};
	saveState(automationCreator);
	await respond({
		text: "Create an automation",
		blocks: blocks.createAutomationStep1(automationCreator.inProgressAutomations[user_id])
	});
});

app.action("create-automation-step1", async ({ ack, body: { user: { id: user }, state: { values } }, respond }) => {
	await ack();
	const automationCreator = getAutomationCreator();
	if (!automationCreator.inProgressAutomations[user]) return await respond("Something went wrong. Try running /create-automation again!");
	values = CONSTS.GET_READABLE_VALUES(values);

	saveState(automationCreator);
	await respond({
		text: "Create an automation",
		blocks: blocks.createAutomationStep1(automationCreator.inProgressAutomations[user])
	});
});

app.action("create-automation-step2", async ({ ack, body: { user: { id: user }, channel: { id: channel }, state: { values }, team, enterprise }, respond }) => {
	await ack();
	const teamId = team?.id;
	const enterpriseId = enterprise?.id;
	const automationCreator = getAutomationCreator();
	values = CONSTS.GET_READABLE_VALUES(values);
	const name = "ignore-automation-name" in values ? values["ignore-automation-name"].value : automationCreator.inProgressAutomations[user].automationName;
	const shortDesc = "ignore-automation-short-description" in values ? values["ignore-automation-short-description"].value : automationCreator.inProgressAutomations[user].automationShortDescription;
	const longDesc = "ignore-automation-long-description" in values ? values["ignore-automation-long-description"].value : automationCreator.inProgressAutomations[user].automationLongDescription;
	const color = "ignore-automation-color" in values ? values["ignore-automation-color"].value : automationCreator.inProgressAutomations[user].automationColor;

	if (!automationCreator.inProgressAutomations[user]) return await respond("Something went wrong. Try running /create-automation again!");
	if (!name) return await warn(teamId || enterpriseId, channel, user, "Enter an automation name!");
	if (name.length > 35) return await warn(teamId || enterpriseId, channel, user, "Make sure the name is under 35 characters long!");
	if (!shortDesc) return await warn(teamId || enterpriseId, channel, user, "Enter a short description!");
	if (shortDesc.length > 140) return await warn(teamId || enterpriseId, channel, user, "Make sure the short description is under 140 characters long!");
	if (!longDesc) return await warn(teamId || enterpriseId, channel, user, "Enter a long description!");
	if (longDesc.length < 175) return await warn(teamId || enterpriseId, channel, user, "Make sure the long description is at least 175 characters long!");
	if (longDesc.length > 4000) return await warn(teamId || enterpriseId, channel, user, "Make sure the long description is less than 4000 characters long!");
	if (color) {
		if (!parseInt(color, 16)) return await warn(teamId || enterpriseId, channel, user, "Really? That's not a color.");
		if (parseInt(color, 16) < 0) return await warn(teamId || enterpriseId, channel, user, "Really? That's not a color.");
		if (parseInt(color, 16) > 16777215) return await warn(teamId || enterpriseId, channel, user, "Really? That's not a color.");
	}

	automationCreator.inProgressAutomations[user] = {
		...automationCreator.inProgressAutomations[user],
		automationName: name,
		automationShortDescription: shortDesc || "",
		automationLongDescription: longDesc,
		automationColor: color || "676767"
	};
	saveState(automationCreator);

	await respond({
		text: "Enter your configuration tokens!",
		blocks: blocks.createAutomationStep2(automationCreator.inProgressAutomations[user])
	});
});

app.action("create-automation", async ({ ack, body: { user: { id: user }, channel: { id: channel }, state: { values }, team, enterprise }, respond }) => {
	await ack();
	const teamId = team?.id;
	const enterpriseId = enterprise?.id;
	const automationCreator = getAutomationCreator();
	if (!automationCreator.inProgressAutomations[user]) return await respond("Something went wrong. Try running /create-automation again!");
	values = CONSTS.GET_READABLE_VALUES(values);
	const refreshToken = "ignore-automation-configuration-refresh-token" in values ? values["ignore-automation-configuration-refresh-token"].value : automationCreator.inProgressAutomations[user].automationRefreshToken;

	saveState(automationCreator);
	let token;
	try {
		token = (await apps.getApp(teamId || enterpriseId).client.tooling.tokens.rotate({
			refresh_token: refreshToken
		})).token;
	} catch (e) {
		console.error(e.data.error);
		return await warn(teamId || enterpriseId, channel, user, "There was an error with your refresh token. Make sure it is active, recent, and begins with \"xoxe-\"");
	}

	try {
		automationCreator.inProgressAutomations[user].automationColor = "#" + automationCreator.inProgressAutomations[user].automationColor;
		const automation = await apps.getApp(teamId || enterpriseId).client.apps.manifest.create(CONSTS.GENERATE_MANIFEST(automationCreator.inProgressAutomations[user], token));
		automation.displayInformation = automationCreator.inProgressAutomations[user];
		delete automationCreator.inProgressAutomations[user];

		const authorizeURL = new URL(automation.oauth_authorize_url);
		authorizeURL.searchParams.set("state", automation.app_id);

		automationCreator.automations.push(automation);
		await respond("Next step: Install your app onto the workspace with this link: <" + authorizeURL + "|Install Your Automation>");
		saveState(automationCreator);
	} catch (e) {
		console.error(e);
		return await warn(teamId || enterpriseId, channel, user, "There was an error creating your automation... Make sure all your inputs are valid and try again!");
	}
});

app.action(/^ignore-.+$/, async ({ ack }) => await ack());

app.action("cancel", async ({ ack, respond }) => [await ack(), await respond({ delete_original: true })]);