const selectWorkspace = document.getElementById("selectWorkspace");
const refreshToken = document.getElementById("refreshToken");
const createAutomationError = document.getElementById("createAutomationError");
const createAutomation = document.getElementById("createAutomation");

socket.emit("atHash", atHash, response => response ? document.getElementById("signedInWorkspace").innerText = response["https://slack.com/team_name"] || response["https://slack.com/enterprise_name"] || "?" : location.href = "/");

socket.emit("authedWorkspace", atHash, response => {
	if (response.name) {
		const selectWorkspaceLabel = document.getElementById("selectWorkspaceLabel");
		const selectWorkspaceContext = document.getElementById("selectWorkspaceContext");
		selectWorkspaceLabel.innerText = "Ensure you want to add your automation to this workspace:";
		selectWorkspace.outerHTML = "<a class=\"button-a\">" + response.name + "</a>";
		socket.emit("appId", appId => selectWorkspaceContext.innerHTML = "If this is the wrong workspace, <a href=\"https://slack.com/openid/connect/authorize?scope=openid profile&response_type=code&redirect_uri=https://unimpressed-unplastic-chelsey.ngrok-free.dev/automation-creator/automation-creator-bot/sign-in-with-slack&client_id=2210535565.10193337164310&state=" + appId + "\">sign in with Slack again</a> on the correct workspace.");
	}
});

createAutomation.onclick = () => selectWorkspace.href ? socket.emit("testWorkspaceMatch", atHash, refreshToken.value, response => response.ok ? location.href = "/create/2" : createAutomationError.innerText = response.error) : createAutomationError.innerText = "Make sure to add Automation Creater to your workspace first!";