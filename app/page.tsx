"use client";
import React, { useEffect } from "react";
import { io } from "socket.io-client";

const Page = () => {
  useEffect(() => {
    // same-origin connection
    const socket = io();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      // emit after connect to avoid race
      socket.emit("hello", "data ye hai bhai");
      socket.emit("responseapi", { username: "aditya" });
    });

    socket.on("helloResponse", (msg) => {
      console.log("Server bola:", msg);
    });

    // API returns { message }, not { username }
    socket.on("takereturn", (data: { message: string; username: string }) => {
      console.log("API says:", data.message, data.username);
    });

    return () => {
      socket.off("helloResponse");
      socket.off("takereturn");
      socket.disconnect();
    };
  }, []);

  return <div>Socket Test Page</div>;
};

export default Page;
