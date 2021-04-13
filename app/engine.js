const html = require("choo/html");

const CodeMirror = require("codemirror/lib/codemirror");
require("codemirror/mode/javascript/javascript");
require("codemirror/addon/hint/javascript-hint");
require("codemirror/addon/hint/show-hint");
require("codemirror/addon/selection/mark-selection");
require("codemirror/addon/comment/comment");

const { CodeRecord, CodePlay } = require("./codemirror-record.js");

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
  setupPlayer();
  setupRecorder();
  setupCanvas();

  const keyHandler = ({ key, name }) => {
    codeRecorder.recordExtraActivity({ key, name });
  };

  keymaps = new Keymaps({ cm, handler: keyHandler, emitter });

  state.engine = {editorElement, canvasElement};

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
          keymaps.exec(cm, activity.name);
          codeRecorder.recordExtraActivity(activity);
          return true;
        }
        return false;
      },
      extraActivityReverter: activityRecorded => {
        console.log(activityRecorded);
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

  emitter.on("initRecorder", (code) => {
    // TODO: need to dispose first!!!
    setupRecorder();
    // this.hydra.eval(code);
    eval(code);
    cm.setOption("readOnly", false);
    cm.setValue(code);
    cm.refresh();
  });
  emitter.on("switchToRecorder", () => {
    cm.setOption("readOnly", false);
  });
  emitter.on("initPlayer", (code) => {
    // TODO: need to dispose first!!!
    setupRecorder();
    setupPlayer();
    cm.setValue("");
    cm.refresh();
    // this.hydra.eval(code);
    eval(code);
    cm.setOption("readOnly", true);
  });
  emitter.on("play", () => {
    codePlayer.play();
  });
  emitter.on("stop", () => {
    if (codePlayer != undefined) {
      codePlayer.pause();
    }
  });
  emitter.on("onEnd", (func) => {
    codePlayer.setOnEndedHandler(func);
  });
  emitter.on("onEval", (func) => {
    onEvalHandler = func;
  });
  emitter.on("exec", (code) => {
    try {
      const ret = eval(code);
      if (onEvalHandler) {
        onEvalHandler(true, ret);
      }
    } catch (e) {
      console.log(e);
      if (onEvalHandler) {
        onEvalHandler(false, e);
      }
    }
  });
  emitter.on("getRecords", (func) => {
    func(codeRecorder.getRecords());
  });
  emitter.on("setRecords", (records) => {
    codePlayer.addOperations(records);
  });
};
