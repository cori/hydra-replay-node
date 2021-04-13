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
  const id = state.params.page;
  let playingMessage = `replaying...`;

  state.engine.initPlayer("");

  state.engine.onEnd(() => {
    emit("playbackEnd")
  });

  state.engine.onEval((success, e) => {
    emit("eval", { success, e });
  })

  if (remix) {
    emit("getSession", id);
  }
  else {
    if (state.sessionName === undefined) {
      // emit("replaceState", "/");
      window.location = "/"
    }
    // state.sessionName = session.name;
    setTimeout(() => {//BADBADBADBAD
      state.engine.setRecords(defaultCode.records);
      state.engine.play();

      emit("loadEditor");
    }, 100);
  }

  return html`
  <div>
  <div id="canvas-container">${state.engine.getCanvas()}</div>
  <div id="editors">
  ${state.engine.getEditor()}
  </div>
  <div id="buttons">
    <div id="upload-button" style="display:none">
      continue editing and <button onclick="${upload}">upload</button>
    </div>
    <div id="playing-message">
      ${playingMessage}
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
    const records = state.engine.getRecords();
    emit("upload", { records, startTime, name: state.sessionName })
  }
};