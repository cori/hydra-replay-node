// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function(state, emit) {
  if(state.sessions === undefined) {
  state.socket.emit("get sessions", {});
  }
  state.sessions = [];

  state.socket.on("sessions", function(data) {
    for(const session of data) {
      state.sessions.push(html`<li>${session.name}</li>`);
    }
      console.log(state.sessions,emit)
      emit('render')
  });

  return html`
    <div>
      <h1>Hydra↺Replay</h1>
      <p><a href="/#editor">Start new session</a></p>
      <p><a href="/#replay">Replay Session</a></p>
      ${state.sessions}
    </div>
  `;
  // <p><span onclick=${changeName}>ooo!</span> <span onclick=${changeName}>iii!</span></p>

  // function changeName(e) {
  //   console.log(e.target.innerText)
  //   if(e.target.innerText[0] == "o")
  //     state.p5.chooTitle = "o" + state.p5.chooTitle
  //   else
  //     state.p5.chooTitle = state.p5.chooTitle + "i"
  // }
  // function changeColor(e) {
  //   console.log(e.target.innerText)
  //   state.p5.backgroundColor = e.target.innerText
  // }
};
