"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ecs_1 = require("@nova-engine/ecs");
var DatabaseEntity = (function (_super) {
    __extends(DatabaseEntity, _super);
    function DatabaseEntity(db) {
        var _this = _super.call(this) || this;
        _this._db = db;
        return _this;
    }
    DatabaseEntity.prototype.putComponent = function (componentClass) {
        var result = _super.prototype.putComponent.call(this, componentClass);
        return result;
    };
    DatabaseEntity.prototype.removeComponent = function (componentClass) {
        _super.prototype.removeComponent.call(this, componentClass);
    };
    return DatabaseEntity;
}(ecs_1.Entity));
exports.DatabaseEntity = DatabaseEntity;
//# sourceMappingURL=DatabaseEntity.js.map