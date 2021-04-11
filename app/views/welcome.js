// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function(state, emit) {
  let start = html`Start new session with name <input type="text" oninput=${updateButton} name="session-name">`;
  let startButton = "";
  // let start = html`<a href="/#editor">Start new session</a>`;
  return html`
    <div>
      <h1>Hydra↺Replay</h1>
      <p>${start} ${startButton}</p>
      <p>Replay Session</p>
      <ul>
        ${state.sessionDom}
      </ul>
    </div>
  `;
  function updateButton(e) {
    console.log(e.target.value)
  }
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
