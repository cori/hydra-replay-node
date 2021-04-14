const html = require("choo/html");

module.exports = function (state, emitter) {
  const cursor = { x: 0, y: 0 };

  let canvasElement = html`<canvas></canvas>`;
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;
  canvasElement.style.width = "100%";
  canvasElement.style.height = "100%";
  canvasElement.id = "mouse-canvas";
  state.mouse = { cursor, canvasElement };

  let ctx = canvasElement.getContext('2d');

  let cursorImg = new Image();
  cursorImg.crossOrigin = "anonymous";
  cursorImg.onload = function () { };
  cursorImg.src = 'https://cdn.glitch.com/87742b90-e6be-4d23-97b2-ba7f62a3f685%2Fcursor.png?v=1616341814719';

  document.onmousemove = function (event) {
    if (playbackHandler === undefined) {
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

      cursor.x = Math.max(0, Math.min(100000, event.pageX)) / window.innerWidth;
      cursor.y = Math.max(0, Math.min(100000, event.pageY)) / window.innerHeight;
      window.mouseX = cursor.x; // !!!
      window.mouseY = cursor.y; // !!!
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      ctx.drawImage(cursorImg, cursor.x * canvasElement.width, cursor.y * canvasElement.height);
    }
  };

  let loopingRecorder = false;
  let playbackHandler;
  let records;
  let onend;
  let logFps = 10;
  emitter.on("mouse:startRecord", (id) => {
    loopingRecorder = true;
    records = [];
    let startedAt = Date.now() / 1000;
    let tCurrentChunk = startedAt;
    let frameCount = 0;
    let sendInterval = 10; // sec
    let sendEvery = logFps * sendInterval;
    let frames = [];
    let isChanged = false;
    let lastXY = { x: -1, y: -1 }

    function record() {
      let x = cursor.x;
      let y = cursor.y;
      frames.push([x, y]);
      if (lastXY.x != x || lastXY.y != y) {
        isChanged = true;
        lastXY = { x, y };
      }
      frameCount++;
      if (frameCount >= sendEvery || loopingRecorder == false) {
        let fps = logFps;
        if (isChanged == false) {
          frames = [x, y];
          fps = 1 / sendInterval;
        }

        const record = { t: tCurrentChunk - startedAt, fps, values: frames }
        console.log(record);
        records.push(record);
        tCurrentChunk = Date.now() / 1000;
        frames = [];
        frameCount = 0;
        isChanged = false;
      }
      if (loopingRecorder) {
        setTimeout(record, 1000 / logFps)
      }
      else {
        onend(records);
      }
    }
    record();

    let curBlock = 0;

    const speed = state.speed;
    const prevRecords = state.mouse.prevRecords;
    if (prevRecords !== undefined) {
      playbackHandler = setInterval(() => {
        emitter.emit("engine:updateCurrentTime");
        const t = state.engine.time / 1000;
        let i = 0;
        if (fps < 1) {
          // ???? 
        }
        else {
          i = Math.floor((t - prevRecords[curBlock].t) * prevRecords[curBlock].fps);
          i = Math.max(i, 0);
        }

        let curBlockIncr = 0;
        if (i >= prevRecords[curBlock].values.length) {
          if (curBlock + 1 < prevRecords.length) {
            i = prevRecords[curBlock].values.length - 1;
            curBlockIncr = 1;
          } else {
            // done
            clearInterval(playbackHandler);
            playbackHandler = undefined;
            console.log("mouse done")
            return;
          }
        }
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        ctx.drawImage(cursorImg, cursor.x * canvasElement.width, cursor.y * canvasElement.height);
        cursor.x = prevRecords[curBlock].values[i][0];
        cursor.y = prevRecords[curBlock].values[i][1];
        window.mouseX = cursor.x; // !!!
        window.mouseY = cursor.y; // !!!
        curBlock += curBlockIncr;
      }, 1000 / logFps / speed);
    }
  });
  emitter.on("mouse:stopPlay", () => {
    if (playbackHandler !== undefined) {
      clearInterval(playbackHandler);
      playbackHandler = undefined;
    }
  });
  emitter.on("mouse:stopRecord", (func) => {
    if (loopingRecorder) {
      onend = func;
      state.mouse.records = records;
      loopingRecorder = false;
    }
  });
}
