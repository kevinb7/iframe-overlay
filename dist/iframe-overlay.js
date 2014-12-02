!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.createIframeOverlay=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Poster = require("../node_modules/poster/lib/poster");
function createIframeOverlay(iframe) {
    var wrapper = $("<span></span>").css({
        position: "relative",
        padding: 0,
        margin: 0,
        display: "inline-block"
    }).addClass("wrapper").get(0);
    var overlay = $("<span></span>").css({
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%"
    }).addClass("overlay").get(0);
    var parent = iframe.parentElement;
    parent.insertBefore(wrapper, iframe);
    wrapper.appendChild(iframe);
    wrapper.appendChild(overlay);
    var state = {
        down: false,
        paused: false
    };
    var poster = new Poster(iframe.contentWindow);
    overlay.addEventListener("mousedown", function (e) {
        state.down = true;
        if (!state.paused) {
            var bounds = wrapper.getBoundingClientRect();
            poster.post("mouse", {
                type: "mousedown",
                x: e.pageX - bounds.left,
                y: e.pageY - bounds.top
            });
            e.preventDefault();
        }
    });
    overlay.addEventListener("mousemove", function (e) {
        if (!state.down) {
            if (!state.paused) {
                var bounds = wrapper.getBoundingClientRect();
                poster.post("mouse", {
                    type: "mousemove",
                    x: e.pageX - bounds.left,
                    y: e.pageY - bounds.top
                });
            }
        }
    });
    window.addEventListener("mousemove", function (e) {
        if (state.down) {
            if (!state.paused) {
                var bounds = wrapper.getBoundingClientRect();
                poster.post("mouse", {
                    type: "mousemove",
                    x: e.pageX - bounds.left,
                    y: e.pageY - bounds.top
                });
            }
        }
    });
    window.addEventListener("mouseup", function (e) {
        if (state.down) {
            if (!state.paused) {
                var bounds = wrapper.getBoundingClientRect();
                poster.post("mouse", {
                    type: "mouseup",
                    x: e.pageX - bounds.left,
                    y: e.pageY - bounds.top
                });
            }
            state.down = false;
        }
    });
    return state;
}
module.exports = createIframeOverlay;

},{"../node_modules/poster/lib/poster":2}],2:[function(require,module,exports){
var posters = [];
if (self.document) {
    self.addEventListener("message", function (e) {
        var channel = e.data.channel;
        posters.forEach(function (poster) {
            if (poster.target === e.source) {
                var listeners = poster.channels[channel];
                if (listeners) {
                    listeners.forEach(function (listener) { return listener.apply(null, e.data.args); });
                }
            }
        });
    });
}
else {
    self.addEventListener("message", function (e) {
        var channel = e.data.channel;
        posters.forEach(function (poster) {
            var listeners = poster.channels[channel];
            if (listeners) {
                listeners.forEach(function (listener) { return listener.apply(null, e.data.args); });
            }
        });
    });
}
var Poster = (function () {
    function Poster(target, origin) {
        var _this = this;
        if (origin === void 0) { origin = "*"; }
        this.origin = origin;
        this.target = target;
        this.channels = {};
        if (self.window && this.target instanceof Worker) {
            this.target.addEventListener("message", function (e) {
                var channel = e.data.channel;
                var listeners = _this.channels[channel];
                if (listeners) {
                    listeners.forEach(function (listener) { return listener.apply(null, e.data.args); });
                }
            });
        }
        posters.push(this);
    }
    Poster.prototype.post = function (channel) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var message = {
            channel: channel,
            args: args
        };
        if (self.document && !(this.target instanceof Worker)) {
            this.target.postMessage(message, this.origin);
        }
        else {
            this.target.postMessage(message);
        }
    };
    Poster.prototype.emit = function (channel) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        args.unshift(channel);
        this.post.apply(this, args);
    };
    Poster.prototype.listen = function (channel, callback) {
        var listeners = this.channels[channel];
        if (listeners === undefined) {
            listeners = this.channels[channel] = [];
        }
        listeners.push(callback);
        return this;
    };
    Poster.prototype.addListener = function (channel, callback) {
        return this.listen(channel, callback);
    };
    Poster.prototype.on = function (channel, callback) {
        return this.listen(channel, callback);
    };
    Poster.prototype.removeListener = function (channel, callback) {
        var listeners = this.channels[channel];
        if (listeners) {
            var index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    };
    Poster.prototype.removeAllListeners = function (channel) {
        this.channels[channel] = [];
    };
    Poster.prototype.listeners = function (channel) {
        var listeners = this.channels[channel];
        return listeners || [];
    };
    return Poster;
})();
module.exports = Poster;

},{}]},{},[1])(1)
});