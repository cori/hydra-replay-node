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

sessions.sort((a,b)=>{
  if(b.startTime === undefined) return -1;
  if(a.startTime === undefined) return 1;
  return a.startTime>b.startTime ? 1 : (a.startTime<b.startTime ? -1 : 0)
});

io.on("connection", function(socket) {
  socket.on("get sessions", function(data) {
    const shortSessions = [];
    const iBegin = sessions.length - Math.min(sessions.length, 10);
    for (let i = sessions.length - 1; i >= iBegin; i--) {
      shortSessions.push(sessions[i]);
    }
    socket.emit("sessions", shortSessions);
  });
  socket.on("save session", function(data) {
    sessions.push(data);
    db.insert(data, function(err, added) {
      // Callback is optional
      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
    });
  });
});
