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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ecs_1 = require("@nova-engine/ecs");
var Database_1 = require("./Database");
var DatabaseEntity_1 = require("./DatabaseEntity");
var DatabaseEngine = (function (_super) {
    __extends(DatabaseEngine, _super);
    function DatabaseEngine(options) {
        var _this = _super.call(this) || this;
        _this.onEntityChange = function (entity) {
            _this._queue.push({ type: "save", entity: entity });
        };
        _this._db = new Database_1.Database(options);
        _this._queue = [];
        return _this;
    }
    DatabaseEngine.create = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var engine;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        engine = new DatabaseEngine(options);
                        return [4, engine.load()];
                    case 1:
                        _a.sent();
                        return [2, engine];
                }
            });
        });
    };
    DatabaseEngine.prototype.processQueue = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var connection, _a, newOptions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = options.connection;
                        if (_a) return [3, 2];
                        return [4, this._db.connect()];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        connection = _a;
                        newOptions = __assign({}, options, { connection: connection });
                        return [4, connection.nestedTransaction(function () { return __awaiter(_this, void 0, void 0, function () {
                                var queue, action;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            queue = this._queue;
                                            this._queue = [];
                                            _a.label = 1;
                                        case 1:
                                            if (!(queue.length > 0)) return [3, 4];
                                            action = queue.shift();
                                            if (!action) return [3, 3];
                                            return [4, this._processAction(action, newOptions)];
                                        case 2:
                                            _a.sent();
                                            _a.label = 3;
                                        case 3: return [3, 1];
                                        case 4: return [2];
                                    }
                                });
                            }); })];
                    case 3:
                        _b.sent();
                        return [2];
                }
            });
        });
    };
    DatabaseEngine.prototype._processAction = function (action, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = action.type;
                        switch (_a) {
                            case "save": return [3, 1];
                            case "remove": return [3, 3];
                        }
                        return [3, 5];
                    case 1: return [4, this._db.save(action.entity, options)];
                    case 2: return [2, _b.sent()];
                    case 3: return [4, this._db.delete(action.entity, options)];
                    case 4: return [2, _b.sent()];
                    case 5: return [3, 6];
                    case 6: return [2];
                }
            });
        });
    };
    DatabaseEngine.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var entities;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this._db.findByComponents()];
                    case 1:
                        entities = _a.sent();
                        this.addEntities.apply(this, entities);
                        return [2];
                }
            });
        });
    };
    DatabaseEngine.prototype.save = function () {
        return __awaiter(this, void 0, void 0, function () {
            var entities, _i, entities_1, entity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        entities = this.entities;
                        _i = 0, entities_1 = entities;
                        _a.label = 1;
                    case 1:
                        if (!(_i < entities_1.length)) return [3, 4];
                        entity = entities_1[_i];
                        return [4, this._db.save(entity)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3, 1];
                    case 4: return [2];
                }
            });
        });
    };
    DatabaseEngine.prototype.addEntity = function (entity) {
        this._queue.push({ type: "save", entity: entity });
        entity.addListener(this.onEntityChange);
        return _super.prototype.addEntity.call(this, entity);
    };
    DatabaseEngine.prototype.createEntity = function (options) {
        if (options === void 0) { options = {}; }
        var entity = new DatabaseEntity_1.DatabaseEntity(this._db);
        this.addEntity(entity);
        return entity;
    };
    DatabaseEngine.prototype.removeEntity = function (entity) {
        _super.prototype.removeEntity.call(this, entity);
        entity.removeListener(this.onEntityChange);
        this._queue.push({ type: "remove", entity: entity });
    };
    return DatabaseEngine;
}(ecs_1.Engine));
exports.DatabaseEngine = DatabaseEngine;
//# sourceMappingURL=DatabaseEngine.js.map