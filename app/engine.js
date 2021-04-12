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
  constructor({ state }) {
    this.state = state;
    this.setupEditor();
    this.setupPlayer();
    this.setupRecorder();
    this.setupCanvas();

    const keyHandler = ({ key, name }) => {
      this.codeRecorder.recordExtraActivity({ key, name });
    };

    this.keymaps = new Keymaps({ cm: this.cm, handler: keyHandler, hydra: this.hydra });

    // // overwrite hydra mouse :o
    // var mouse = require("./mouse.js");
  }
  initRecorder(code) {
    this.setupRecorder();
    // this.hydra.eval(code);
    eval(code);
    this.cm.setOption("readOnly", false);
    this.cm.setValue(code);
    this.cm.refresh();
  }
  switchToRecorder() {
    this.cm.setOption("readOnly", false);
  }
  initPlayer(code) {
    this.setupRecorder();
    this.setupPlayer();
    this.cm.setValue("");
    this.cm.refresh();
    // this.hydra.eval(code);
    eval(code);
    this.cm.setOption("readOnly", true);
  }
  play() {
    this.codePlayer.play();
  }
  stop() {
    if (this.codePlayer != undefined) {
      this.codePlayer.pause();
    }
  }
  endOfRecord() {
    this.codeRecorder.recordExtraActivity({ endOfRecord: true });
  }
  onEnd(func) {
    this.onEndHandler = func;
  }
  getEditor() {
    // this.recorderCm.focus();
    return this.recorderElement;
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
  setupEditor() {
    if (this.recorderElement !== undefined) {
      const el = this.recorderElement;
      el.parentNode.removeChild(el);
    }
    const container = document.createElement("div");
    container.id = "recorder-container";
    container.className = "container";
    const el = document.createElement("TEXTAREA");
    container.appendChild(el);
    this.recorderElement = container;

    this.cm = CodeMirror.fromTextArea(el, {
      theme: "paraiso-dark",
      readOnly: true,
      value: "",
      mode: { name: "javascript", globalVars: true },
      lineWrapping: true,
      styleSelectedText: true
    });
  }
  setupRecorder() {
    this.codeRecorder = new CodeRecord(this.cm);
    this.codeRecorder.listen();
  }
  setupPlayer() {
    this.codePlayer = new CodePlay(this.cm, {
      maxDelay: 3000,
      autoplay: false,
      speed: 2,
      extraActivityHandler: activity => {
        // console.log(activity);
        if (activity.key !== undefined) {
          this.keymaps.exec(this.cm, activity.name);
          this.codeRecorder.recordExtraActivity(activity);
          return true;
        }
        if (activity.endOfRecord == true) {
          if (this.onEndHandler !== undefined) {
            this.onEndHandler();
          }
          return true;
        }
        return false;
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
