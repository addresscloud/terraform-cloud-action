"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _axios = _interopRequireDefault(require("axios"));

var _fs = _interopRequireDefault(require("fs"));

var _constants = require("constants");

/**
 * @module Terraform
 */
var Terraform =
/*#__PURE__*/
function () {
  /**
   * Terraform Cloud class.
   * 
   * @param {string} token - Terraform Cloud token.
   * @param {string} org - Terraform Cloud organization.
   * @param {string} [address=`app.terraform.com`] - Terraform Cloud address.
   * @param {number} [sleepDuration=5] - Duration to wait before requesting status.
   */
  function Terraform(token, org) {
    var address = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "app.terraform.io";
    var sleepDuration = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5;
    (0, _classCallCheck2["default"])(this, Terraform);
    this.axios = _axios["default"].create({
      baseURL: "https://".concat(address, "/api/v2"),
      headers: {
        'Authorization': "bearer ".concat(token),
        'Content-Type': "application/vnd.api+json"
      }
    });
    this.sleepDuration = sleepDuration;
    this.org = org;
  }
  /**
   * Check workspace exists, and return Id.
   * 
   * @param {string} workspace - Workspace name.
   * @returns {string} - Workspace Id.
   */


  (0, _createClass2["default"])(Terraform, [{
    key: "_checkWorkspace",
    value: function _checkWorkspace(workspace) {
      var res;
      return _regenerator["default"].async(function _checkWorkspace$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;

              if (!(workspace.indexOf(' ') >= 0)) {
                _context.next = 3;
                break;
              }

              throw new Error("Workspace name should not contain spaces.");

            case 3:
              _context.next = 5;
              return _regenerator["default"].awrap(this.axios.get("/organizations/".concat(this.org, "/workspaces/").concat(workspace)));

            case 5:
              res = _context.sent;

              if (res.data) {
                _context.next = 10;
                break;
              }

              throw new Error('No data returned from request.');

            case 10:
              if (res.data.id) {
                _context.next = 12;
                break;
              }

              throw new Error('Workspace not found.');

            case 12:
              return _context.abrupt("return", res.data.id);

            case 15:
              _context.prev = 15;
              _context.t0 = _context["catch"](0);
              throw new Error("Error checking the workspace: ".concat(_context.t0.message));

            case 18:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[0, 15]]);
    }
    /**
     * Create new configuration version, and returns upload URL.
     * 
     * @returns {string} - Configuration upload URL.
     */

  }, {
    key: "_createConfigVersion",
    value: function _createConfigVersion(workspaceId) {
      var configVersion, res;
      return _regenerator["default"].async(function _createConfigVersion$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              configVersion = {
                data: {
                  type: "configuration-versions",
                  attributes: {
                    "auto-queue-runs": false
                  }
                }
              };
              _context2.next = 4;
              return _regenerator["default"].awrap(this.axios.post("/organizations/".concat(this.org, "/workspaces/").concat(workspaceId, "/configuration-versions"), JSON.stringify(configVersion)));

            case 4:
              res = _context2.sent;

              if (res.data) {
                _context2.next = 9;
                break;
              }

              throw new Error('No data returned from request.');

            case 9:
              if (!(!res.data.attributes || !res.data.attributes['upload-url'])) {
                _context2.next = 11;
                break;
              }

              throw new Error('No upload URL was returned.');

            case 11:
              return _context2.abrupt("return", res.data.attributes['upload-url']);

            case 14:
              _context2.prev = 14;
              _context2.t0 = _context2["catch"](0);
              throw new Error("Error creating the config version: ".concat(_context2.t0.message));

            case 17:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this, [[0, 14]]);
    }
    /**
     * Uploads assets to new configuration version.
     * 
     * @param {string} uploadUrl - Url for configuration upload.
     * @param {string} filePath - tar.gz file for upload.
     */

  }, {
    key: "_uploadConfiguration",
    value: function _uploadConfiguration(uploadUrl, filePath) {
      return _regenerator["default"].async(function _uploadConfiguration$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return _regenerator["default"].awrap(this.axios.put(uploadUrl, _fs["default"].createReadStream(filePath), {
                headers: {
                  'Content-Type': "application/octet-stream"
                }
              }));

            case 3:
              _context3.next = 8;
              break;

            case 5:
              _context3.prev = 5;
              _context3.t0 = _context3["catch"](0);
              throw new Error("Error uploading the configuration: ".concat(_context3.t0.message));

            case 8:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this, [[0, 5]]);
    }
    /**
     * Requests run of new configuration.
     * 
     * @param {string} workspaceId - Workspace Id.
     * @returns {string} - Run Id.
     */

  }, {
    key: "_run",
    value: function _run(workspaceId) {
      var run, res;
      return _regenerator["default"].async(function _run$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              run = {
                "data": {
                  "attributes": {
                    "is-destroy": false
                  },
                  "type": "runs",
                  "relationships": {
                    "workspace": {
                      "data": {
                        "type": "workspaces",
                        "id": workspaceId
                      }
                    }
                  }
                }
              };
              _context4.next = 4;
              return _regenerator["default"].awrap(this.axios.post('/runs', JSON.stringify(run)));

            case 4:
              res = _context4.sent;

              if (res.data) {
                _context4.next = 9;
                break;
              }

              throw new Error('No data returned from request.');

            case 9:
              if (res.data.id) {
                _context4.next = 11;
                break;
              }

              throw new Error('Run Id not found.');

            case 11:
              return _context4.abrupt("return", res.data.id);

            case 14:
              _context4.prev = 14;
              _context4.t0 = _context4["catch"](0);
              throw new Error("Error requesting the run: ".concat(_context4.t0.message));

            case 17:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this, [[0, 14]]);
    }
    /**
     * Watch for updates to run by periodically polling the api.
     */

    /*async _watch(){
        const watch = true {
            
        }
        // watch for updates?
        // this process.timeout
        res = axios.get()
        
    }*/

    /**
     * Create, initialize and start a new workspace run.
     * 
     * @param {string} workspace - Workspace name.
     * @param {*} filePath - Path to tar.gz file with Terraform configuration.
     */

  }, {
    key: "run",
    value: function run(workspace, filePath) {
      var workspaceId, uploadUrl, runId;
      return _regenerator["default"].async(function run$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _regenerator["default"].awrap(this._checkWorkspace(workspace));

            case 2:
              workspaceId = _context5.sent;
              _context5.next = 5;
              return _regenerator["default"].awrap(this._createConfigVersion(workspaceId));

            case 5:
              uploadUrl = _context5.sent;
              _context5.next = 8;
              return _regenerator["default"].awrap(this._uploadConfiguration(uploadUrl, filePath));

            case 8:
              runId = this._run(); //this._watch()
              //TODO - exit status

              return _context5.abrupt("return", runId);

            case 10:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }]);
  return Terraform;
}(); //curl -s --header "Authorization: Bearer $token" --header "Content-Type: application/vnd.api+json" --data @configversion.json "https://${ADDRESS}/api/v2/workspaces/${workspace_id}/configuration-versions")


exports["default"] = Terraform;