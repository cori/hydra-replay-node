// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function(state, emit) {  
  return html`
  <div>
  <div id="canvas-container">${state.engine.getCanvas()}</div>
  <div id="editors">
  ${state.engine.getRecorder()}
  ${state.engine.getPlayer()}
  </div>

  <div id="buttons">
    <p>
      code above to record ⇧ and play back below ⇩
    </p>
    <button onclick="${playback}">
      play from top
    </button>
  </div>
  </div>`;
  function playback(e) {
    console.log(e.target.innerText)
    state.engine.playback(true);
  }
};