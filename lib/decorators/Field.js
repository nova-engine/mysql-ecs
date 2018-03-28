"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var meta_1 = require("../services/meta");
var s = require("underscore.string");
var extend = require("extend");
function isDataType(arg) {
    if (typeof arg.db != "string")
        return false;
    if (typeof arg.serialize != "function")
        return false;
    if (typeof arg.deserialize != "function")
        return false;
    return true;
}
function Field(arg) {
    if (arg === void 0) { arg = {}; }
    var options;
    if (isDataType(arg)) {
        options = { type: arg };
    }
    else {
        options = arg;
    }
    return function (target, property, descriptor) {
        var meta = meta_1.ensurePersistentMetadata(target);
        var column = options.column, defaultOptions = __rest(options, ["column"]);
        var type = meta_1.getDatabaseTypeFromMetadata(target, property);
        var metaOptions = extend({ type: type, primaryKey: false, allowNull: false, autoIncrement: false }, defaultOptions, options, { property: property });
        if (!column) {
            column = s.underscored(property);
        }
        column = column.replace(/`/gi, "");
        if (column.toLowerCase() == "entity_id") {
            throw new Error("You cannot have 'entity_id' as a component property. It is a reserved property.");
        }
        if (column.toLowerCase() == "created_at") {
            throw new Error("You cannot have 'created_at' as a component property. It is a reserved property.");
        }
        if (column.toLowerCase() == "updated_at") {
            throw new Error("You cannot have 'updated_at' as a component property. It is a reserved property.");
        }
        meta.fields[column] = metaOptions;
    };
}
exports.Field = Field;
//# sourceMappingURL=Field.js.map