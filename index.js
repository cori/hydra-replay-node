require("dotenv").config();

const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;

var Datastore = require("nedb"),
  db = new Datastore({ filename: "data.json", autoload: true });

server.listen(port, function () {
  console.log("Server listening at port %d", port);
});

app.use(express.static("public"));

app.get('/api/get/session/:id', (req, res) => {
  db.findOne({ _id: req.params.id }, function (err, session) {
    const data = {};
    data.startTime = session.startTime;
    data.name = session.name;
    data.records = session.records;
    res.send(JSON.stringify(data));
  });
})

app.get('/api/get/list', (req, res) => {
  db.find({}).sort({ startTime: -1 }).limit(5).exec(function (err, sessions) {
    res.send(JSON.stringify(sessions));
  });
})

io.on("connection", function (socket) {
  socket.on("save session", function (data) {
    db.insert(data, function (err, added) {
    });
  });
});
