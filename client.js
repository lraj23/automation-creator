import bolt from "@slack/bolt";
import { getAutomationCreator } from "./file.js";

const startTime = Date.now();
const { AUTOMATION_CREATOR_BOT_TOKEN: token, AUTOMATION_CREATOR_SIGNING_SECRET: signingSecret, AUTOMATION_CREATOR_APP_TOKEN: appToken, AUTOMATION_CREATOR_DEVELOPMENT_WORKSPACE_ID: devWorkspaceId } = process.env;
const socketMode = (process.env.AUTOMATION_CREATOR_SOCKET_MODE === "true");
const app = new bolt.App({ token, signingSecret, socketMode, appToken });
const apps = {};
apps.getApp = id => {
	if (id === devWorkspaceId) return app;
	if (apps[id]) return apps[id];
	apps[id] = new bolt.App({
		token: getAutomationCreator().authedWorkspaces.find(workspace => (id === workspace.team?.id || id === workspace.enterprise?.id)).access_token,
		signingSecret,
		socketMode,
		appToken
	});
	return apps[id];
};

console.log(socketMode ? "Starting in Socket Mode!" : "Starting in Request URL Mode!");
await app.start(process.env.AUTOMATION_CREATOR_PORT || 5040);
console.log("⚡ Started in " + (Date.now() - startTime) + " milliseconds.");

export {
	app,
	apps
};