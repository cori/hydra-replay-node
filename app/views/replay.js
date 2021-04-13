// import choo's template helper
const html = require("choo/html");

const superagent = require('superagent');

// export module
module.exports = function (state, emit) {
  const startTime = +new Date;
  const remix = state.params.mode == "remix";
  const id = state.params.page;
  let playingMessage = `replaying...`;

  // state.engine.initPlayer(state.defaultCode);

  let session;
  // setTimeout(() => {
  //   state.engine.initRecorder(state.defaultCode); //NOOOO
  // }, 1000);
  state.engine.initPlayer("");

  superagent.get(`/api/get/session/${id}`)
    .end((err, res) => {
      session = JSON.parse(res.text);
      setParams();
    });

  function setParams() {
    state.sessionName = session.name;
    state.engine.setRecords(session.records);
    state.engine.play();

    emit('DOMTitleChange', `${state.sessionName} - Hydra↺Replay`);

    let player = state.engine.codePlayer;
    console.log(player.getDuration())
    state.sessionName = "Re: " + state.sessionName;
    document.getElementById("playing-message").innerText = `replaying ${state.sessionName}`;
    // playingMessage = `replaying ${state.sessionName}`;
    // emit("render");
    state.engine.onEval((success, e) => {
      document.getElementById("editor-console-message").innerText = `${e !== undefined ? e : ""}`;
      if (!success) {
        document.getElementById("editor-console-message").className = "alert";
      }
      else {
        document.getElementById("editor-console-message").className = "";
      }
    })
    state.engine.onEnd(() => {
      console.log("finished")
      document.getElementById("playing-message").style.display = "none";
      if (remix) {
        state.engine.switchToRecorder();
        document.getElementById("upload-button").style.display = "inherit";
      }
      else {
        // document.getElementById("back-message").style.display = "inherit";
      }
    });
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
    // console.log(e.target.innerText)
    // state.engine.playback(true);
    const records = state.engine.getRecords();
    if (JSON.parse(records).length > 3) {
      state.socket.emit("save session", { name: state.sessionName, records, startTime });
    }
    emit("loadSessions");
    // emit("pushState", "/");
    window.location = "/"
  }
};