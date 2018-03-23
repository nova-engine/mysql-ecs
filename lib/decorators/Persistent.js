"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pluralize = require("pluralize");
var s = require("underscore.string");
var meta_1 = require("../services/meta");
function Persistent(options) {
    if (options === void 0) { options = {}; }
    return function (target) {
        var defaultOptions = {
            tableName: pluralize(s.underscored(s.trim(target.tag || target.name)))
        };
        meta_1.updatePersistentMetadata(target.prototype, defaultOptions);
        meta_1.updatePersistentMetadata(target.prototype, options);
    };
}
exports.Persistent = Persistent;
//# sourceMappingURL=Persistent.js.map