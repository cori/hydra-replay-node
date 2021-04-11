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

