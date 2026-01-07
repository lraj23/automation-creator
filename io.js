import { Server } from "socket.io";
import server from "./server.js";
import { apps } from "./client.js";
import { getAutomationCreator, saveState } from "./file.js";
const io = new Server(server);

io.on("connection", socket => {
	console.log("Socket connection established!");

	socket.on("authedWorkspace", (atHash, callback) => {
		if (typeof callback !== "function") return;
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

	socket.on("testWorkspaceMatch", async (workspace, refreshToken, callback) => {
		if (typeof callback !== "function") return;
		let token;
		try {
			token = await apps.getApp(workspace).client.tooling.tokens.rotate({
				refresh_token: refreshToken
			});
		} catch (e) {
			console.error(e);
			return callback({
				ok: false,
				error: "There was an error with your refresh token. Make sure it is active, recent, and begins with \"xoxe-\""
			});
		}
		if (token.team_id !== workspace) return callback({
			ok: false,
			error: "This refresh token does not match the workspace provided above. Please make sure you select the right workspace."
		});
		callback({ ok: true });
	});

	socket.on("atHash", (atHash, callback) => {
		if (typeof callback !== "function") return;
		const automationCreator = getAutomationCreator();
		const authedUsers = automationCreator.authedUsers.filter(user => user.at_hash === atHash);
		if (authedUsers.length > 1) automationCreator.authedUsers = [
			...automationCreator.authedUsers.filter(user => user.at_hash !== atHash),
			automationCreator.authedUsers.filter(user => user.at_hash === atHash).slice(-1)[0]
		];
		saveState(automationCreator);
		callback(automationCreator.authedUsers.find(user => user.at_hash === atHash));
	});

	socket.on("appId", callback => callback(process.env.AUTOMATION_CREATOR_APP_ID));
});