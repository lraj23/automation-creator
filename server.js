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
	const publishView = async (token, user_id, blocks) => await app.client.views.publish({ token, user_id, view: { type: "home", blocks } });

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
				console.error(e.data.error);
				return fail400("There was an error (" + e.data.error + "). Try opening the authorization link again. If this keeps happening, contact the developer of Automation Creator on this workspace.");
			}
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
				if (!automation.editingState) automation.editingState = {
					trigger: {
						type: null
					},
					steps: []
				};
				saveState(automationCreator);
				switch (body.event.type) {
					case "app_home_opened":
						await publishView(automation.tokens.access_token, body.event.user, blocks[body.event.user === automation.tokens.authed_user.id ? "appHomePage" : "appHomePageOther"](automation));
						break;
					case "reaction_added":
						if (!automation.activeState) break;
						if (automation.activeState.trigger.type !== "addedReaction") break;
						if (automation.activeState.trigger.detail !== body.event.item.channel) break;
						if (automation.activeState.trigger.specific !== body.event.reaction) break;
						switch (automation.activeState.steps[0].type) {
							case "sendMessage":
								try {
									await app.client.chat.postMessage({
										token: automation.tokens.access_token,
										channel: automation.activeState.steps[0].detail,
										text: automation.activeState.steps[0].specific
									});
								} catch (e) {
									console.error(e.data.error);
								}
								break;
							case "addReaction":
								try {
									await app.client.reactions.add({
										token: automation.tokens.access_token,
										channel: automation.activeState.trigger.detail,
										name: automation.activeState.steps[0].specific,
										timestamp: body.event.item.ts
									});
								} catch (e) {
									console.error(e.data.error);
								}
								break;
						}
						break;
					case "member_joined_channel":
						if (!automation.activeState) break;
						if (automation.activeState.trigger.type !== "joinedChannel") break;
						if (automation.activeState.trigger.detail !== body.event.channel) break;
						switch (automation.activeState.steps[0].type) {
							case "sendMessage":
								try {
									await app.client.chat.postMessage({
										token: automation.tokens.access_token,
										channel: automation.activeState.steps[0].detail,
										text: automation.activeState.steps[0].specific
									});
								} catch (e) {
									console.error(e.data.error);
								}
								break;
						}
						break;
					default:
						break;
				}
				res.writeHead(200, {
					"Content-Type": "text/plain"
				});
				res.end();
			});
			break;
		}
		case "/interactivity": {
			let body = "";
			req.on("data", chunk => body += chunk.toString());
			req.on("end", async () => {
				try {
					body = JSON.parse(decodeURIComponent(body.split("+").join(" ")).slice(8));
				} catch (e) {
					return fail400("Invalid data.");
				}
				const automationCreator = getAutomationCreator();
				const automation = automationCreator.automations.find(automation => automation.app_id === body.api_app_id);
				const values = CONSTS.GET_READABLE_VALUES(body.view.state.values);
				if (!automation) return fail400("There was an error. This automation does not seem to exist.");
				switch (body.actions[0].action_id) {
					case "edit-automation-trigger": {
						const trigger = "edit-automation-trigger" in values ? values["edit-automation-trigger"].selected_option?.value : automation.editingState.trigger.type;
						automation.editingState = {
							trigger: {
								type: trigger || null
							},
							steps: []
						};
						break;
					}
					case "edit-automation-trigger-detail": {
						const detail = "edit-automation-trigger-detail" in values ? values["edit-automation-trigger-detail"].selected_conversation : automation.editingState.trigger.detail;
						let channel;
						try {
							channel = (await app.client.conversations.info({ token: automation.tokens.access_token, channel: detail })).channel.id;
						} catch (e) {
							channel = "Unavailable";
						}
						automation.editingState = {
							trigger: {
								type: automation.editingState.trigger.type,
								detail: channel
							},
							steps: []
						};
						break;
					}
					case "edit-automation-trigger-specific": {
						const specific = "edit-automation-trigger-specific" in values ? values["edit-automation-trigger-specific"].value : automation.editingState.trigger.specific;
						automation.editingState = {
							trigger: {
								type: automation.editingState.trigger.type,
								detail: automation.editingState.trigger.detail,
								specific
							},
							steps: []
						};
						break;
					}
					case "edit-automation-step": {
						const step = "edit-automation-step" in values ? values["edit-automation-step"].selected_option?.value : automation.editingState.steps[0].type;
						automation.editingState = {
							trigger: automation.editingState.trigger,
							steps: [
								{
									type: step || null
								}
							]
						};
						break;
					}
					case "edit-automation-step-detail": {
						const detail = "edit-automation-step-detail" in values ? values["edit-automation-step-detail"].selected_conversation : automation.editingState.steps[0].detail;
						let channel;
						try {
							channel = (await app.client.conversations.info({ token: automation.tokens.access_token, channel: detail })).channel.id;
						} catch (e) {
							channel = "Unavailable";
						}
						automation.editingState = {
							trigger: automation.editingState.trigger,
							steps: [
								{
									type: automation.editingState.steps[0].type,
									detail: channel
								}
							]
						};
						break;
					}
					case "edit-automation-step-specific": {
						const specific = "edit-automation-step-specific" in values ? values["edit-automation-step-specific"].value : automation.editingState.steps[0].specific;
						automation.editingState = {
							trigger: automation.editingState.trigger,
							steps: [
								{
									type: automation.editingState.steps[0].type,
									detail: automation.editingState.steps[0].detail,
									specific: specific || null
								}
							]
						};
						break;
					}
					case "save-automation": {
						const triggerType = "edit-automation-trigger" in values ? values["edit-automation-trigger"].selected_option?.value : automation.editingState.trigger.type;
						const triggerDetail = "edit-automation-trigger-detail" in values ? values["edit-automation-trigger-detail"].selected_conversation : automation.editingState.trigger.detail;
						const triggerSpecific = "edit-automation-trigger-specific" in values ? values["edit-automation-trigger-specific"].value : automation.editingState.trigger.specific;
						const stepType = "edit-automation-step" in values ? values["edit-automation-step"].selected_option?.value : automation.editingState.steps[0].type;
						const stepDetail = "edit-automation-step-detail" in values ? values["edit-automation-step-detail"].selected_conversation : automation.editingState.steps[0].detail;
						const stepSpecific = "edit-automation-step-specific" in values ? values["edit-automation-step-specific"].value : automation.editingState.steps[0].specific;
						automation.activeState = {
							trigger: {
								type: triggerType,
								detail: triggerDetail || undefined,
								specific: triggerSpecific || undefined
							},
							steps: [
								{
									type: stepType,
									detail: stepDetail || undefined,
									specific: stepSpecific || undefined
								}
							]
						};
					}
					default:
						break;
				}
				saveState(automationCreator);
				await publishView(automation.tokens.access_token, automation.tokens.authed_user.id, blocks.appHomePage(automation));
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