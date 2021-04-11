// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function(state, emit) {  
  return html`
  <div>
  <div id="canvas-container">${state.engine.getCanvas()}</div>
  <div id="editors">
  ${state.engine.getRecorder()}
  </div>
  <button onclick="${upload}">upload</button>
  </div>`;
  function upload(e) {
    // console.log(e.target.innerText)
    // state.engine.playback(true);
    const records = state.engine.getRecords();
    state.socket.emit("save session", records);
    
  }
};