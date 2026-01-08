import { Server } from "socket.io";
import server from "./server.js";
import { apps } from "./client.js";
import CONSTS from "./consts.js";
import { getAutomationCreator, saveState } from "./file.js";
const io = new Server(server);

io.on("connection", socket => {
	console.log("Socket connection established!");

	socket.on("authedWorkspace", (atHash, callback) => {
		if (typeof atHash !== "string" || typeof callback !== "function") return;
		const automationCreator = getAutomationCreator();
		automationCreator.authedWorkspaces.push({
			team: {
				id: process.env.AUTOMATION_CREATOR_DEVELOPMENT_WORKSPACE_ID,
				name: process.env.AUTOMATION_CREATOR_DEVELOPMENT_WORKSPACE_NAME
			}
		});
		const condition = workspace => (workspace.team?.id && workspace.team?.id === (automationCreator.authedUsers.find(user => user.at_hash === atHash) || {})["https://slack.com/team_id"]);
		const authedWorkspaces = automationCreator.authedWorkspaces.filter(workspace => condition(workspace));
		if (authedWorkspaces.length > 1) automationCreator.authedWorkspaces = [
			...automationCreator.authedWorkspaces.filter(workspace => !condition(workspace)),
			automationCreator.authedWorkspaces.filter(workspace => condition(workspace)).slice(-1)[0]
		];
		const authedWorkspace = automationCreator.authedWorkspaces.find(workspace => condition(workspace)) || {};
		callback({
			id: authedWorkspace.team?.id,
			name: authedWorkspace.team?.name
		});
		automationCreator.authedWorkspaces = automationCreator.authedWorkspaces.filter(workspace => workspace.ok);
		saveState(automationCreator);
	});

	socket.on("testWorkspaceMatch", async (atHash, refreshToken, callback) => {
		if (typeof atHash !== "string" || typeof refreshToken !== "string" || typeof callback !== "function") return;
		const automationCreator = getAutomationCreator();
		let token;
		try {
			token = await apps.getApp((automationCreator.authedUsers.find(user => user.at_hash === atHash) || {})["https://slack.com/team_id"]).client.tooling.tokens.rotate({
				refresh_token: refreshToken
			});
		} catch (e) {
			console.error(e);
			return callback({
				ok: false,
				error: "There was an error with your refresh token. Make sure it is active, recent, and begins with \"xoxe-\""
			});
		}
		if (token.team_id !== (automationCreator.authedUsers.find(user => user.at_hash === atHash) || {})["https://slack.com/team_id"]) return callback({
			ok: false,
			error: "This refresh token does not match the workspace provided above. Please make sure you select the right workspace."
		});
		automationCreator.authedUsers.find(user => user.at_hash === atHash).configuration = token;
		saveState(automationCreator);
		callback({ ok: true });
	});

	socket.on("atHash", (atHash, callback) => {
		if (typeof atHash !== "string" || typeof callback !== "function") return;
		const automationCreator = getAutomationCreator();
		const authedUsers = automationCreator.authedUsers.filter(user => user.at_hash === atHash);
		if (authedUsers.length > 1) automationCreator.authedUsers = [
			...automationCreator.authedUsers.filter(user => user.at_hash !== atHash),
			automationCreator.authedUsers.filter(user => user.at_hash === atHash).slice(-1)[0]
		];
		saveState(automationCreator);
		callback(automationCreator.authedUsers.find(user => user.at_hash === atHash));
	});

	socket.on("appId", callback => typeof callback !== "function" || callback(process.env.AUTOMATION_CREATOR_APP_ID));

	socket.on("createAutomation", async (atHash, displayInformation, callback) => {
		if (typeof atHash !== "string" || typeof displayInformation !== "object" || typeof callback !== "function") return;
		const automationCreator = getAutomationCreator();
		const user = automationCreator.authedUsers.find(user => user.at_hash === atHash);
		if (!user) callback({ ok: false, error: "Something went wrong. Try signing in again, then trying again." });
		if (!user.configuration) callback({ ok: false, error: "Something went wrong. <a href=\"../create\">Return to the create page</a> and try again." });
		const app = apps.getApp(user["https://slack.com/team_id"] || user["https://slack.com/enterprise_id"]);
		const apiURL = process.env.AUTOMATION_CREATOR_API_URL;
		const refreshToken = user.configuration.refresh_token;

		let token;
		try {
			token = (await app.client.tooling.tokens.rotate({
				refresh_token: refreshToken
			})).token;
		} catch (e) {
			console.error(e.data.error);
			return callback({ ok: false, error: "There was an error with your refresh token. <a href=\"../create\">Return to the create page</a> and try again." });
		}

		try {
			const automation = await app.client.apps.manifest.create(CONSTS.GENERATE_MANIFEST(displayInformation, token));
			automation.displayInformation = displayInformation;
			delete user.configuration;

			const authorizeURL = new URL(automation.oauth_authorize_url);
			authorizeURL.searchParams.set("state", automation.app_id);

			automationCreator.automations.push(automation);
			saveState(automationCreator);
			callback({ ok: true, authorizeURL });
		} catch (e) {
			console.error(e, e.data?.error);
			return callback({ ok: false, error: "Your automation could not be created; make sure all inputs have valid values and fit the requirements." });
		}
	});
});