// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function(state, emit) {
  state.engine.initRecorder(state.defaultCode);
  console.log(state.sessionName);
  return html`
  <div>
  <div id="canvas-container">${state.engine.getCanvas()}</div>
  <div id="editors">
  ${state.engine.getRecorder()}
  </div>
  <div id="buttons">
    <button onclick="${upload}">upload</button>
  </div>
  </div>`;
  function upload(e) {
    // console.log(e.target.innerText)
    // state.engine.playback(true);
    const records = state.engine.getRecords();
    state.socket.emit("save session", {name: state.sessionName, records});
    
  }
};