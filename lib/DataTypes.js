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
Object.defineProperty(exports, "__esModule", { value: true });
var extend = require("extend");
var moment = require("moment");
var BlobSize;
(function (BlobSize) {
    BlobSize[BlobSize["TINY"] = 0] = "TINY";
    BlobSize[BlobSize["REGULAR"] = 1] = "REGULAR";
    BlobSize[BlobSize["MEDIUM"] = 2] = "MEDIUM";
    BlobSize[BlobSize["LONG"] = 3] = "LONG";
})(BlobSize || (BlobSize = {}));
exports.BlobSize = BlobSize;
function blobBySize(size) {
    switch (size) {
        case BlobSize.TINY:
            return "TINYBLOB";
        case BlobSize.REGULAR:
            return "BLOB";
        case BlobSize.MEDIUM:
            return "MEDIUMBLOB";
        case BlobSize.LONG:
            return "LONGBLOB";
    }
    return "BLOB";
}
function textBySize(size) {
    switch (size) {
        case BlobSize.TINY:
            return "TINYTEXT";
        case BlobSize.REGULAR:
            return "TEXT";
        case BlobSize.MEDIUM:
            return "MEDIUMTEXT";
        case BlobSize.LONG:
            return "LONGTEXT";
    }
    return "TEXT";
}
var ID = {
    db: "BIGINT",
    serialize: function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, value];
            });
        });
    },
    deserialize: function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, value];
            });
        });
    }
};
var BOOLEAN = {
    db: "ENUM('Y', 'N')",
    serialize: function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, value ? "Y" : "N"];
            });
        });
    },
    deserialize: function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, value === "Y"];
            });
        });
    }
};
var NUMBER = extend(function (isFloat) {
    if (isFloat === void 0) { isFloat = false; }
    return {
        db: isFloat ? "FLOAT" : "DOUBLE",
        serialize: function (value) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, value];
                });
            });
        },
        deserialize: function (value) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, value];
                });
            });
        }
    };
}, {
    db: "DOUBLE",
    serialize: function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, value];
            });
        });
    },
    deserialize: function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, value];
            });
        });
    }
});
var STRING = extend(function (length) {
    if (length === void 0) { length = 255; }
    if (length < 1 || length > 255) {
        throw new Error("Database String types should be between 1 up to 255.\nIf you require bigger values consider using TEXT.");
    }
    return {
        db: "VARCHAR(" + length + ")",
        serialize: function (value) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, value];
                });
            });
        },
        deserialize: function (value) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, value];
                });
            });
        }
    };
}, {
    db: "VARCHAR(255)",
    serialize: function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, value];
            });
        });
    },
    deserialize: function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, value];
            });
        });
    }
});
var DATE = {
    db: "DATETIME",
    serialize: function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, moment(value).format("YYYY-MM-DD HH:mm:ss")];
            });
        });
    },
    deserialize: function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, value];
            });
        });
    }
};
var BLOB = extend(function (size) {
    if (size === void 0) { size = BlobSize.REGULAR; }
    return {
        db: blobBySize(size),
        serialize: function (value) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, value];
                });
            });
        },
        deserialize: function (value) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, value];
                });
            });
        }
    };
}, {
    db: "BLOB",
    serialize: function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, value];
            });
        });
    },
    deserialize: function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, value];
            });
        });
    }
});
var typeJSON = extend(function (size) {
    if (size === void 0) { size = BlobSize.REGULAR; }
    return {
        db: textBySize(size),
        serialize: function (value) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, JSON.stringify(value)];
                });
            });
        },
        deserialize: function (value) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2, JSON.parse(value)];
                });
            });
        }
    };
}, {
    db: "TEXT",
    serialize: function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, JSON.stringify(value)];
            });
        });
    },
    deserialize: function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, JSON.parse(value)];
            });
        });
    }
});
var SERIALIZABLE = function (serializable, size) {
    if (size === void 0) { size = BlobSize.REGULAR; }
    return {
        db: textBySize(size),
        serialize: function (value) {
            return value.serialize();
        },
        deserialize: function (value) {
            return serializable.deserialize(value);
        }
    };
};
var DataTypes = {
    ID: ID,
    NUMBER: NUMBER,
    STRING: STRING,
    BOOLEAN: BOOLEAN,
    DATE: DATE,
    JSON: typeJSON,
    BLOB: BLOB,
    SERIALIZABLE: SERIALIZABLE
};
exports.DataTypes = DataTypes;
//# sourceMappingURL=DataTypes.js.map