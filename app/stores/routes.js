module.exports = function (state, emitter) {
  emitter.on("render", () => {
  });

  emitter.on("navigate", () => {
    console.log(state.params);
    const isWelcome = state.params.mode === undefined;
    const isEditor = state.params.mode == "remix" || state.params.mode == "new";
    if (isWelcome || isEditor) {
      // ok
    }
    else {
      emitter.emit("pushState", "/");
      return;
    }

    if (isWelcome) {
      // top page
      state.editorSetup = false;
      emitter.emit("loadSessions");
    }
    else if (isEditor) {
      // editor
      state.startTime = +new Date;
      const id = state.params.id;

      emitter.emit("initPlayer");
      emitter.emit("initRecorder");

      emitter.emit("setupEditor", id);
    }
  });
}
