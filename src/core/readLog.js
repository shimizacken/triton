"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.readLog = void 0;
var fs_1 = require("fs");
var enums_js_1 = require("../enums.js");
var readLog = function (logFile) {
    if (!logFile) {
        logFile =
            "/Users/shimiz/Documents/projects/log-reader/src/test/logs/pexip-2021-05-25T06-23-49.542Z.log";
    }
    return new Promise(function (resolve, reject) {
        fs_1["default"].readFile(logFile, "utf8", function (err, contents) {
            if (err) {
                reject(err);
            }
            var split = contents === null || contents === void 0 ? void 0 : contents.split(/\r?\n/);
            var result = split === null || split === void 0 ? void 0 : split.map(function (line) {
                return JSON.parse(line);
            });
            resolve(result);
        });
    });
};
exports.readLog = readLog;
var toTime = function (time) { return new Date(time).toISOString(); };
var stdin = process.openStdin();
console.log("Enter log file path: ");
stdin.addListener("data", function (input) {
    var value = input.toString().trim();
    var results = exports.readLog("" + value);
    results.then(function (result) {
        var _a, _b;
        var topicId = (_b = (_a = result === null || result === void 0 ? void 0 : result.find(function (log) { var _a; return ((_a = log === null || log === void 0 ? void 0 : log.payload) === null || _a === void 0 ? void 0 : _a.type) === "member"; })) === null || _a === void 0 ? void 0 : _a.payload) === null || _b === void 0 ? void 0 : _b.topic;
        var topicLogs = result
            .filter(function (message) {
            var _a, _b;
            if (((_a = message.event) === null || _a === void 0 ? void 0 : _a.topic) && ((_b = message.event) === null || _b === void 0 ? void 0 : _b.topic) !== topicId) {
                return undefined;
            }
            return message;
        })
            .filter(Boolean);
        console.log("" + enums_js_1.Colors.FgYellow + enums_js_1.Colors.Underscore + "Log summary:" + enums_js_1.Colors.Reset + "\n");
        console.log(enums_js_1.Colors.FgCyan + " topic: " + topicId + "\n");
        var names = topicLogs
            .map(function (obj) {
            if (obj.name) {
                return obj.name;
            }
        })
            .filter(Boolean);
        console.log(enums_js_1.Colors.FgYellow, enums_js_1.Colors.Underscore + "Log names:" + enums_js_1.Colors.Reset);
        __spreadArray([], new Set(names)).forEach(function (name) {
            return console.log(enums_js_1.Colors.FgCyan + " " + name);
        });
        var lighthouseEvents = topicLogs
            .map(function (obj) {
            var _a;
            if ((_a = obj.event) === null || _a === void 0 ? void 0 : _a.type) {
                return obj.event.type;
            }
        })
            .filter(Boolean);
        console.log(enums_js_1.Colors.Reset);
        console.log(enums_js_1.Colors.FgYellow, enums_js_1.Colors.Underscore + "lighthouse events:" + enums_js_1.Colors.Reset);
        console.log(enums_js_1.Colors.FgCyan, __spreadArray([], new Set(lighthouseEvents)).join(", "));
        console.log(enums_js_1.Colors.Reset);
        console.log(enums_js_1.Colors.FgYellow, enums_js_1.Colors.Underscore + "Log:" + enums_js_1.Colors.Reset + "\n");
        var mediaEvents = {};
        topicLogs.forEach(function (log) {
            var _a, _b, _c, _d, _e;
            console.log(enums_js_1.Colors.FgGreen, log.time + " | " + toTime(log.time));
            console.log(enums_js_1.Colors.FgCyan, "name: " + log.name);
            log.msg ? console.log(enums_js_1.Colors.FgYellow, "message: " + log.msg) : "";
            log.isTrusted
                ? console.log(enums_js_1.Colors.Reset, "isTrusted: " + log.isTrusted)
                : "";
            if (log.name === "router") {
                console.log("\x1b[0m", "title: " + ((_b = (_a = log.url) === null || _a === void 0 ? void 0 : _a.state) === null || _b === void 0 ? void 0 : _b.title) + ", url: " + ((_c = log.url) === null || _c === void 0 ? void 0 : _c.path));
            }
            log.mute !== undefined
                ? console.log(enums_js_1.Colors.FgCyan, "mute: " + log.mute)
                : "";
            if ((log === null || log === void 0 ? void 0 : log.name) === "lighthouse") {
            }
            var sentMediaEvent = (log === null || log === void 0 ? void 0 : log.name) === "lighthouse" && log.payload ? log.payload : undefined;
            if (sentMediaEvent) {
                console.log(enums_js_1.Colors.FgYellow, "type: " + sentMediaEvent.type);
                sentMediaEvent.at
                    ? console.log(enums_js_1.Colors.FgGreen, "at: " + sentMediaEvent.at)
                    : "";
                console.log(enums_js_1.Colors.FgGreen, "\u2B06 " + enums_js_1.Colors.FgWhite + "sent");
            }
            var receiveLighthouseEvent = (log === null || log === void 0 ? void 0 : log.name) === "lighthouse" && log.event ? log.event : undefined;
            if (receiveLighthouseEvent) {
                console.log(enums_js_1.Colors.FgYellow, "type: " + receiveLighthouseEvent.type);
                console.log(enums_js_1.Colors.FgRed, "\u2B07 " + enums_js_1.Colors.FgWhite + "received");
                receiveLighthouseEvent.at
                    ? console.log(enums_js_1.Colors.FgGreen, "at: " + receiveLighthouseEvent.at)
                    : "";
                if ((receiveLighthouseEvent === null || receiveLighthouseEvent === void 0 ? void 0 : receiveLighthouseEvent.type) === "media") {
                    console.log(enums_js_1.Colors.FgCyan, "audio: " + receiveLighthouseEvent.audio);
                }
                if ((receiveLighthouseEvent === null || receiveLighthouseEvent === void 0 ? void 0 : receiveLighthouseEvent.type) === "member") {
                    console.log(enums_js_1.Colors.FgCyan, "can: " + JSON.stringify(receiveLighthouseEvent.can));
                }
                if ((receiveLighthouseEvent === null || receiveLighthouseEvent === void 0 ? void 0 : receiveLighthouseEvent.at) &&
                    ((_d = mediaEvents[receiveLighthouseEvent.callId]) === null || _d === void 0 ? void 0 : _d.at)) {
                    if (new Date(receiveLighthouseEvent.at).valueOf() <
                        new Date(mediaEvents[receiveLighthouseEvent.callId].at).valueOf()) {
                        console.log(enums_js_1.Colors.FgRed, "\t" + enums_js_1.Colors.Underscore + "received out of order!" + enums_js_1.Colors.Reset + " \uD83E\uDD2A\n", "\t" + enums_js_1.Colors.FgWhite + "previous media event at " + enums_js_1.Colors.FgGreen + ((_e = mediaEvents[receiveLighthouseEvent.callId]) === null || _e === void 0 ? void 0 : _e.at) + " " + enums_js_1.Colors.FgWhite + "and the next at " + enums_js_1.Colors.FgGreen + (receiveLighthouseEvent === null || receiveLighthouseEvent === void 0 ? void 0 : receiveLighthouseEvent.at));
                    }
                }
                if (receiveLighthouseEvent.type === "media") {
                    mediaEvents[receiveLighthouseEvent.callId] = receiveLighthouseEvent;
                }
            }
            console.log("");
        });
    });
});
