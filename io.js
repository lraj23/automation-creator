import { Server } from "socket.io";
import server from "./server.js";
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
});