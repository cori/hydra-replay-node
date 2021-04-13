// import choo
const choo = require("choo");
const html = require("choo/html");

const superagent = require('superagent');

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

app.state.engine = new Engine({ state: app.state, defaultCode: "" });

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

app.emitter.on("upload", (data) => {
  superagent
  .post('/api/set/session')
  .send(data)
  .end((err, res) => {
    if (err) {
      console.log('error posting sketch', err)
    } else {
      console.log('posted')
    }
    // emit("loadSessions");
    // // emit("pushState", "/");
    window.location = "/"
  })
})

app.emitter.on("loadSessions", () => {
  app.state.sessionDom = [html`<li>loading...</li>`];
  superagent.get(`/api/get/list`)
    .end((err, res) => {
      app.state.sessions = JSON.parse(res.text);
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
