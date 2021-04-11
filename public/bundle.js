(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
    // // overwrite hydra mouse :o
    // var mouse = require("./mouse.js");
  }
  initRecorder(code) {
    this.recorderCm.refresh();
    this.recorderCm.setValue(code);
  }
  initPlayer(code) {
    this.playerCm.refresh();
    this.playerCm.setValue(code);
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

    const keyHandler = ({ key, name }) => {
      this.codeRecorder.recordExtraActivity({ key, name });
    };
    this.keymaps = new Keymaps({ cm, handler: keyHandler });

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

    const hydra = new Hydra({
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

},{"./keymaps.js":3,"codemirror-record":36,"codemirror/addon/comment/comment":37,"codemirror/addon/hint/javascript-hint":38,"codemirror/addon/hint/show-hint":39,"codemirror/addon/selection/mark-selection":40,"codemirror/lib/codemirror":41,"codemirror/mode/javascript/javascript":42,"hydra-synth":47}],2:[function(require,module,exports){
const socket = require('socket.io-client')();

// import choo
const choo = require("choo");
const html = require("choo/html");

const Engine = require("./engine.js");

// initialize choo
const app = choo({ hash: true });

app.route("/*", notFound);

function notFound() {
  return html`
    <div>
      <a href="/">
        404 with love ❤ back to top!
      </a>
    </div>
  `;
}

app.state.socket = socket;

function loadSessions() {
  if (app.state.sessions === undefined) {
    app.state.sessionsDom = html`
      <p>loading...</p>
    `;
    socket.emit("get sessions", {});
  }

  socket.on("sessions", function(data) {
    app.state.sessions = data;
    app.state.sessionDom = [];
    let i = 0;
    for (const session of data) {
      app.state.sessionDom.push(
        html`
          <li><a href="#${i}">${session.name}</a></li>
        `
      );
      i++;
    }
    if (data.length == 0) {
      app.state.sessionDom.push(
        html`
          <li>no recording yet</li>
        `
      );
    }
    app.state.sessionDom.reverse();
    app.emit("render");
  });
}

loadSessions();

app.state.defaultCode = `osc(50,0.1,1.5).out()`;
app.state.engine = new Engine({state: app.state, defaultCode: app.state.defaultCode});

app.emitter.on('setText', function (e) {
  console.log(e)
})

// import a template
const views = {
  welcome: require("./views/welcome.js"),
  editor: require("./views/editor.js"),
  replay: require("./views/replay.js"),
}

app.route("/", views.welcome);
app.route("#editor", views.editor);
app.route("#:page", views.replay);

// start app
app.mount("#choomount");

console.log("!main", views.welcome);


},{"./engine.js":1,"./views/editor.js":5,"./views/replay.js":6,"./views/welcome.js":7,"choo":10,"choo/html":9,"socket.io-client":72}],3:[function(require,module,exports){
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
    const code = cm.getValue();
    flashCode(cm);
    eval(code);
  },
  toggleEditor: ({ e, cm }) => {
    const editors = document.getElementById("editors");
    if (editors.style.visibility == "hidden") {
      editors.style.visibility = "visible";
    } else {
      editors.style.visibility = "hidden";
    }
  },
  evalLine: ({ e, cm }) => {
    const code = getLine(cm);
    eval(code);
  },
  toggleComment: ({ e, cm }) => {
    cm.toggleComment();
  },
  evalBlock: ({ e, cm }) => {
    const code = getCurrentBlock(cm);
    console.log(code);
    eval(code);
  }
};

class Keymaps {
  constructor({ cm, handler }) {
    this.cm = cm;
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
          commands[commandName]({ e, cm });
          handler({ key: hk.key, name: commandName });
        });
      }
    }
  }
  exec(cm, name) {
    if (commands[name] !== undefined) {
      commands[name]({ cm });
    }
  }
}

module.exports = Keymaps;

},{"./settings.json":4,"hotkeys-js":45}],4:[function(require,module,exports){
module.exports={
    "comment1": "do not include sensitive info such as api keys and passwords",
    "comment2": "because this file will be bundled and exposed to client side",
    "keymaps": {
        "evalAll": {"enabled": true, "key": "ctrl+shift+enter"},
        "toggleEditor": {"enabled": true, "key": "ctrl+shift+h"},
        "toggleComment": {"enabled": true, "key": "ctrl+/"},
        "evalLine": {"enabled": true, "key": "shift+enter,ctrl+enter"},
        "evalBlock": {"enabled": true, "key": "alt+enter"}
    },
    "menu": {
        "shareMessage": "Pressing OK will share this sketch to \nhttps://twitter.com/hydra_patterns.\n\nInclude your name or twitter handle (optional):"
    }
}
},{}],5:[function(require,module,exports){
// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function(state, emit) {
  
  return html`
  <div>
  <div id="canvas-container">${state.engine.getCanvas()}</div>
  <div id="editors">
  ${state.engine.getRecorder()}
  </div>
  <div id="buttons">
    <button onclick="${upload}">upload</button>
  </div>
  </div>`;
  function upload(e) {
    // console.log(e.target.innerText)
    // state.engine.playback(true);
    const records = state.engine.getRecords();
    state.socket.emit("save session", records);
    
  }
};
},{"choo/html":9}],6:[function(require,module,exports){
// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function(state, emit) {
  const session = state.sessions[state.params.page];
  console.log(session)
  state.engine.setRecords(session.records);
  return html`
  <div>
  <div id="canvas-container">${state.engine.getCanvas()}</div>
  <div id="editors">
  ${state.engine.getPlayer()}
  </div>
  </div>`;
};
},{"choo/html":9}],7:[function(require,module,exports){
// import choo's template helper
const html = require("choo/html");

// export module
module.exports = function(state, emit) {
  return html`
    <div>
      <h1>Hydra↺Replay</h1>
      <p><a href="/#editor">Start new session</a></p>
      <p>Replay Session</p>
      <ul>
        ${state.sessionDom}
      </ul>
    </div>
  `;
  // <p><span onclick=${changeName}>ooo!</span> <span onclick=${changeName}>iii!</span></p>

  // function changeName(e) {
  //   console.log(e.target.innerText)
  //   if(e.target.innerText[0] == "o")
  //     state.p5.chooTitle = "o" + state.p5.chooTitle
  //   else
  //     state.p5.chooTitle = state.p5.chooTitle + "i"
  // }
  // function changeColor(e) {
  //   console.log(e.target.innerText)
  //   state.p5.backgroundColor = e.target.innerText
  // }
};

},{"choo/html":9}],8:[function(require,module,exports){
var assert = require('assert')
var LRU = require('nanolru')

module.exports = ChooComponentCache

function ChooComponentCache (state, emit, lru) {
  assert.ok(this instanceof ChooComponentCache, 'ChooComponentCache should be created with `new`')

  assert.equal(typeof state, 'object', 'ChooComponentCache: state should be type object')
  assert.equal(typeof emit, 'function', 'ChooComponentCache: emit should be type function')

  if (typeof lru === 'number') this.cache = new LRU(lru)
  else this.cache = lru || new LRU(100)
  this.state = state
  this.emit = emit
}

// Get & create component instances.
ChooComponentCache.prototype.render = function (Component, id) {
  assert.equal(typeof Component, 'function', 'ChooComponentCache.render: Component should be type function')
  assert.ok(typeof id === 'string' || typeof id === 'number', 'ChooComponentCache.render: id should be type string or type number')

  var el = this.cache.get(id)
  if (!el) {
    var args = []
    for (var i = 2, len = arguments.length; i < len; i++) {
      args.push(arguments[i])
    }
    args.unshift(Component, id, this.state, this.emit)
    el = newCall.apply(newCall, args)
    this.cache.set(id, el)
  }

  return el
}

// Because you can't call `new` and `.apply()` at the same time. This is a mad
// hack, but hey it works so we gonna go for it. Whoop.
function newCall (Cls) {
  return new (Cls.bind.apply(Cls, arguments)) // eslint-disable-line
}

},{"assert":14,"nanolru":23}],9:[function(require,module,exports){
module.exports = require('nanohtml')

},{"nanohtml":19}],10:[function(require,module,exports){
var scrollToAnchor = require('scroll-to-anchor')
var documentReady = require('document-ready')
var nanotiming = require('nanotiming')
var nanorouter = require('nanorouter')
var nanomorph = require('nanomorph')
var nanoquery = require('nanoquery')
var nanohref = require('nanohref')
var nanoraf = require('nanoraf')
var nanobus = require('nanobus')
var assert = require('assert')

var Cache = require('./component/cache')

module.exports = Choo

var HISTORY_OBJECT = {}

function Choo (opts) {
  var timing = nanotiming('choo.constructor')
  if (!(this instanceof Choo)) return new Choo(opts)
  opts = opts || {}

  assert.equal(typeof opts, 'object', 'choo: opts should be type object')

  var self = this

  // define events used by choo
  this._events = {
    DOMCONTENTLOADED: 'DOMContentLoaded',
    DOMTITLECHANGE: 'DOMTitleChange',
    REPLACESTATE: 'replaceState',
    PUSHSTATE: 'pushState',
    NAVIGATE: 'navigate',
    POPSTATE: 'popState',
    RENDER: 'render'
  }

  // properties for internal use only
  this._historyEnabled = opts.history === undefined ? true : opts.history
  this._hrefEnabled = opts.href === undefined ? true : opts.href
  this._hashEnabled = opts.hash === undefined ? false : opts.hash
  this._hasWindow = typeof window !== 'undefined'
  this._cache = opts.cache
  this._loaded = false
  this._stores = [ondomtitlechange]
  this._tree = null

  // state
  var _state = {
    events: this._events,
    components: {}
  }
  if (this._hasWindow) {
    this.state = window.initialState
      ? Object.assign({}, window.initialState, _state)
      : _state
    delete window.initialState
  } else {
    this.state = _state
  }

  // properties that are part of the API
  this.router = nanorouter({ curry: true })
  this.emitter = nanobus('choo.emit')
  this.emit = this.emitter.emit.bind(this.emitter)

  // listen for title changes; available even when calling .toString()
  if (this._hasWindow) this.state.title = document.title
  function ondomtitlechange (state) {
    self.emitter.prependListener(self._events.DOMTITLECHANGE, function (title) {
      assert.equal(typeof title, 'string', 'events.DOMTitleChange: title should be type string')
      state.title = title
      if (self._hasWindow) document.title = title
    })
  }
  timing()
}

Choo.prototype.route = function (route, handler) {
  var routeTiming = nanotiming("choo.route('" + route + "')")
  assert.equal(typeof route, 'string', 'choo.route: route should be type string')
  assert.equal(typeof handler, 'function', 'choo.handler: route should be type function')
  this.router.on(route, handler)
  routeTiming()
}

Choo.prototype.use = function (cb) {
  assert.equal(typeof cb, 'function', 'choo.use: cb should be type function')
  var self = this
  this._stores.push(function (state) {
    var msg = 'choo.use'
    msg = cb.storeName ? msg + '(' + cb.storeName + ')' : msg
    var endTiming = nanotiming(msg)
    cb(state, self.emitter, self)
    endTiming()
  })
}

Choo.prototype.start = function () {
  assert.equal(typeof window, 'object', 'choo.start: window was not found. .start() must be called in a browser, use .toString() if running in Node')
  var startTiming = nanotiming('choo.start')

  var self = this
  if (this._historyEnabled) {
    this.emitter.prependListener(this._events.NAVIGATE, function () {
      self._matchRoute(self.state)
      if (self._loaded) {
        self.emitter.emit(self._events.RENDER)
        setTimeout(scrollToAnchor.bind(null, window.location.hash), 0)
      }
    })

    this.emitter.prependListener(this._events.POPSTATE, function () {
      self.emitter.emit(self._events.NAVIGATE)
    })

    this.emitter.prependListener(this._events.PUSHSTATE, function (href) {
      assert.equal(typeof href, 'string', 'events.pushState: href should be type string')
      window.history.pushState(HISTORY_OBJECT, null, href)
      self.emitter.emit(self._events.NAVIGATE)
    })

    this.emitter.prependListener(this._events.REPLACESTATE, function (href) {
      assert.equal(typeof href, 'string', 'events.replaceState: href should be type string')
      window.history.replaceState(HISTORY_OBJECT, null, href)
      self.emitter.emit(self._events.NAVIGATE)
    })

    window.onpopstate = function () {
      self.emitter.emit(self._events.POPSTATE)
    }

    if (self._hrefEnabled) {
      nanohref(function (location) {
        var href = location.href
        var hash = location.hash
        if (href === window.location.href) {
          if (!self._hashEnabled && hash) scrollToAnchor(hash)
          return
        }
        self.emitter.emit(self._events.PUSHSTATE, href)
      })
    }
  }

  this._setCache(this.state)
  this._matchRoute(this.state)
  this._stores.forEach(function (initStore) {
    initStore(self.state)
  })

  this._tree = this._prerender(this.state)
  assert.ok(this._tree, 'choo.start: no valid DOM node returned for location ' + this.state.href)

  this.emitter.prependListener(self._events.RENDER, nanoraf(function () {
    var renderTiming = nanotiming('choo.render')
    var newTree = self._prerender(self.state)
    assert.ok(newTree, 'choo.render: no valid DOM node returned for location ' + self.state.href)

    assert.equal(self._tree.nodeName, newTree.nodeName, 'choo.render: The target node <' +
      self._tree.nodeName.toLowerCase() + '> is not the same type as the new node <' +
      newTree.nodeName.toLowerCase() + '>.')

    var morphTiming = nanotiming('choo.morph')
    nanomorph(self._tree, newTree)
    morphTiming()

    renderTiming()
  }))

  documentReady(function () {
    self.emitter.emit(self._events.DOMCONTENTLOADED)
    self._loaded = true
  })

  startTiming()
  return this._tree
}

Choo.prototype.mount = function mount (selector) {
  var mountTiming = nanotiming("choo.mount('" + selector + "')")
  if (typeof window !== 'object') {
    assert.ok(typeof selector === 'string', 'choo.mount: selector should be type String')
    this.selector = selector
    mountTiming()
    return this
  }

  assert.ok(typeof selector === 'string' || typeof selector === 'object', 'choo.mount: selector should be type String or HTMLElement')

  var self = this

  documentReady(function () {
    var renderTiming = nanotiming('choo.render')
    var newTree = self.start()
    if (typeof selector === 'string') {
      self._tree = document.querySelector(selector)
    } else {
      self._tree = selector
    }

    assert.ok(self._tree, 'choo.mount: could not query selector: ' + selector)
    assert.equal(self._tree.nodeName, newTree.nodeName, 'choo.mount: The target node <' +
      self._tree.nodeName.toLowerCase() + '> is not the same type as the new node <' +
      newTree.nodeName.toLowerCase() + '>.')

    var morphTiming = nanotiming('choo.morph')
    nanomorph(self._tree, newTree)
    morphTiming()

    renderTiming()
  })
  mountTiming()
}

Choo.prototype.toString = function (location, state) {
  state = state || {}
  state.components = state.components || {}
  state.events = Object.assign({}, state.events, this._events)

  assert.notEqual(typeof window, 'object', 'choo.mount: window was found. .toString() must be called in Node, use .start() or .mount() if running in the browser')
  assert.equal(typeof location, 'string', 'choo.toString: location should be type string')
  assert.equal(typeof state, 'object', 'choo.toString: state should be type object')

  this._setCache(state)
  this._matchRoute(state, location)
  this.emitter.removeAllListeners()
  this._stores.forEach(function (initStore) {
    initStore(state)
  })

  var html = this._prerender(state)
  assert.ok(html, 'choo.toString: no valid value returned for the route ' + location)
  assert(!Array.isArray(html), 'choo.toString: return value was an array for the route ' + location)
  return typeof html.outerHTML === 'string' ? html.outerHTML : html.toString()
}

Choo.prototype._matchRoute = function (state, locationOverride) {
  var location, queryString
  if (locationOverride) {
    location = locationOverride.replace(/\?.+$/, '').replace(/\/$/, '')
    if (!this._hashEnabled) location = location.replace(/#.+$/, '')
    queryString = locationOverride
  } else {
    location = window.location.pathname.replace(/\/$/, '')
    if (this._hashEnabled) location += window.location.hash.replace(/^#/, '/')
    queryString = window.location.search
  }
  var matched = this.router.match(location)
  this._handler = matched.cb
  state.href = location
  state.query = nanoquery(queryString)
  state.route = matched.route
  state.params = matched.params
}

Choo.prototype._prerender = function (state) {
  var routeTiming = nanotiming("choo.prerender('" + state.route + "')")
  var res = this._handler(state, this.emit)
  routeTiming()
  return res
}

Choo.prototype._setCache = function (state) {
  var cache = new Cache(state, this.emitter.emit.bind(this.emitter), this._cache)
  state.cache = renderComponent

  function renderComponent (Component, id) {
    assert.equal(typeof Component, 'function', 'choo.state.cache: Component should be type function')
    var args = []
    for (var i = 0, len = arguments.length; i < len; i++) {
      args.push(arguments[i])
    }
    return cache.render.apply(cache, args)
  }

  // When the state gets stringified, make sure `state.cache` isn't
  // stringified too.
  renderComponent.toJSON = function () {
    return null
  }
}

},{"./component/cache":8,"assert":14,"document-ready":11,"nanobus":15,"nanohref":16,"nanomorph":24,"nanoquery":27,"nanoraf":28,"nanorouter":29,"nanotiming":31,"scroll-to-anchor":33}],11:[function(require,module,exports){
'use strict'

module.exports = ready

function ready (callback) {
  if (typeof document === 'undefined') {
    throw new Error('document-ready only runs in the browser')
  }
  var state = document.readyState
  if (state === 'complete' || state === 'interactive') {
    return setTimeout(callback, 0)
  }

  document.addEventListener('DOMContentLoaded', function onLoad () {
    callback()
  })
}

},{}]