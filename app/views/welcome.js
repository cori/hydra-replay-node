// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function (state, emit) {
  emit('DOMTitleChange', "Hydra↺Replay");
  state.engine.stop(); // if any
  let startButton = html`
    <button id="startbutton" style="visibility:hidden" onclick=${go}>go!</button>
  `;
  // let start = html`<a href="/#editor">Start new session</a>`;
  return html`
    <div class="welcome">
      <h1>Hydra↺Replay</h1>
      <div class="menu-start">Start new session</div>
      <div class="menu-input"><input type="text" id="name-field" oninput=${updateButton}
      name="session-name" placeholder="title or your name" />
        ${startButton}
      </div>
      <div class="menu-replay">Replay Session</div>
      <ul>
        ${state.sessionDom}
      </ul>
    </div>
  `;
  function updateButton(e) {
    const name = e.target.value;
    const lastStartButton = startButton;
    if (name.length > 0) {
      document.getElementById("startbutton").style.visibility = "inherit";
    } else {
      document.getElementById("startbutton").style.visibility = "hidden";
    }
  }
  function go(e) {
    const name = document.getElementById("name-field").value;
    if (name.length > 0) {
      state.sessionName = name;
      window.location = "#editor";
    }
  }
};
