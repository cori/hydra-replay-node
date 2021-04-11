// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function(state, emit) {
  const session = state.sessions[state.params.page];
  console.log(session)
  state.engine.setRecords(session.records);
  return html`
  <div>
  <div id="canvas-container">${state.engine.getCanvas()}</div>
  <div id="editors">
  ${state.engine.getPlayer()}
  </div>
  </div>`;
};