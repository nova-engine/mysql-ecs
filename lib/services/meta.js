"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataTypes_1 = require("../DataTypes");
var extend = require("extend");
var KEY = "@nova-engine/mysql-ecs/persistent";
function ensurePersistentMetadata(target) {
    var meta = Reflect.getMetadata(KEY, target);
    if (meta) {
        return meta;
    }
    meta = {
        tableName: null,
        fields: {
            id: {
                type: DataTypes_1.DataTypes.ID,
                property: "id",
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            }
        }
    };
    Reflect.defineMetadata(KEY, meta, target);
    return meta;
}
exports.ensurePersistentMetadata = ensurePersistentMetadata;
function getPersistentMetadata(target) {
    return Reflect.getMetadata(KEY, target);
}
exports.getPersistentMetadata = getPersistentMetadata;
function updatePersistentMetadata(target, value) {
    var meta = ensurePersistentMetadata(target);
    extend(true, meta, value);
}
exports.updatePersistentMetadata = updatePersistentMetadata;
function getDatabaseTypeFromMetadata(target, property) {
    var type = Reflect.getMetadata("design:type", target, property);
    switch (type) {
        case String:
            return DataTypes_1.DataTypes.STRING;
        case Number:
            return DataTypes_1.DataTypes.NUMBER;
        case Boolean:
            return DataTypes_1.DataTypes.BOOLEAN;
        case Date:
            return DataTypes_1.DataTypes.DATE;
        case Buffer:
            return DataTypes_1.DataTypes.BLOB;
        case Object:
            return DataTypes_1.DataTypes.JSON;
        case Function:
            throw new Error("Function type property \"" + property + "\" cannot be persistent.");
    }
    return DataTypes_1.DataTypes.JSON;
}
exports.getDatabaseTypeFromMetadata = getDatabaseTypeFromMetadata;
//# sourceMappingURL=meta.js.map