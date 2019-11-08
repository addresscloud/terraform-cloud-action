"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _core = _interopRequireDefault(require("@actions/core"));

var _terraform = _interopRequireDefault(require("./terraform"));

try {
  var token = _core["default"].getInput(tfToken);

  var org = _core["default"].getInput(tfOrg);

  var workspace = _core["default"].getInput(tfWorkspace);

  var filePath = _core["default"].getInput(filePath);

  var tf = new _terraform["default"](token, org);
  tf.run(workspace, filePath);
} catch (error) {
  _core["default"].setFailed(error.message);
}