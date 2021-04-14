const html = require("choo/html");

const session = require("../views/session.js");
const defaultCode = require("./default-code.js");

module.exports = function (state, emitter) {
  emitter.on("render", () => {
    emitter.emit("initRecorder");
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
      emitter.emit('DOMTitleChange', "Hydra↺Replay");
    }
    else if (isEditor) {
      // editor
      state.startTime = +new Date;
      const id = state.params.id;

      emitter.emit("initPlayer");

      if (state.editorSetup === undefined || state.editorSetup == false) {
        emitter.emit("setupEditor", id);
      }
      emitter.emit('DOMTitleChange', `${state.sessionName} - Hydra↺Replay`);
    }
  });

  emitter.on("setupEditor", (id) => {
    const remix = id !== undefined;
    if (remix) {
      state.playingMessage = "replaying...";
      emitter.emit("getSession", id, (data) => {
        const session = data;
        state.sessionName = session.name;

        state.sessionName = "Re: " + state.sessionName;

        state.playingMessage = `${state.playingMessage} ${state.sessionName}`;
        state.editorSetup = true;
        state.prevRecords = session.records;
        emitter.emit("setRecords", state.prevRecords);
        emitter.emit("play");
        emitter.emit("render");
      });
    }
    else {
      state.playingMessage = "starting...";
      if (state.sessionName === undefined) {
        window.location = "/";
      }
      state.playingMessage = `${state.playingMessage} ${state.sessionName}`;
      state.editorSetup = true;
      state.prevRecords = defaultCode.records;

      //wtf
      emitter.emit("setRecords", state.prevRecords);
      emitter.emit("play");
      emitter.emit("render");
    }
  })
  emitter.on("getSession", (id, done) => {
    fetch(`/api/get/session/${id}`)
      .then(response => response.json())
      .then(data => {
        done(data);
      });
  });

  emitter.on("playbackEnd", () => {
    console.log("finished")
    document.getElementById("playing-message").style.display = "none";
    emitter.emit("switchToRecorder");
    document.getElementById("upload-button").style.display = "inherit";
  });

  emitter.on("showEvalOnMenu", ({ success, e }) => {
    document.getElementById("editor-console-message").innerText = `${e !== undefined ? e : ""}`;
    if (!success) {
      document.getElementById("editor-console-message").className = "alert";
    }
    else {
      document.getElementById("editor-console-message").className = "";
    }
  });

  emitter.on("upload", (data) => {
    const headers = new Headers({ 'Content-Type': 'application/json' })
    let body = {}
    for (const key in data) body[key] = data[key]
    body = JSON.stringify(body)
    fetch('/api/set/session', { method: 'POST', body, headers })
      .then(res => {
        if (!res.ok) return console.log('oh no!')
        console.log('request ok \o/')
        // emit("loadSessions");
        // emit("pushState", "/");
        window.location = "/"
      })
      .catch(err => console.log('oh no!'))
  })

  emitter.on("loadSessions", () => {
    const lastSessions = state.sessions;
    if (lastSessions !== undefined) {
      return;
    }
    fetch('/api/get/list')
      .then(response => response.json())
      .then(data => {
        state.sessions = data;
        console.log(state.sessions)
        state.sessionDom = [];
        for (const s of state.sessions) {
          state.sessionDom.push(session.entry(s));
        }
        if (state.sessions.length == 0) {
          state.sessionDom.push(session.notFound());
        }

        emitter.emit("render");
        // // !! it renders so be careful with inf loop
        // if (lastSessions !== undefined &&
        //   state.sessions.every((el, i) => el._id === lastSessions[i]._id)) {
        //   // no need to update
        // }
        // else {
        //   emitter.emit("render");
        // }
      });
  });
}
