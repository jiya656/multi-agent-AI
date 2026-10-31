import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD ? undefined : "http://localhost:5000");

// The server rejects sockets without a valid JWT, so we don't connect at
// import time (nobody is logged in yet). A component connects when it needs
// live updates. `auth` is a function so a reconnect picks up the current token.
const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (cb) => cb({ token: localStorage.getItem("token") }),
});

export default socket;