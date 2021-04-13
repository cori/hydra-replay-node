// import choo
const choo = require("choo");
const html = require("choo/html");

const Engine = require("./engine.js");

// initialize choo
const app = choo({ hash: true });

app.route("/*", notFound);

function notFound() {
  return html`
    <div>
      <a href="/">
        404 with love ❤ back to top!
      </a>
    </div>
  `;
}

app.state.engine = new Engine({ state: app.state, emit: app.emitter.emit, defaultCode: "" });

app.emitter.on("render", () => {
  app.state.engine.initRecorder("");
});

app.emitter.on("updateStartEditButton", (name) => {
  if (name.length > 0) {
    document.getElementById("startbutton").style.visibility = "inherit";
  } else {
    document.getElementById("startbutton").style.visibility = "hidden";
  }
})

app.emitter.on("getSession", (id) => {
  fetch(`/api/get/session/${id}`)
    .then(response => response.json())
    .then(data => {
      const session = data;
      app.state.sessionName = session.name;
      app.state.engine.setRecords(session.records);
      app.state.engine.play();

      app.state.sessionName = "Re: " + app.state.sessionName;
      app.emitter.emit("loadEditor");
    });
});

app.emitter.on("loadEditor", () => {
  app.emitter.emit('DOMTitleChange', `${app.state.sessionName} - Hydra↺Replay`);

  let player = app.state.engine.codePlayer;
  console.log(player.getDuration())
  document.getElementById("playing-message").innerText = `replaying ${app.state.sessionName}`;
});

app.emitter.on("playbackEnd", () => {
  console.log("finished")
  document.getElementById("playing-message").style.display = "none";
  app.state.engine.switchToRecorder();
  document.getElementById("upload-button").style.display = "inherit";
});

app.emitter.on("eval", ({ success, e }) => {
  document.getElementById("editor-console-message").innerText = `${e !== undefined ? e : ""}`;
  if (!success) {
    document.getElementById("editor-console-message").className = "alert";
  }
  else {
    document.getElementById("editor-console-message").className = "";
  }
});

app.emitter.on("upload", (data) => {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  let body = {}
  for (const key in data) body[key] = data[key]
  body = JSON.stringify(body)
  fetch('/api/set/session', { method: 'POST', body, headers })
    .then(res => {
      if (!res.ok) return console.log('oh no!')
      console.log('request ok \o/')
      // emit("loadSessions");
      // // emit("pushState", "/");
      window.location = "/"
    })
    .catch(err => console.log('oh no!'))
})

app.emitter.on("loadSessions", () => {
  app.state.sessionDom = [html`<li>loading...</li>`];
  fetch('/api/get/list')
    .then(response => response.json())
    .then(data => {
      app.state.sessions = data;
      console.log(app.state.sessions)
      app.state.sessionDom = [];
      let i = 0;
      for (const session of app.state.sessions) {
        app.state.sessionDom.push(
          html`
       <li><p class="session-name">${session.name} <!-- at ${new Date(session.startTime)} --></p>
       <p class="session-link"> <a href="#remix/${session._id}">⏩play&remix🔄</a></p>
       <div class="session-break"></div></li>
     `
        );
        i++;
      }
      if (app.state.sessions.length == 0) {
        app.state.sessionDom.push(
          html`
       <li>no recording yet</li>
     `
        );
      }
      app.emitter.emit("render");
    });
});

app.emitter.emit("loadSessions");

// import a template
const views = {
  welcome: require("./views/welcome.js"),
  editor: require("./views/editor.js"),
}

app.route("/", views.welcome);
app.route("#:mode", views.editor);
app.route("#:mode/:page", views.editor);

// start app
app.mount("#choomount");
