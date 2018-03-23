interface DataType {
  js: Function;
  db: string;
}

const ID = {
  js: Number,
  db: "BIGINT"
};

const NUMBER = {
  js: Number,
  db: "DOUBLE"
};

const DataTypes = {
  ID,
  NUMBER
};

export { DataTypes, DataType };
