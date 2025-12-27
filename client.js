import bolt from "@slack/bolt";

const startTime = Date.now();
const { AUTOMATION_CREATOR_BOT_TOKEN: token, AUTOMATION_CREATOR_SIGNING_SECRET: signingSecret, AUTOMATION_CREATOR_APP_TOKEN: appToken } = process.env;
const socketMode = (process.env.AUTOMATION_CREATOR_SOCKET_MODE === "true");
const app = new bolt.App({ token, signingSecret, socketMode, appToken });

console.log(socketMode ? "Starting in Socket Mode!" : "Starting in Request URL Mode!");
await app.start(process.env.AUTOMATION_CREATOR_PORT || 5040);
console.log("⚡ Started in " + (Date.now() - startTime) + " milliseconds.");

export default app;