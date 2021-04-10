const hotkeys = require("hotkeys-js");
const mapping = require("./settings.json").keymaps;

// https://github.com/ojack/hydra/blob/3dcbf85c22b9f30c45b29ac63066e4bbb00cf225/hydra-server/app/src/editor.js
const flashCode = function(cm, start, end) {
  if (!start) start = { line: cm.firstLine(), ch: 0 };
  if (!end) end = { line: cm.lastLine() + 1, ch: 0 };
  var marker = cm.markText(start, end, { className: "styled-background" });
  setTimeout(() => marker.clear(), 300);
};

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
  evalAll: ({ e, cm }) => {
    e.preventDefault();
    const code = cm.getValue();
    flashCode(cm);
    eval(code);
  },
  toggleEditor: ({ e, cm }) => {
    e.preventDefault();
    const editors = document.getElementById("editors");
    if(editors.style.visibility == "hidden") {
      editors.style.visibility = "visible";
    }
    else {
      editors.style.visibility = "hidden";
    }
  },
  evalLine: ({ e, cm }) => {
    e.preventDefault();
    const code = getLine(cm);
    eval(code);
  },
  toggleComment: ({ e, cm }) => {
    e.preventDefault();
    cm.toggleComment();
  },
  evalBlock: ({ e, cm }) => {
    e.preventDefault();
    const code = getCurrentBlock(cm);
    console.log(code);
    eval(code);
  }
};

class Keymaps {
  constructor({ cm, handler }) {
    // enable capturing in text area
    hotkeys.filter = function(event) {
      return true;
    };

    const commandNames = Object.keys(mapping);
    for (const commandName of commandNames) {
      const hk = mapping[commandName];
      if (hk.enabled && typeof commands[commandName] === "function") {
        hotkeys(hk.key, function(e, handler) {
          commands[commandName]({ e, cm });
          hotkeyHandler({key: hk.key, name: commandName})
        });
      }
    }
  }
}

module.exports = Keymaps;
