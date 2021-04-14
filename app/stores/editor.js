const html = require("choo/html");
const defaultCode = require("./default-code.js");

module.exports = function (state, emitter) {
  emitter.on("setupEditor", (id) => {
    state.editorConsole = html`<span id="editor-console-message"></span>`;
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
    const text = `${e !== undefined ? e : ""}`;
    state.editorConsole.innerText = text;
    if (!success) {
      state.editorConsole.className = "alert";
    }
    else {
      state.editorConsole.className = "";
    }
  });
}
