import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const BASE_URL = process.env.HOST_URL || `http://${hostname}:${port}`;

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("hello", (data) => {
      console.log("Client sent:", data);
      socket.emit("helloResponse", "✅ chalo working hai");
    });

    // listen at connection scope to avoid race
    socket.on("responseapi", async (data) => {
      const response = await fetch(`${BASE_URL}/api/hello`, {
        method: "POST",
        body: JSON.stringify({ username: data.username }),
      });
      const apireponse = await response.json(); // { message: string }
      socket.emit("takereturn", apireponse);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
