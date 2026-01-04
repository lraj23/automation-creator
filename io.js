import { Server } from "socket.io";
import server from "./server.js";
const io = new Server(server);

io.on("connection", socket => {
	console.log("Socket connection established!");
});