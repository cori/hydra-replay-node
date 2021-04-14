const hotkeys = require("hotkeys-js");
const mapping = require("../settings.json").keymaps;

// https://github.com/ojack/hydra/blob/3dcbf85c22b9f30c45b29ac63066e4bbb00cf225/hydra-server/app/src/editor.js
const flashCode = function(cm, start, end) {
  if (!start) start = { line: cm.firstLine(), ch: 0 };
  if (!end) end = { line: cm.lastLine() + 1, ch: 0 };
  var marker = cm.markText(start, end, { className: "styled-background" });
  setTimeout(() => marker.clear(), 300);
};

const getAll = function(cm) {
  flashCode(cm);
  return cm.getValue();
}

const getLine = function(cm) {
  var c = cm.getCursor();
  var s = cm.getLine(c.line);
  flashCode(cm, { line: c.line, ch: 0 }, { line: c.line + 1, ch: 0 });
  return s;
};

const getCurrentBlock = function(cm) {
  // thanks to graham wakefield + gibber
  var editor = cm;
  var pos = editor.getCursor();
  var startline = pos.line;
  var endline = pos.line;
  while (startline > 0 && cm.getLine(startline) !== "") {
    startline--;
  }
  while (endline < editor.lineCount() && cm.getLine(endline) !== "") {
    endline++;
  }
  var pos1 = {
    line: startline,
    ch: 0
  };
  var pos2 = {
    line: endline,
    ch: 0
  };
  var str = editor.getRange(pos1, pos2);

  flashCode(cm, pos1, pos2);

  return str;
};

const commands = {
  evalAll: ({ cm, emitter }) => {
    const code = getAll(cm);
    emitter.emit("engine:exec", code);
  },
  // toggleEditor: ({ cm, engine }) => {
  //   const editors = document.getElementById("editors");
  //   if (editors.style.visibility == "hidden") {
  //     editors.style.visibility = "visible";
  //   } else {
  //     editors.style.visibility = "hidden";
  //   }
  // },
  evalLine: ({ cm, emitter }) => {
    const code = getLine(cm);
    emitter.emit("engine:exec", code);
  },
  // toggleComment: ({ cm, engine }) => {
  //   cm.toggleComment();
  // },
  evalBlock: ({ cm, emitter }) => {
    const code = getCurrentBlock(cm);
    emitter.emit("engine:exec", code);
  }
};

class Keymaps {
  constructor({ cm, handler, emitter }) {
    this.cm = cm;
    this.emitter = emitter;
    // enable capturing in text area
    hotkeys.filter = function(event) {
      return true;
    };

    const commandNames = Object.keys(mapping);
    for (const commandName of commandNames) {
      const hk = mapping[commandName];
      if (hk.enabled && typeof commands[commandName] === "function") {
        hotkeys(hk.key, function(e, hotkeyHandler) {
          e.preventDefault();
          commands[commandName]({ cm, emitter });
          handler({ key: hk.key, name: commandName });
        });
      }
    }
  }
  exec(cm, name) {
    if (commands[name] !== undefined) {
      commands[name]({ cm, emitter: this.emitter });
    }
  }
}

module.exports = Keymaps;
