// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function (state, emit) {
  state.startTime = +new Date;
  if (state.params.mode == "remix" || state.params.mode == "new") {
    // ok
  }
  else {
    window.location = "/";
  }
  const id = state.params.id;

  emit("initPlayer");

  if (state.editorSetup === undefined || state.editorSetup == false) {
    emit("setupEditor", id);
  }
  else {
    if(state.params.mode == "remix") {
      // wtf
      emit("setRecords", state.prevRecords);
      emit("play");
    }
    emit('DOMTitleChange', `${state.sessionName} - Hydra↺Replay`);
  }

  return html`
  <div>
  <div id="canvas-container">${state.engine.canvasElement}</div>
  <div id="editors">
  ${state.engine.editorElement}
  </div>
  <div id="buttons">
    <div id="upload-button" style="display:none">
      continue editing and <button onclick="${upload}">upload</button>
    </div>
    <div id="playing-message">
      ${state.playingMessage}
    </div>
  </div>
  <div id="backlink">
  <div id="back-message">
    <a onclick=${back}>back to top!</a>
  </div>
  </div>
  <div id="editor-console">
  <span id="editor-console-message"></span>
  </div>
  </div>`;
  function back() {
    emit("stop");
    emit("pushState", "/");
  }
  function upload(e) {
    emit("getRecords", (records) =>
      emit("upload", { records, startTime: state.startTime, name: state.sessionName })
    );
  }
};