require("dotenv").config();

const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;

server.listen(port, function() {
  console.log("Server listening at port %d", port);
});

app.use(express.static("public"));

const sessions = [{name: "first session"}];

io.on("connection", function(socket) {
  socket.on("get sessions", function(data) {
    // socket.emit("image array size", { imageArraySize });
    // const iBegin = Math.max(sessions.length, 0);
    // for (let i = iBegin; i < sessions.length; i++) {
    //   if (sessions[i] != undefined) {
    //   }
    // }
        socket.emit("sessions", sessions);
  });
});