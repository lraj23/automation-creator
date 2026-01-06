import { Server } from "socket.io";
import server from "./server.js";
import { app, apps } from "./client.js";
import { getAutomationCreator } from "./file.js";
const io = new Server(server);

io.on("connection", socket => {
	console.log("Socket connection established!");

	socket.on("authedWorkspaces", callback => {
		if (typeof callback !== "function") return;
		let automationCreator = getAutomationCreator();
		automationCreator.authedWorkspaces.push({
			team: {
				id: process.env.AUTOMATION_CREATOR_DEVELOPMENT_WORKSPACE_ID,
				name: process.env.AUTOMATION_CREATOR_DEVELOPMENT_WORKSPACE_NAME
			}
		});
		let authedWorkspaces = [];
		automationCreator.authedWorkspaces.forEach(workspace => {
			if (!workspace.team?.id) return;
			if (authedWorkspaces.find(ws => workspace.team.id === ws.id)) return;
			if (authedWorkspaces.find(ws => workspace.team.name === ws.name)) return authedWorkspaces.push({
				id: workspace.team.id,
				name: workspace.team.name
			});
			authedWorkspaces.push({
				id: workspace.team.id,
				name: workspace.team.name
			});
		});
		callback(authedWorkspaces);
	});

	socket.on("testWorkspaceMatch", async (workspace, refreshToken, callback) => {
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
});