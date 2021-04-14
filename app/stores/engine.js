const html = require("choo/html");

const CodeMirror = require("codemirror/lib/codemirror");
require("codemirror/mode/javascript/javascript");
require("codemirror/addon/hint/javascript-hint");
require("codemirror/addon/hint/show-hint");
require("codemirror/addon/selection/mark-selection");
require("codemirror/addon/comment/comment");

const { CodeRecord, CodePlay } = require("../codemirror-record.js");

const Keymaps = require("./keymaps.js");

// hydra
const Hydra = require("hydra-synth");

module.exports = function (state, emitter) {
  let editorElement;
  let cm;
  let canvasElement;
  let codeRecorder;
  let codePlayer;
  let hydra;
  let onEvalHandler;

  setupEditor();
  // setupPlayer();
  // setupRecorder();
  setupCanvas();

  const keyHandler = ({ key, name, cursor }) => {
    codeRecorder.recordExtraActivity({ key, name, cursor });
  };

  keymaps = new Keymaps({ cm, handler: keyHandler, emitter });

  state.engine = { editorElement, canvasElement };

  // // overwrite hydra mouse :o
  // var mouse = require("./mouse.js");

  function setupEditor() {
    const el = document.createElement("TEXTAREA");
    editorElement =
      html`<div id="recorder-container" class="container">${el}</div>`;

    cm = CodeMirror.fromTextArea(el, {
      theme: "paraiso-dark",
      readOnly: true,
      value: "",
      mode: { name: "javascript", globalVars: true },
      lineWrapping: true,
      styleSelectedText: true
    });
  }
  function setupRecorder() {
    codeRecorder = new CodeRecord(cm);
    codeRecorder.listen();
  }
  function setupPlayer() {
    codePlayer = new CodePlay(cm, {
      maxDelay: 3000,
      autoplay: false,
      speed: 2,
      extraActivityHandler: activity => {
        if (activity.key !== undefined) {
          keymaps.exec(cm, activity);
          codeRecorder.recordExtraActivity(activity);
          return true;
        }
        return false;
      },
      extraActivityReverter: activityRecorded => {
        console.log(activityRecorded);
      },
      onEndedHandler: () => {
        emitter.emit("editor:playbackEnd");
      }
    });
  }
  function setupCanvas() {
    canvasElement = html`<canvas></canvas>`;
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    canvasElement.style.width = "100%";
    canvasElement.style.height = "100%";

    hydra = new Hydra({
      canvas: canvasElement,
      detectAudio: false,
      enableStreamCapture: false
    });
  }

  emitter.on("engine:initRecorder", () => {
    setupRecorder();
    hydra.eval("hush(); solid().out()");
    cm.setOption("readOnly", false);
    cm.setValue("");
    cm.refresh();
  });
  emitter.on("engine:switchToRecorder", () => {
    cm.setOption("readOnly", false);
  });
  emitter.on("engine:initPlayer", () => {
    setupRecorder();
    if (codePlayer !== undefined) {
      codePlayer.pause();
    }
    setupPlayer();
    cm.setValue("");
    cm.refresh();
    cm.setOption("readOnly", true);
  });
  emitter.on("engine:play", () => {
    codePlayer.play();
  });
  emitter.on("engine:stop", () => {
    if (codePlayer != undefined) {
      codePlayer.pause();
    }
  });
  emitter.on("engine:exec", (code) => {
    try {
      const ret = eval(code);
      emitter.emit("editor:showEval", { success: true, e: ret });
    } catch (e) {
      console.log(e);
      emitter.emit("editor:showEval", { success: false, e });
    }
  });
  emitter.on("engine:getRecords", () => {
    state.records = codeRecorder.getRecords();
  });
  emitter.on("engine:setRecords", (records) => {
    codePlayer.addOperations(records);
  });
  emitter.on("engine:focus", () => {
    cm.focus();
  });
  emitter.on("engine:clearEditor", () => {
    cm.setValue("");
  });
};
