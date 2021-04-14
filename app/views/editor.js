const html = require("choo/html");

// export module
module.exports = function (state, emit) {
  emit('DOMTitleChange', `${state.sessionName} - Hydra↺Replay`);
  
  return html`
  <div>
    <div id="canvas-container">${state.engine.canvasElement}</div>
    <div id="editors">
      ${state.engine.editorElement}
    </div>
    <div id="buttons">
      ${state.uploadButton ? state.uploadButton(upload) : ""}
      ${state.playingMessage}
    </div>
    <div id="backlink">
      <div id="back-message">
        <a onclick=${back}>back to top!</a>
      </div>
    </div>
    <div id="editor-console">
    ${'>>'} ${state.editorConsole}
    </div>
  </div>`;
  function back() {
    emit("engine:stop");
    emit("pushState", "/");
  }
  function upload(e) {
    emit("engine:getRecords");
    emit("requests:upload");
  }
};