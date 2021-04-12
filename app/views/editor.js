// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function (state, emit) {
  const editor = state.engine.getEditor();
  const startTime = +new Date;
  emit('DOMTitleChange', `${state.sessionName} - Hydra↺Replay`);
  console.log(state.sessionName);
  if (state.sessionName === undefined) {
    emit("replaceState", "/");
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
    const records = state.engine.getRecords();
    if(JSON.parse(records).length > 3) {
      state.socket.emit("save session", { name: state.sessionName, records, startTime });
    }
    emit("loadSessions");
    emit("replaceState", "/");
  }
};
