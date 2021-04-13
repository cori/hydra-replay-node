const html = require("choo/html");

module.exports = {
  entry: function (session) {
    return html`
  <li>
    <p class="session-name">${session.name} <!-- at ${new Date(session.startTime)} --></p>
    <p class="session-link"> <a href="#remix/${session._id}">⏩play&remix🔄</a></p>
    <div class="session-break"></div>
  </li>`
  },
  notFound: function () {
    return html`<li>no recording yet</li>`;
  },
}