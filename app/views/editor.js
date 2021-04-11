// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function (state, emit) {
  const editor = state.engine.getEditor();
  setTimeout(() => {
    state.engine.initRecorder(state.defaultCode); //NOOOO
  }, 1000);
  emit('DOMTitleChange', `${state.sessionName} - Hydra↺Replay`);
  console.log(state.sessionName);
  if (state.sessionName === undefined) {
    window.location = "/"; // meh
  }

  return html`
    <div>
      <div id="canvas-container">${state.engine.getCanvas()}</div>
      <div id="editors">
        ${editor}
      </div>
      <div id="buttons">
        <button onclick="${upload}">upload</button>
      </div>
    </div>
  `;
  function upload(e) {
    // console.log(e.target.innerText)
    // state.engine.playback(true);
    state.engine.endOfRecord();
    const records = state.engine.getRecords();
    if(JSON.parse(records).length > 3) {
      state.socket.emit("save session", { name: state.sessionName, records });
    }
    state.reloadSessions();
    window.location = "/";
  }
};
