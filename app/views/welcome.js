// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function (state, emit) {
  let name = "";

  // let start = html`<a href="/#editor">Start new session</a>`;
  return html`
    <div class="welcome">
      <h1>Hydra↺Replay</h1>
      <div class="menu-start">Start new session</div>
      <div class="menu-input"><input type="text" id="name-field" oninput=${updateButton}
      name="session-name" placeholder="title or your name" />
        <button onclick=${go}>go!</button>
      </div>
      <div class="menu-replay">Replay Session</div>
      <ul>
        ${state.sessionDom}
      </ul>
      <div>made by n; shout out to <a href="https://hydra.ojack.xyz/">Hydra</a> and <a href="https://live-coding-archive.web.app/liCoHome">LiCo</a></div>
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
