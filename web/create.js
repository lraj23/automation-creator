const socket = io();
const selectWorkspace = document.getElementById("selectWorkspace");
console.log(selectWorkspace);

socket.emit("authedWorkspaces", response => {
	console.log(response);
	response.forEach(workspace => {
		const option = document.createElement("option");
		option.value = workspace.id;
		option.innerText = workspace.name;
		selectWorkspace.appendChild(option);
	});
});

selectWorkspace.onchange = () => {
	console.log(selectWorkspace.value);
};