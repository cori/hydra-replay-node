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
  let playingMessage;

  emit("initPlayer", "");

  emit("onEnd", () => {
    emit("playbackEnd")
  });

  emit("onEval", (success, e) => {
    emit("eval", { success, e });
  })

  if (remix) {
    playingMessage = "replaying...";
    emit("getSession", id, (data) => {
      const session = data;
      state.sessionName = session.name;
      emit("setRecords", session.records);
      emit("play");

      state.sessionName = "Re: " + state.sessionName;
      emit("loadEditor", playingMessage);

    });
  }
  else {
    playingMessage = "starting...";
    if (state.sessionName === undefined) {
      // emit("replaceState", "/");
      window.location = "/"
    }
    // state.sessionName = session.name;
    setTimeout(() => {//BADBADBADBAD
      emit("setRecords", defaultCode.records);
      emit("play");

      emit("loadEditor", playingMessage);
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
    emit("getRecords", (records) =>
      emit("upload", { records, startTime, name: state.sessionName })
    );
  }
};