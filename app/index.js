// import choo
const choo = require("choo");
const html = require("choo/html");

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

// import a template
const views = {
  welcome: require("./views/welcome.js"),
  editor: require("./views/editor.js"),
  session: require("./views/session.js"),
}

app.route("/", views.welcome);
app.route("#:mode", views.editor);
app.route("#:mode/:page", views.editor);

app.use(require("./engine.js"));

app.emitter.on("render", () => {
  app.emitter.emit("initRecorder", "");
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
      app.emitter.emit("setRecords", session.records);
      app.emitter.emit("play");

      app.state.sessionName = "Re: " + app.state.sessionName;
      app.emitter.emit("loadEditor");
    });
});

app.emitter.on("loadEditor", () => {
  app.emitter.emit('DOMTitleChange', `${app.state.sessionName} - Hydra↺Replay`);

  document.getElementById("playing-message").innerText = `replaying ${app.state.sessionName}`;
});

app.emitter.on("playbackEnd", () => {
  console.log("finished")
  document.getElementById("playing-message").style.display = "none";
  app.emitter.emit("switchToRecorder");
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

app.state.sessionDom = new views.session.loading();
app.emitter.on("loadSessions", () => {
  fetch('/api/get/list')
    .then(response => response.json())
    .then(data => {
      app.state.sessions = data;
      console.log(app.state.sessions)
      app.state.sessionDom = [];
      for (const session of app.state.sessions) {
        app.state.sessionDom.push(new views.session.entry(session));
      }
      if (app.state.sessions.length == 0) {
        app.state.sessionDom.push(new views.session.notFound());
      }
      app.emitter.emit("render");
    });
});

app.emitter.emit("loadSessions");

// start app
app.mount("#choomount");
