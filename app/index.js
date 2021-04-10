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

//app.state.p5 = p5sketch("p5-holder");

app.emitter.on('setText', function (e) {
  console.log(e)
})

// import a template
const welcome = require("./welcome.js");

app.route("/", welcome);

// start app
app.mount("#choomount");

console.log("!main", welcome);

