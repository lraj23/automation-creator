import http from "http";
import CONSTS from "./consts.js";
import app from "./client.js";
import { getAutomationCreator, saveState } from "./file.js";
import blocks from "./blocks.js";
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
	const fail400 = msg => {
		res.writeHead(400, { "Content-Type": "text/plain" });
		res.end(msg);
	};

	switch (fullURL.pathname.slice(deployURL.pathname.length)) {
		case "/installed": {
			const code = fullURL.searchParams.get("code");
			const automationCreator = getAutomationCreator();
			const automation = automationCreator.automations.find(automation => automation.app_id === fullURL.searchParams.get("state"));
			if (!code || !automation) {
				if (fullURL.searchParams.get("error") === "access_denied") return fail400("Please allow the OAuth for your automation to work.");
				return fail400("Something's wrong with this request. Try opening the link you got on Slack and authorizing from there. If this persists, contact the developer of Automation Creator on this workspace.");
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
				let scopeIsSame = true;
				if (tokens.scope.split(",").length !== CONSTS.AUTOMATION_CREATOR_SCOPES.length) scopeIsSame = false;
				else for (let i = 0; i < tokens.scope.length; i++)
					if (tokens.scope.split(",").sort()[i] !== CONSTS.AUTOMATION_CREATOR_SCOPES.sort()[i]) scopeIsSame = false;
				if (!scopeIsSame) {
					res.writeHead(301, {
						Location: automation.oauth_authorize_url + "&state=" + automation.app_id
					});
					return res.end();
				}
				const dmID = await app.client.conversations.open({
					token: tokens.access_token,
					users: tokens.authed_user.id
				});
				res.writeHead(301, {
					Location: "https://" + automation.team_domain + ".slack.com/archives/" + dmID.channel.id
				});
				res.end();
				automation.authorized = true;
				automation.tokens = tokens;
				saveState(automationCreator);
			} else fail400("There was an error (" + tokens.error + "). Try opening the authorization link again. If this keeps happening, contact the developer of Automation Creator on this workspace.");
			break;
		}
		case "/event-subscriptions": {
			let body = "";
			req.on("data", chunk => body += chunk.toString());
			req.on("end", async () => {
				try {
					body = JSON.parse(body);
				} catch (e) {
					return fail400("Invalid data.");
				}
				if (body.challenge && body.type === "url_verification") {
					res.writeHead(200, {
						"Content-Type": "text/plain"
					});
					return res.end(body.challenge);
				};
				const automationCreator = getAutomationCreator();
				const automation = automationCreator.automations.find(automation => automation.app_id === body.api_app_id);
				if (!automation) return fail400("There was an error. This automation does not seem to exist.");
				switch (body.event.type) {
					case "app_home_opened":
						await app.client.views.publish({
							token: automation.tokens.access_token,
							user_id: body.event.user,
							view: {
								type: "home",
								blocks: blocks[body.event.user === automation.tokens.authed_user.id ? "appHomePage" : "appHomePageOther"](automation)
							}
						});
						break;
				}
			});
			break;
		}
		case "/interactivity": {
			let body = "";
			req.on("data", chunk => body += chunk.toString());
			req.on("end", async () => {
				try {
					body = JSON.parse(decodeURIComponent(body).slice(8));
				} catch (e) {
					return fail400("Invalid data.");
				}
				const automationCreator = getAutomationCreator();
				const automation = automationCreator.automations.find(automation => automation.app_id === body.api_app_id);
				const values = CONSTS.GET_READABLE_VALUES(body.view.state.values);
				if (!automation) return fail400("There was an error. This automation does not seem to exist.");
				switch (body.actions[0].action_id) {
					case "edit-automation-trigger": {
						const trigger = "edit-automation-trigger" in values ? values["edit-automation-trigger"].selected_option?.value : automation.currentState.trigger.type;
						automation.currentState = {
							trigger: {
								type: trigger || null,
								detail: undefined
							},
							steps: []
						};
						saveState(automationCreator);
						await app.client.views.publish({
							token: automation.tokens.access_token,
							user_id: automation.tokens.authed_user.id,
							view: {
								type: "home",
								blocks: blocks.appHomePage(automation)
							}
						});
						break;
					}
					case "edit-automation-trigger-detail": {
						const detail = "edit-automation-trigger-detail" in values ? values["edit-automation-trigger-detail"].selected_conversation : automation.currentState.trigger.detail;
						break;
					}
					default:
				}
				res.writeHead(200, {
					"Content-Type": "text/plain"
				});
				res.end();
			});
			break;
		}
		default:
			res.writeHead(404, {
				"Content-Type": "text/plain"
			});
			res.end("404 Not Found");
	}
});

server.listen(5030, () => {
	console.log("Server running at " + deployURLString);
});