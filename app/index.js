const CodeMirror = require("codemirror/lib/codemirror");
require("codemirror/mode/javascript/javascript");
require("codemirror/addon/hint/javascript-hint");
require("codemirror/addon/hint/show-hint");
require("codemirror/addon/selection/mark-selection");
require("codemirror/addon/comment/comment");

const { CodeRecord, CodePlay } = require("codemirror-record");

const Keymaps = require("./keymaps.js");

// hydra
const Hydra = require("hydra-synth");

let codePlayer;

{
  const container = document.querySelector("#editor-container");
  const el = document.createElement("TEXTAREA");
  //document.body.appendChild(container);
  container.appendChild(el);

  const cm = CodeMirror.fromTextArea(el, {
    theme: "paraiso-dark",
    value: "a",
    mode: { name: "javascript", globalVars: true },
    lineWrapping: true,
    styleSelectedText: true
  });
  cm.refresh();
  cm.setValue(
    `osc(50,0.1,1.5).rotate(()=>mouse.y/100).modulate(noise(3),()=>mouse.x/window.innerWidth/4).out()`
  );

  new Keymaps({ cm });

  const codeRecorder = new CodeRecord(cm);
  codeRecorder.listen();

  setInterval(() => {
    if (codeRecorder === undefined) {
      return;
    }
    const records = codeRecorder.getRecords();
    console.log(records);
    if (records.length > 0) {
      codePlayer.addOperations(records);
    }
    codePlayer.play();
  }, 10000);

  const canvas = document.createElement("CANVAS");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  document.querySelector("#canvas-container").appendChild(canvas);

  const hydra = new Hydra({
    canvas,
    detectAudio: false,
    enableStreamCapture: false
  });
  {
    // init
    const code = cm.getValue();
    hydra.eval(code);
  }
}
{
  const container = document.querySelector("#player-container");
  const el = document.createElement("TEXTAREA");
  //document.body.appendChild(container);
  container.appendChild(el);

  const cm = CodeMirror.fromTextArea(el, {
    theme: "paraiso-dark",
    value: "a",
    mode: { name: "javascript", globalVars: true },
    lineWrapping: true,
    styleSelectedText: true
  });
  cm.refresh();

  codePlayer = new CodePlay(cm, {
    maxDelay: 3000,
    autoplay: true,
    speed: 0.8,
    extraActivityHandler: activityRecorded => {
      console.log(activityRecorded);
    },
    extraActivityReverter: activityRecorded => {
      console.log(activityRecorded);
    }
  });
}
// overwrite hydra mouse :o
var mouse = require("./mouse.js");
