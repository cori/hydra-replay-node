const socket = require('socket.io-client')();

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

app.state.socket = socket;

function loadSessions() {
  if (app.state.sessions === undefined) {
    app.state.sessionsDom = html`
      <p>loading...</p>
    `;
  }
  socket.emit("get sessions", {});

  socket.on("sessions", function (data) {
    app.state.sessions = data;
    app.state.sessionDom = [];
    let i = 0;
    for (const session of data) {
      app.state.sessionDom.push(
        html`
          <li>${session.name} <!-- at ${new Date(session.startTime)} --><a href="#${i}">⏩play</a> <a href="#${i}/remix">🔄remix</a></li>
        `
      );
      i++;
    }
    if (data.length == 0) {
      app.state.sessionDom.push(
        html`
          <li>no recording yet</li>
        `
      );
    }
    // app.state.sessionDom.reverse();
    app.emit("render");
  });
}

loadSessions();

app.state.defaultCode = `osc(50,0.1,1.5).out()`;
app.state.engine = new Engine({ state: app.state, defaultCode: app.state.defaultCode });
app.state.reloadSessions = () => {
  loadSessions();
}

// app.state.loadHandlers = [];
// app.use((state, emitter) => {
//   emitter.on('render', function (e) {
//     console.log("rendered")
//     for(const handler of app.state.loadHandlers) {
//       handler();
//     }
//   })
//   emitter.on('editorLoaded', function (e) {
//     console.log("loaded")
//     app.state.engine.initRecorder(app.state.defaultCode)
//   })
// })

// import a template
const views = {
  welcome: require("./views/welcome.js"),
  editor: require("./views/editor.js"),
  replay: require("./views/replay.js"),
}

app.route("/", views.welcome);
app.route("#editor", views.editor);
app.route("#:page", views.replay);
app.route("#:page/:mode", views.replay);

// start app
app.mount("#choomount");

console.log("!main", views.welcome);

