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


// io.on("connection", function(socket) {
//   socket.on("get images", function(data) {
//     socket.emit("image array size", { imageArraySize });
//     const iBegin = Math.max(imageHistory.length - imageArraySize, 0);
//     for (let i = iBegin; i < imageHistory.length; i++) {
//       if (imageHistory[i] != undefined) {
//         socket.emit("new image", imageHistory[i]);
//       }
//     }
//   });
// });