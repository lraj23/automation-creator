const selectWorkspace = document.getElementById("selectWorkspace");
const createAutomation = document.getElementById("createAutomation");
const createAutomationError = document.getElementById("createAutomationError");

socket.emit("atHash", atHash, response => {
	if (!response) location.href = "/";
	if (!response.configuration) location.href = "/";
	else createAutomation.onclick = () => socket.emit("createAutomation", atHash, { automationName: document.getElementById("automationName").value, automationShortDescription: document.getElementById("automationShortDescription").value, automationLongDescription: document.getElementById("automationLongDescription").value, automationColor: document.getElementById("automationColor").value }, response => response.ok ? location.href = response.authorizeURL : createAutomationError.innerHTML = response.error);
});

createAutomation.onclick = () => createAutomationError.innerText = "Please wait for a few seconds and try again.";