/* global require */
function XRAgentReporterRollbar () {
  var Rollbar = require('rollbar');
  // this.rollbar = new Rollbar('207736752d524eae89142ccf4bc0ca66');
  this.rollbar = new Rollbar('9f6096d2a8f8422994c1538a2510a498');
  this.rollbar.log('Hello, world!');
  throw new Error('TestError: Hello, world', window.location.href);
  return this;
}
XRAgentReporterRollbar.prototype.sendEvent = function () {
  this.rollbar.log(Array.prototype.join.call(arguments, ';'));
};

function Stats (options) {
  if (options instanceof Window) {
    options = {
      window: options
    };
  }
  this.options = options || {};
  this.reporter = options.reporter || new XRAgentReporterRollbar();
  this.window = options.window;
  this.autoinit = 'autoinit' in options ? !!this.autoinit : true;
  this.times = {
    sessionStart: null,
    sessionEnd: null,
    sessionLength: null
  };
  if (this.autoinit) {
    this.init();
  }
  return this;
}
Stats.prototype.init = function (win) {
  var self = this;
  win = win || self.window;
  self.times.sessionStart = win.performance.now();
  self.attachEventListeners(win);
};
Stats.prototype.setReporter = function (reporter) {
  this.reporter = reporter;
};
Stats.prototype.onVRPresentChange = function (evt) {
  var self = this;
  var device = evt.device || evt.display || (
    evt.detail && (evt.detail.device || evt.detail.display)
  );
  if (device.isPresenting) {
    self.reporter.sendEvent('device', 'started');
  } else {
    if (self.times.sessionLength) {
      self.reporter.sendEvent('device', 'ended', null, self.times.sessionLength);
    }
  }
};
Stats.prototype.onVREnter = function (evt) {
  var self = this;
  var device = evt.device || evt.display || (
    evt.detail && (evt.detail.device || evt.detail.display)
  );
  if (device.isPresenting) {
    self.reporter.sendEvent('device', 'entered', null, self.times.sessionLength);
  }
};
Stats.prototype.onVRExit = function (evt) {
  var self = this;
  var device = evt.device || evt.display || (
    evt.detail && (evt.detail.device || evt.detail.display)
  );
  if (device.isPresenting) {
    self.reporter.sendEvent('device', 'exited', null, self.times.sessionLength);
  }
};
Stats.prototype.onVRConnect = function (evt) {
  var self = this;
  var device = evt.device || evt.display || (
    evt.detail && (evt.detail.device || evt.detail.display)
  );
  if (device.isPresenting) {
    self.reporter.sendEvent('device', 'connected', null, self.times.sessionLength);
  }
};
Stats.prototype.onVRDisconnect = function (evt) {
  var self = this;
  var device = evt.device || evt.display || (
    evt.detail && (evt.detail.device || evt.detail.display)
  );
  if (device.isPresenting) {
    self.reporter.sendEvent('device', 'disconnected', null, self.times.sessionLength);
  }
};
Stats.prototype.onVRPointerRestricted = function (evt) {
  var self = this;
  var device = evt.device || evt.display || (
    evt.detail && (evt.detail.device || evt.detail.display)
  );
  if (device.isPresenting) {
    self.reporter.sendEvent('device', 'pointerrestricted', null, self.times.sessionLength);
  }
};
Stats.prototype.onVRPointerUnrestricted = function (evt) {
  var self = this;
  var device = evt.device || evt.display || (
    evt.detail && (evt.detail.device || evt.detail.display)
  );
  if (device.isPresenting) {
    self.reporter.sendEvent('device', 'pointerunrestricted', null, self.times.sessionLength);
  }
};
Stats.prototype.attachEventListeners = function (win) {
  var self = this;
  win = win || self.window;
  // win.addEventListener('resize', function () {
  //   setTimeout(function () {
  //     canvas.width
  //     canvas.height
  //     window.innerHeight
  //     window.innerWidth
  //   }, 10);
  // });
  // win.addEventListener('click', function (evt) {
  //   var el = evt.target;
  // });
  win.addEventListener('beforeunload', function (evt) {
    self.times.sessionEnd = win.performance.now();
    self.times.sessionLength = self.times.sessionEnd - self.times.sessionStart;
  });

  var onVRPresentChange = function (evt) { self.onVRPresentChange(evt); };
  var onVREnter = function (evt) { self.onVREnter(evt); };
  var onVRExit = function (evt) { self.onVRExit(evt); };
  var onVRConnect = function (evt) { self.onVRConnect(evt); };
  var onVRDisconnect = function (evt) { self.onVRDisconnect(evt); };
  var onVRPointerRestricted = function (evt) { self.onVRPointerRestricted(evt); };
  var onVRPointerUnrestricted = function (evt) { self.onVRPointerUnrestricted(evt); };

  // Exited VR mode by manually exiting
  // (e.g., keypress, button click, Oculus Browser's Back button, etc.).
  win.addEventListener('vrdisplaypresentchange', onVRPresentChange);

  // Entered VR mode upon wearing a VR device.
  win.addEventListener('vrdisplayactivate', onVREnter);

  // Exited VR mode by taking off a VR device.
  win.addEventListener('vrdisplaydeactivate', onVRExit);

  // VR device has been connected (or detected on page load).
  win.addEventListener('vrdisplayconnect', onVRConnect);

  // Exited VR mode by disconnecting a VR device.
  win.addEventListener('vrdisplaydisconnect', onVRDisconnect);

  // Mouse cursor is temporarily disabled for input while "pointerlocked" in VR mode
  // (e.g., for Windows Mixed Reality's desktop flat-pane views).
  win.addEventListener('vrdisplaypointerrestricted', onVRPointerRestricted);

  // Mouse cursor is no longer restricted while "pointerlocked" in VR mode
  // (e.g., for Windows Mixed Reality's desktop flat-pane views).
  win.addEventListener('vrdisplaypointerunrestricted', onVRPointerUnrestricted);
};

var stats = new Stats({
  window: window
});

if (window.xrAgent) {
  window.xrAgent.stats = stats;
} else {
  window.xrAgent = {stats: stats};
}
