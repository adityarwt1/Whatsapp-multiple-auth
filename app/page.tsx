"use client";
import React, { useEffect } from "react";
import { io } from "socket.io-client";

const Page = () => {
  useEffect(() => {
    // Create socket only on the client
    const socket = io("http://localhost:3000", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("helloResponse", (msg) => {
      console.log("Server bola:", msg);
    });

    socket.emit("hello", "data ye hai bhai");

    return () => {
      socket.off("helloResponse");
      socket.disconnect();
    };
  }, []);

  return <div>Socket Test Page</div>;
};

export default Page;
