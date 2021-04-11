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

class Engine {
  constructor({state}) {
    this.state = state;
    this.setupPlayer();
    this.setupRecorder();
    this.setupCanvas();
    
    const keyHandler = ({ key, name }) => {
      this.codeRecorder.recordExtraActivity({ key, name });
    };
    this.keymaps = new Keymaps({ cm: this.recorderCm, handler: keyHandler, hydra: this.hydra });

    // // overwrite hydra mouse :o
    // var mouse = require("./mouse.js");
  }
  initRecorder(code) {
    this.recorderCm.refresh();
    this.recorderCm.setValue(code);
    this.hydra.eval(code);
  }
  initPlayer(code) {
    this.playerCm.refresh();
    this.playerCm.setValue(code);
    this.hydra.eval(code);
  }
  getRecorder() {
    // this.recorderCm.focus();
    return this.recorderElement;
  }
  getPlayer() {
    // this.playerCm.focus();
    return this.playerElement;
  }
  getCanvas() {
    return this.canvasElement;
  }
  getRecords() {
    const records = this.codeRecorder.getRecords();
    return records;
  }
  setRecords(records) {
    this.codePlayer.addOperations(records);
  }
  setupRecorder() {
    // const container = document.querySelector("#recorder-container");
    const container = document.createElement("div");
    container.id = "recorder-container";
    container.className = "container";
    const el = document.createElement("TEXTAREA");
    container.appendChild(el);
    this.recorderElement = container;

    const cm = CodeMirror.fromTextArea(el, {
      theme: "paraiso-dark",
      value: "a",
      mode: { name: "javascript", globalVars: true },
      lineWrapping: true,
      styleSelectedText: true
    });
    this.recorderCm = cm;

    this.codeRecorder = new CodeRecord(cm);
    this.codeRecorder.listen();

    // setInterval(() => {
    //   if (codeRecorder === undefined) {
    //     return;
    //   }
    //   const records = codeRecorder.getRecords();
    //   console.log(records);
    //   if (records.length > 0) {
    //     codePlayer.addOperations(records);
    //   }
    // }, 10000);
  }
  setupPlayer() {
    // const container = document.querySelector("#player-container");
    const container = document.createElement("div");
    container.id = "player-container";
    container.className = "container";
    const el = document.createElement("TEXTAREA");
    container.appendChild(el);
    this.playerElement = container;
    
    const cm = CodeMirror.fromTextArea(el, {
      theme: "paraiso-dark",
      readOnly: true,
      value: "a",
      mode: { name: "javascript", globalVars: true },
      lineWrapping: true,
      styleSelectedText: true
    });
    this.playerCm = cm;

    this.codePlayer = new CodePlay(cm, {
      maxDelay: 3000,
      autoplay: true,
      speed: 2,
      extraActivityHandler: activity => {
        console.log(activity);
        this.keymaps.exec(cm, activity.name);
      },
      extraActivityReverter: activityRecorded => {
        console.log(activityRecorded);
      }
    });
  }
  setupCanvas() {
    const canvas = document.createElement("CANVAS");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    this.canvasElement = canvas;

    this.hydra = new Hydra({
      canvas,
      detectAudio: false,
      enableStreamCapture: false
    });
  }
  playback(fromTop) {
    if (this.codeRecorder === undefined) {
      return;
    }
    const records = this.codeRecorder.getRecords();
    const recordData = JSON.parse(records);
    console.log(recordData);

    if (recordData.length > 0) {
      let thisFirstTime;
      if (Array.isArray(recordData[0].t)) {
        thisFirstTime = recordData[0].t[0];
      } else {
        thisFirstTime = recordData[0].t;
      }
      if (this.firstTime === undefined) {
        this.firstTime = thisFirstTime;
      }

      this.codePlayer.addOperations(records);
      if (fromTop) {
        this.codePlayer.seek(this.firstTime);
      } else {
        this.codePlayer.seek(thisFirstTime);
      }
      this.codePlayer.play();
    } else {
      if (fromTop && this.firstTime !== undefined) {
        this.codePlayer.seek(this.firstTime);
        this.codePlayer.play();
      }
    }
  }
}
module.exports = Engine;
