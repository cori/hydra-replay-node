const html = require("choo/html");
const defaultCode = require("./default-code.js");

module.exports = function (state, emitter) {
  emitter.on("render", () => {
  });

  emitter.on("navigate", () => {
    console.log(state.params);
    const isWelcome = state.params.mode === undefined;
    const isEditor = state.params.mode == "remix" || state.params.mode == "new";
    if (isWelcome || isEditor) {
      // ok
    }
    else {
      emitter.emit("pushState", "/");
      return;
    }

    if (isWelcome) {
      // top page
      state.editorSetup = false;
      emitter.emit("loadSessions");
    }
    else if (isEditor) {
      // editor
      state.startTime = +new Date;
      const id = state.params.id;

      emitter.emit("initPlayer");
      emitter.emit("initRecorder");

      emitter.emit("setupEditor", id);
    }
  });

  emitter.on("setupEditor", (id) => {
    state.uploadButton = undefined;
    const remix = id !== undefined;
    if (remix) {
      state.playingMessage = html`<div id="playing-message">replaying...</div>`;
      emitter.emit("getSession", id, (data) => {
        const session = data;
        state.sessionName = session.name;

        state.playingMessage = html`<div id="playing-message">replaying... ${state.sessionName}</div>`;
        state.editorSetup = true;
        state.prevRecords = session.records;
        emitter.emit("setRecords", state.prevRecords);
        emitter.emit("play");
        emitter.emit("render");
      });
    }
    else {
      state.playingMessage = html`<div id="playing-message">starting...</div>`;
      if (state.sessionName === undefined) {
        emitter.emit("pushState", "/");
      }
      state.playingMessage = html`<div id="playing-message">starting... ${state.sessionName}</div>`;
      state.editorSetup = true;
      state.prevRecords = defaultCode.records;

      //wtf
      emitter.emit("setRecords", state.prevRecords);
      emitter.emit("play");
      emitter.emit("render");
    }
  });

  emitter.on("playbackEnd", () => {
    if (state.params.mode == "remix") {
      state.sessionName = "Re: " + state.sessionName;
    }
    console.log("finished")
    state.playingMessage = "";
    emitter.emit("switchToRecorder");
    state.uploadButton = function (upload) {
      return html`<div id="upload-button">
      continue editing and <button onclick="${upload}">upload</button>
    </div>`;
    };
    emitter.emit("render");
  });

  emitter.on("showEvalOnMenu", ({ success, e }) => {
    document.getElementById("editor-console-message").innerText = `${e !== undefined ? e : ""}`;
    if (!success) {
      document.getElementById("editor-console-message").className = "alert";
    }
    else {
      document.getElementById("editor-console-message").className = "";
    }
  });
}
