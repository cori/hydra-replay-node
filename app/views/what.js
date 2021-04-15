// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function (state, emit) {
  emit('DOMTitleChange', "What↻Is↺This");
  let name = "";

  return html`
    <div class="welcome">
      <h1>What↻Is↺This</h1>
      <div class="menu-start">🪁Start new session</div>
      <div class="info">
        <p>Code <a href="https://github.com/ojack/hydra#basic-functions">Hydra</a>.</p>
        <p>🍑<code>ctrl+enter</code> or <code>shift+enter</code>: evaluate line</p>
        <p>🍍<code>alt+enter</code>: evaluate block</p>
        <p>🍒<code>ctrl+shift+enter</code>: evaluate all lines</p>
        <p>Key types and mouse movements are recorded and uploaded for playback!</p>
        <p>Mouse can be accessed by <code>${`()=>mouseX`}</code> and<code>${`()=>mouseY`}</code> (scaled to 0-1). Also <code>src(s0)</code> buffer shows the cursor image.</p>
        <p>
        <a href="/">⏩start playing🔄</a>
        </p>
      </div>
      <div class="menu-replay">🔮Replay Session</div>
      <div class="info">
        <p>Watch someone code, take over and continue coding!</p>
        <p>
        <a href="/">⏩start replaying🔄</a>
        </p>
      </div>
      <div>
        <p>🎁made by n; shout out to <a href="https://hydra.ojack.xyz/">Hydra</a> and <a href="https://live-coding-archive.web.app/liCoHome">LiCo</a>💙</p>
      </div>
    </div>
  `;
};
