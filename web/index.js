socket.emit("atHash", atHash, response => {
	if (response) {
		document.body.className = "signedIn";
		document.getElementById("signedInAs").innerText = response.name || "?";
		document.getElementById("signedInWorkspace").innerText = response["https://slack.com/team_name"] || response["https://slack.com/enterprise_name"] || "?";
	}
	else document.body.className = "notSignedIn";
});