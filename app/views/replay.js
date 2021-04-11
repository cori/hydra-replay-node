// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function (state, emit) {
  const startTime = +new Date;
  const remix = state.params.mode == "remix";
  const index = state.params.page;;

  if (state.sessions === undefined) {
    window.location = "/"; // meh
  }

  state.engine.initPlayer(state.defaultCode);

  const session = state.sessions[index];
  state.sessionName = session.name;
  console.log(session)
  state.engine.setRecords(session.records);
  state.engine.play();

  emit('DOMTitleChange', `${state.sessionName} - Hydra↺Replay`);

  let player = state.engine.codePlayer;
  console.log(player.getDuration())
  let speed = 2;
  state.sessionName = "Re: " + state.sessionName;
  state.engine.onEnd(() => {
    console.log("finished")
    document.getElementById("playing-message").style.display = "none";
    if (remix) {
      state.engine.switchToRecorder();
      document.getElementById("upload-button").style.display = "inherit";
    }
    else {
      document.getElementById("back-message").style.display = "inherit";
    }
  });

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
    <div id="back-message" style="display:none">
      <a href="/">back to top!</a>
    </div>
    <div id="playing-message">
      playing...
    </div>
  </div>
  </div>`;
  function upload(e) {
    // console.log(e.target.innerText)
    // state.engine.playback(true);
    state.engine.endOfRecord();
    const records = state.engine.getRecords();
    if(JSON.parse(records).length > 3) {
      state.socket.emit("save session", { name: state.sessionName, records, startTime });
    }
    state.reloadSessions();
    window.location = "/";
  }
};