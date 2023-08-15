import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
// import { chats } from "./data/data.js";
import router from "./routes/index.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import { Server } from "socket.io";
import path from "path";

dotenv.config();
connectDB();
const app = express();

app.use(express.json());

app.use("/api", router);

// const __dirname = path.resolve();
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "/frontend/build")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
//   });
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running...");
//   });
// }

app.use(errorMiddleware.notFound);
app.use(errorMiddleware.errorHandler);

app.get("/api/chats/:id", (req, res) => {
  const chat = chats.find((chat) => chat._id === req.params.id);
  res.json(chat);
});

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = new Server(server, {
  pageTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join room", (room) => socket.join(room));
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessage) => {
    var chat = newMessage.chat;

    if (!chat.users) return console.log("Chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessage.sender._id) return;
      socket.in(user._id).emit("message received", newMessage);
    });
  });

  socket.off("disconnect", () => {
    console.log("a user disconnected");
    socket.leave(userData._id);
  });
});
