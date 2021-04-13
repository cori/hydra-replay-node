// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function (state, emit) {
  const editor = state.engine.getEditor();
  const startTime = +new Date;
  emit('DOMTitleChange', `${state.sessionName} - Hydra↺Replay`);
  console.log(state.sessionName);
  if (state.sessionName === undefined) {
    // emit("replaceState", "/");
    window.location = "/"
  }

  state.engine.onEval((success, e) => {
    document.getElementById("editor-console-message").innerText = `${e !== undefined ? e : ""}`;
    if (!success) {
      document.getElementById("editor-console-message").className = "alert";
    }
    else {
      document.getElementById("editor-console-message").className = "";
    }
  })

  return html`
    <div>
      <div id="canvas-container">${state.engine.getCanvas()}</div>
      <div id="editors">
        ${editor}
      </div>
      <div id="buttons">
        <button onclick="${upload}">upload</button>
      </div>
      <div id="backlink">
      <div id="back-message">
        <a onclick=${back}>back to top!</a>
      </div>
      </div>
      <div id="editor-console">
      <span id="editor-console-message"></span>
      </div>
      </div>
  `;
  function back() {
    window.location = "/"
  }
  function upload(e) {
    // console.log(e.target.innerText)
    // state.engine.playback(true);
    const records = state.engine.getRecords();
    if (JSON.parse(records).length > 3) {
      state.socket.emit("save session", { name: state.sessionName, records, startTime });
    }
    emit("loadSessions");
    // emit("replaceState", "/");
    window.location = "/"
  }
};
