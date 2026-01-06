const socket = io();
const selectWorkspace = document.getElementById("selectWorkspace");
const refreshToken = document.getElementById("refreshToken");
const createAutomationError = document.getElementById("createAutomationError");
const createAutomation = document.getElementById("createAutomation");

socket.emit("authedWorkspaces", response => {
	response.forEach(workspace => {
		const option = document.createElement("option");
		option.value = workspace.id;
		option.innerText = workspace.name;
		selectWorkspace.appendChild(option);
	});
});

createAutomation.onclick = () => {
	if (selectWorkspace.value === "none") return createAutomationError.innerText = "Choose a workspace.";
	socket.emit("testWorkspaceMatch", selectWorkspace.value, refreshToken.value, response => {
		if (!response.ok) createAutomationError.innerText = response.error;
		else createAutomationError.innerText = "";
	});
}