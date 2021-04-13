const html = require("choo/html");

module.exports = function (session) {
  if (session === undefined) {
    return html`<li>no recording yet</li>`;
  }
  return html`
  <li>
    <p class="session-name">${session.name} <!-- at ${new Date(session.startTime)} --></p>
    <p class="session-link"> <a href="#remix/${session._id}">⏩play&remix🔄</a></p>
    <div class="session-break"></div>
  </li>`;
}