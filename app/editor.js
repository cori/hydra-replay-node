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
    <button onclick="playback(true)">
      play from top
    </button>
  </div>
  </div>`;
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