const html = require("choo/html");

module.exports = function (state, emitter) {
  const mouse = { x: 0, y: 0 };

  let canvasElement = html`<canvas></canvas>`;
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;
  canvasElement.style.width = "100%";
  canvasElement.style.height = "100%";
  canvasElement.id = "mouse-canvas";
  state.mouse = {};
  state.mouse.canvasElement = canvasElement;
  let ctx = canvasElement.getContext('2d');

  let cursorImg = new Image();
  cursorImg.crossOrigin = "anonymous";
  cursorImg.onload = function () {
    // ctx.drawImage(cursorImg, 0, 0);
  }
  cursorImg.src = 'https://cdn.glitch.com/87742b90-e6be-4d23-97b2-ba7f62a3f685%2Fcursor.png?v=1616341814719';

  document.onmousemove = function (event) {
    var eventDoc, doc, body;

    event = event || window.event; // IE-ism

    // If pageX/Y aren't available and clientX/Y are,
    // calculate pageX/Y - logic taken from jQuery.
    // (This is to support old IE)
    if (event.pageX == null && event.clientX != null) {
      eventDoc = (event.target && event.target.ownerDocument) || document;
      doc = eventDoc.documentElement;
      body = eventDoc.body;

      event.pageX =
        event.clientX +
        ((doc && doc.scrollLeft) || (body && body.scrollLeft) || 0) -
        ((doc && doc.clientLeft) || (body && body.clientLeft) || 0);
      event.pageY =
        event.clientY +
        ((doc && doc.scrollTop) || (body && body.scrollTop) || 0) -
        ((doc && doc.clientTop) || (body && body.clientTop) || 0);
    }

    mouse.x = Math.max(0, Math.min(100000, event.pageX)) / window.innerWidth;
    mouse.y = Math.max(0, Math.min(100000, event.pageY)) / window.innerHeight;
    // Use event.pageX / event.pageY here

    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.drawImage(cursorImg, mouse.x * canvasElement.width, mouse.y * canvasElement.height);
  };

  // emitter.on("editor:setup", (id) => {
}
