// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function (state, emit) {
  emit('DOMTitleChange', "Hydra↺Replay");
  let name = "";

  return html`
    <div class="welcome">
      <h1>Hydra↺Replay</h1>
      <div class="menu-start">🪁Start new session</div>
      <div class="menu-input"><input type="text" id="name-field" oninput=${updateButton}
      name="session-name" placeholder="title or your name" />
        <button onclick=${go}>go!</button>
        <div><a href="#what">what is this??</a></div>
      </div>
      <div class="menu-replay">🔮Replay Session</div>
      <ul>
        ${state.sessionDom}
      </ul>
    </div>
  `;
  function go(e) {
    if (name.length > 0) {
      state.sessionName = name;
      emit("pushState", "/#new");
    }
  }

  function updateButton(e) {
    name = e.target.value;
  }
};
