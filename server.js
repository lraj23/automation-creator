import http from "http";
import app from "./client.js";
import { getAutomationCreator, saveState } from "./file.js";
const deployURLString = process.env.AUTOMATION_CREATOR_DEPLOY_URL;
const deployURL = new URL(deployURLString);

const server = http.createServer(async (req, res) => {
	if (!req.url.startsWith(deployURL.pathname)) {
		res.writeHead(404, {
			"Content-Type": "text/plain"
		});
		return res.end("404 Not Found");
	}
	const url = req.url.slice(deployURL.pathname.length);
	const fullURL = new URL(deployURLString + url);

	switch (fullURL.pathname.slice(deployURL.pathname.length)) {
		case "/installed":
			const code = fullURL.searchParams.get("code");
			const automationCreator = getAutomationCreator();
			const automation = automationCreator.automations.find(automation => automation.app_id === fullURL.searchParams.get("state"));
			if (!code || !automation) {
				res.writeHead(400, {
					"Content-Type": "text/plain"
				});
				return res.end("Something's wrong with this request. Try opening the link you got on Slack and authorizing from there. If this persists, contact the developer of Automation Creator on this workspace.");
			}
			let tokens = { ok: false };
			try {
				tokens = await app.client.oauth.v2.access({
					code,
					client_id: automation.credentials.client_id,
					client_secret: automation.credentials.client_secret
				});
			} catch (e) {
				tokens.error = e.data.error;
				console.error(e);
			}
			if (tokens.ok) {
				const dmID = await app.client.conversations.open({
					token: tokens.access_token,
					users: tokens.authed_user.id
				});
				res.writeHead(301, {
					Location: "https://" + automation.team_domain + ".slack.com/archives/" + dmID.channel.id
				});
				res.end();
				automation.authorized = true;
				saveState(automationCreator);
			} else {
				res.writeHead(400, {
					"Content-Type": "text/plain"
				});
				res.end("There was an error (" + tokens.error + "). Try opening the authorization link again. If these keeps happening, contact the developer of Automation Creator on this workspace.");
			}
			break;
		default:
			res.writeHead(404, {
				"Content-Type": "text/plain"
			});
			res.end(JSON.stringify({
				text: "404 Not Found"
			}));
	}
});

server.listen(5030, () => {
	console.log("Server running at " + deployURLString);
});