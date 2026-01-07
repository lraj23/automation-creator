const selectWorkspace = document.getElementById("selectWorkspace");
const refreshToken = document.getElementById("refreshToken");
const createAutomationError = document.getElementById("createAutomationError");
const createAutomation = document.getElementById("createAutomation");

socket.emit("atHash", atHash, response => {
	if (!response) location.href = "/";
});

socket.emit("authedWorkspace", atHash, response => {
	if (response.name) {
		const option = document.createElement("option");
		option.value = response.id;
		option.innerText = response.name;
		selectWorkspace.appendChild(option);
		socket.emit("appId", appId => document.getElementById("selectWorkspaceContext").innerHTML = "If this is the wrong workspace, <a href=\"https://slack.com/openid/connect/authorize?scope=openid profile&response_type=code&redirect_uri=https://unimpressed-unplastic-chelsey.ngrok-free.dev/automation-creator/automation-creator-bot/sign-in-with-slack&client_id=2210535565.10193337164310&state=" + appId + "\">sign in with Slack again</a> on the correct workspace.");
	}
});

createAutomation.onclick = () => {
	if (selectWorkspace.value === "none") return createAutomationError.innerText = "Choose a workspace.";
	socket.emit("testWorkspaceMatch", selectWorkspace.value, refreshToken.value, response => {
		if (!response.ok) createAutomationError.innerText = response.error;
		else createAutomationError.innerText = "";
	});
};