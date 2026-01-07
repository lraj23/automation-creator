const socket = io();
if ((new URL(document.URL)).searchParams.get("token")) {
	const url = new URL(document.URL);
	const atHash = url.searchParams.get("token");
	socket.emit("atHash", atHash, response => {
		document.cookie = "token=" + response.at_hash + "; expires=" + new Date(response.auth_time * 1000 + 604800000);
		location.href = url.origin + url.pathname;
	});
}

const atHash = document.cookie.split("; ").find(cookie => cookie.startsWith("token=")).slice(6);
socket.emit("appId", appId => [...document.querySelectorAll(".addToSlack"), ...document.querySelectorAll(".signInWithSlack")].forEach(button => button.href += appId));