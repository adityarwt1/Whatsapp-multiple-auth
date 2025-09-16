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

  // Setup socket.io with CORS
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // allow all for dev
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("hello", (data) => {
      console.log("Client sent:", data);
      // Respond after receiving the event to avoid race conditions
      socket.emit("helloResponse", "✅ chalo working hai");
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
