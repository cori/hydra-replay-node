// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function (state, emit) {
  const remix = state.params.mode == "remix";
  const index = state.params.page;;

  if(state.sessions === undefined) {
    window.location = "/"; // meh
  }

  state.engine.initPlayer(state.defaultCode);

  const session = state.sessions[index];
  state.sessionName = session.name;
  console.log(session)
  state.engine.setRecords(session.records);
  state.engine.play();

  let player = state.engine.codePlayer;
  console.log(player.getDuration())
  let speed = 2;
  if (remix) {
    state.sessionName = "Re: " + state.sessionName;
    state.engine.onEnd(() => {
      state.engine.switchToRecorder();
      document.getElementById("buttons").style.visibility = "inherit";
    });
  }

  return html`
  <div>
  <div id="canvas-container">${state.engine.getCanvas()}</div>
  <div id="editors">
  ${state.engine.getEditor()}
  </div>
  <div id="buttons" style="visibility:hidden">
  <button onclick="${upload}">upload</button>
  </div>
  </div>`;
  function upload(e) {
    // console.log(e.target.innerText)
    // state.engine.playback(true);
    const records = state.engine.getRecords();
    state.socket.emit("save session", { name: state.sessionName, records });
    state.reloadSessions();
    window.location = "/";
  }
};