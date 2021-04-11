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
    socket.emit("get sessions", {});
  }

  socket.on("sessions", function(data) {
    app.state.sessions = data;
    app.state.sessionDom = [];
    let i = 0;
    for (const session of data) {
      app.state.sessionDom.push(
        html`
          <li><a href="#${i}">${session.name}</a></li>
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
    app.state.sessionDom.reverse();
    app.emit("render");
  });
}

loadSessions();

app.state.engine = new Engine(app.state);

app.emitter.on('setText', function (e) {
  console.log(e)
})

// import a template
const views = {
  welcome: require("./welcome.js"),
  editor: require("./editor.js"),
  replay: require("./replay.js"),
}

app.route("/", views.welcome);
app.route("#editor", views.editor);
app.route("#:page", views.replay);

// start app
app.mount("#choomount");

console.log("!main", views.welcome);

