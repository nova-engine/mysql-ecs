"use strict";
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
var mysql = require("mysql2");
var meta_1 = require("./services/meta");
var DatabaseConnection = (function () {
    function DatabaseConnection(connection) {
        this._connection = connection;
        this._inTransaction = false;
        this._closed = false;
    }
    DatabaseConnection.prototype.query = function (query, params) {
        var _this = this;
        if (params === void 0) { params = null; }
        var error = new Error("Connection is closed");
        return new Promise(function (resolve, reject) {
            if (_this._closed)
                return reject(error);
            if (params) {
                return _this._connection.query(query, params, function (error, results) {
                    if (error)
                        return reject(error);
                    resolve(results);
                });
            }
            _this._connection.query(query, function (error, results) {
                if (error)
                    return reject(error);
                resolve(results);
            });
        });
    };
    DatabaseConnection.prototype.beginTransaction = function () {
        var _this = this;
        var error = new Error("Connection is closed");
        this._inTransaction = true;
        return new Promise(function (resolve, reject) {
            if (_this._closed)
                return reject(error);
            _this._connection.beginTransaction(function (err) {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    };
    DatabaseConnection.prototype.commit = function () {
        var _this = this;
        this._inTransaction = false;
        var error = new Error("Connection is closed");
        return new Promise(function (resolve, reject) {
            if (_this._closed)
                return reject(error);
            _this._connection.commit(function (err) {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    };
    DatabaseConnection.prototype.rollback = function () {
        var _this = this;
        this._inTransaction = false;
        var error = new Error("Connection is closed");
        return new Promise(function (resolve, reject) {
            if (_this._closed)
                return reject(error);
            _this._connection.rollback(resolve);
        });
    };
    DatabaseConnection.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._inTransaction) return [3, 2];
                        this._inTransaction = false;
                        return [4, this.rollback()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this._connection.release();
                        this._closed = true;
                        return [2];
                }
            });
        });
    };
    DatabaseConnection.prototype.release = function () {
        return this.close();
    };
    Object.defineProperty(DatabaseConnection.prototype, "inTransaction", {
        get: function () {
            return this._inTransaction;
        },
        enumerable: true,
        configurable: true
    });
    return DatabaseConnection;
}());
exports.DatabaseConnection = DatabaseConnection;
var Database = (function () {
    function Database(options) {
        this._models = [];
        var poolOptions = __rest(options, []);
        this.pool = mysql.createPool(poolOptions);
    }
    Database.prototype.connect = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.pool.getConnection(function (err, connection) {
                if (err)
                    return reject(err);
                resolve(new DatabaseConnection(connection));
            });
        });
    };
    Database.prototype.sync = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Not Implemented");
            });
        });
    };
    Database.prototype.save = function (entity, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var newEntity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!entity.isNew()) return [3, 2];
                        return [4, this.create(options)];
                    case 1:
                        newEntity = _a.sent();
                        entity.id = newEntity.id;
                        _a.label = 2;
                    case 2: return [4, this.update(entity, options)];
                    case 3:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Database.prototype.update = function (entity, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var connection, _a, inTransaction, components, _i, components_1, _b, type, component, meta, e_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.connection;
                        if (_a) return [3, 2];
                        return [4, this.connect()];
                    case 1:
                        _a = (_c.sent());
                        _c.label = 2;
                    case 2:
                        connection = _a;
                        inTransaction = connection.inTransaction;
                        if (!!inTransaction) return [3, 4];
                        return [4, connection.beginTransaction()];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 11, , 14]);
                        components = entity.listComponentsWithTypes();
                        _i = 0, components_1 = components;
                        _c.label = 5;
                    case 5:
                        if (!(_i < components_1.length)) return [3, 8];
                        _b = components_1[_i], type = _b.type, component = _b.component;
                        meta = meta_1.getPersistentMetadata(type.prototype);
                        if (!meta) return [3, 7];
                        return [4, this._updateInDatabase(connection, meta, component)];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        _i++;
                        return [3, 5];
                    case 8:
                        if (!!inTransaction) return [3, 10];
                        return [4, connection.commit()];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10: return [3, 14];
                    case 11:
                        e_1 = _c.sent();
                        if (!!options.connection) return [3, 13];
                        return [4, connection.release()];
                    case 12:
                        _c.sent();
                        _c.label = 13;
                    case 13: throw e_1;
                    case 14: return [2];
                }
            });
        });
    };
    Database.prototype._updateInDatabase = function (connection, meta, component) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!meta.tableName) {
                    throw new Error("Persistent components must have the @Persistent() tag aside for the @Field() tags required for each field.");
                }
                throw new Error("Not implemented");
            });
        });
    };
    Database.prototype.delete = function (entity, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Not Implemented");
            });
        });
    };
    Database.prototype.create = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Not Implemented");
            });
        });
    };
    Database.prototype.addComponentType = function (component) {
        var meta = meta_1.getPersistentMetadata(component.prototype);
        if (!meta || !meta.tableName) {
            throw new Error("Database models must have a @Persistent decorator");
        }
        var tag = component.tag || component.name;
        if (this._models.indexOf(meta) !== -1) {
            throw new Error("Database already has the model \"" + tag + "\" already registered.");
        }
        this._models.push(meta);
        return this;
    };
    Database.prototype.addComponentTypes = function () {
        var components = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            components[_i] = arguments[_i];
        }
        for (var _a = 0, components_2 = components; _a < components_2.length; _a++) {
            var c = components_2[_a];
            this.addComponentType(c);
        }
        return this;
    };
    return Database;
}());
exports.Database = Database;
//# sourceMappingURL=Database.js.map