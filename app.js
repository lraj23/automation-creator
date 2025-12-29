import app from "./client.js";
import { getAutomationCreator, saveState } from "./file.js";
import blocks from "./blocks.js";
const warn = async (channel, user, text) => await app.client.chat.postEphemeral({
	channel,
	user,
	blocks: blocks.warn(text),
	text
});
const readableValues = values => Object.fromEntries(Object.values(values).map(value => [Object.entries(value)[0][0], Object.entries(value)[0][1]]));

app.command("/create-automation", async ({ ack, body: { user_id }, respond }) => {
	await ack();
	const automationCreator = getAutomationCreator();
	if (!automationCreator.inProgressAutomations[user_id]) automationCreator.inProgressAutomations[user_id] = {
		automationName: "",
		automationShortDescription: "",
		automationLongDescription: "",
		automationColor: "",
		automationConfigurationToken: "",
		automationRefreshToken: ""
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
	values = readableValues(values);
	let configurationToken = "ignore-automation-configuration-token" in values ? values["ignore-automation-configuration-token"].value : automationCreator.inProgressAutomations[user].automationConfigurationToken;
	let refreshToken = "ignore-automation-configuration-refresh-token" in values ? values["ignore-automation-configuration-refresh-token"].value : automationCreator.inProgressAutomations[user].automationRefreshToken;

	automationCreator.inProgressAutomations[user] = {
		...automationCreator.inProgressAutomations[user],
		automationConfigurationToken: configurationToken,
		automationRefreshToken: refreshToken
	};
	saveState(automationCreator);
	await respond({
		text: "Create an automation",
		blocks: blocks.createAutomationStep1(automationCreator.inProgressAutomations[user])
	});
});

app.action("create-automation-step2", async ({ ack, body: { user: { id: user }, channel: { id: channel }, state: { values } }, respond }) => {
	await ack();
	const automationCreator = getAutomationCreator();
	values = readableValues(values);
	let name = "ignore-automation-name" in values ? values["ignore-automation-name"].value : automationCreator.inProgressAutomations[user].automationName;
	let shortDesc = "ignore-automation-short-description" in values ? values["ignore-automation-short-description"].value : automationCreator.inProgressAutomations[user].automationShortDescription;
	let longDesc = "ignore-automation-long-description" in values ? values["ignore-automation-long-description"].value : automationCreator.inProgressAutomations[user].automationLongDescription;
	let color = "ignore-automation-color" in values ? values["ignore-automation-color"].value : automationCreator.inProgressAutomations[user].automationColor;

	if (!automationCreator.inProgressAutomations[user]) return await respond("Something went wrong. Try running /create-automation again!");
	if (!name) return await warn(channel, user, "Enter an automation name!");
	if (name.length > 35) return await warn(channel, user, "Make sure the name is under 35 characters long!");
	if (shortDesc && shortDesc.length > 140) return await warn(channel, user, "Make sure the short description is under 140 characters long!");
	if (!longDesc) return await warn(channel, user, "Enter a long description!");
	if (longDesc.length < 175) return await warn(channel, user, "Make sure the long description is at least 175 characters long!");
	if (longDesc.length > 4000) return await warn(channel, user, "Make sure the long description is less than 4000 characters long!");
	if (color) {
		if (!parseInt(color, 16)) return await warn(channel, user, "Really? That's not a color.");
		if (parseInt(color, 16) < 0) return await warn(channel, user, "Really? That's not a color.");
		if (parseInt(color, 16) > 16777215) return await warn(channel, user, "Really? That's not a color.");
	}

	automationCreator.inProgressAutomations[user] = {
		...automationCreator.inProgressAutomations[user],
		automationName: name,
		automationShortDescription: shortDesc || "",
		automationLongDescription: longDesc,
		automationColor: color || "676767"
	};
	if (!automationCreator.inProgressAutomations[user].automationConfigurationToken) automationCreator.inProgressAutomations[user].automationConfigurationToken = "";
	if (!automationCreator.inProgressAutomations[user].automationRefreshToken) automationCreator.inProgressAutomations[user].automationRefreshToken = "";
	saveState(automationCreator);

	await respond({
		text: "Enter your configuration tokens!",
		blocks: blocks.createAutomationStep2(automationCreator.inProgressAutomations[user])
	});
});

app.action("create-automation", async ({ ack }) => await ack());

app.action(/^ignore-.+$/, async ({ ack }) => await ack());

app.action("cancel", async ({ ack, respond }) => [await ack(), await respond({ delete_original: true })]);