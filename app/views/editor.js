// import choo's template helper
const html = require("choo/html");

const defaultCode = require("../default-code.js");

// export module
module.exports = function (state, emit) {
  const startTime = +new Date;
  if (state.params.mode == "remix" || state.params.mode == "new") {
    // ok
  }
  else {
    // not ok
  }
  const remix = state.params.mode == "remix";
  const id = state.params.id;

  emit("initPlayer");

  if (remix) {
    state.playingMessage = "replaying...";
    emit("getSession", id, (data) => {
      const session = data;
      state.sessionName = session.name;
      emit("setRecords", session.records);
      emit("play");

      state.sessionName = "Re: " + state.sessionName;

      emit('DOMTitleChange', `${state.sessionName} - Hydra↺Replay`);
      state.playingMessage = `${state.playingMessage} ${state.sessionName}`;
    });
  }
  else {
    state.playingMessage = "starting...";
    if (state.sessionName === undefined) {
      // emit("replaceState", "/");
      window.location = "/"
    }
    // state.sessionName = session.name;
    setTimeout(() => {//BADBADBADBAD
      emit("setRecords", defaultCode.records);
      emit("play");

      emit('DOMTitleChange', `${state.sessionName} - Hydra↺Replay`);
      state.playingMessage = `${state.playingMessage} ${state.sessionName}`;
    }, 100);
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
    window.location = "/"
  }
  function upload(e) {
    emit("getRecords", (records) =>
      emit("upload", { records, startTime, name: state.sessionName })
    );
  }
};