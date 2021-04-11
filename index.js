require("dotenv").config();

const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;

var Datastore = require("nedb"),
  db = new Datastore({ filename: "data.json", autoload: true });

server.listen(port, function() {
  console.log("Server listening at port %d", port);
});

app.use(express.static("public"));

const sessions = [];

db.find({}, function(err, entries) {
  for (const entry of entries) {
    sessions.push(entry);
  }
});

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
  socket.on("save session", function(data) {
    const session = {
      name: "testing",
      records: data
    };
    sessions.push(session);
    db.insert(session, function(err, added) {
      // Callback is optional
      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
    });
  });
});
