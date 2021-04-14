const session = require("../views/session.js");

module.exports = function (state, emitter) {
  emitter.on("requests:upload", (data) => {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    let body = { records: state.records, startTime: state.startTime, name: state.sessionName, mouse: state.mouse.records };
    body = JSON.stringify(body);
    fetch('/api/set/session', { method: 'POST', body, headers })
      .then(res => {
        if (!res.ok) return console.log('oh no!')
        console.log('request ok \o/')
        emitter.emit("requests:loadSessions");
        emitter.emit("pushState", "/");
      })
      .catch(err => console.log('oh no!', err));
  });

  emitter.on("requests:loadSessions", () => {
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
      });
  });

  emitter.on("requests:getSession", (id, done) => {
    fetch(`/api/get/session/${id}`)
      .then(response => response.json())
      .then(data => {
        done(data);
      });
  });
}
