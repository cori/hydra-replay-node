// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function(state, emit) {
  if (state.sessions === undefined) {
    state.sessions = html`
      <p>loading...</p>
    `;
    state.socket.emit("get sessions", {});
  }

  state.socket.on("sessions", function(data) {
    state.sessions = [];
    let i = 0;
    for (const session of data) {
      state.sessions.push(
        html`
          <li><a href="#${i}">${session.name}</a></li>
        `
      );
      i++;
    }
    if (data.length == 0) {
      state.sessions.push(
        html`
          <li>no recording yet</li>
        `
      );
    }
    state.sessions.reverse();
    emit("render");
  });
  console.log(state.sessions, emit);

  return html`
    <div>
      <h1>Hydra↺Replay</h1>
      <p><a href="/#editor">Start new session</a></p>
      <p>Replay Session</p>
      <ul>
        ${state.sessions}
      </ul>
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
