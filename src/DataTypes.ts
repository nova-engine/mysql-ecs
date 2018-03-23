import * as extend from "extend";
import * as moment from "moment";

interface DataType {
  db: string;
  serialize(value: any): Promise<any>;
  deserialize(value: any): Promise<any>;
}

const ID = {
  db: "BIGINT",
  async serialize(value: number) {
    return value;
  },
  async deserialize(value: number) {
    return value;
  }
};

const BOOLEAN = {
  db: "ENUM('Y', 'N')",
  async serialize(value: boolean) {
    return value ? "Y" : "N";
  },
  async deserialize(value: string) {
    return value === "Y";
  }
};

const NUMBER = extend(
  (isFloat = false) => {
    return {
      db: isFloat ? "FLOAT" : "DOUBLE",
      async serialize(value: number) {
        return value;
      },
      async deserialize(value: number) {
        return value;
      }
    };
  },
  {
    db: "DOUBLE",
    async serialize(value: number) {
      return value;
    },
    async deserialize(value: number) {
      return value;
    }
  }
);

const STRING = extend(
  (length = 255) => {
    if (length < 1 || length > 255) {
      throw new Error(
        "Database String types should be between 1 up to 255.\nIf you require bigger values consider using TEXT."
      );
    }
    return {
      db: `VARCHAR(${length})`,
      async serialize(value: string) {
        return value;
      },
      async deserialize(value: string) {
        return value;
      }
    };
  },
  {
    db: "VARCHAR(255)",
    async serialize(value: string) {
      return value;
    },
    async deserialize(value: string) {
      return value;
    }
  }
);

const DATE = {
  db: "DATETIME",
  async serialize(value: Date) {
    return moment(value).format("YYYY-MM-DD HH:mm:ss");
  },
  async deserialize(value: Date) {
    return value;
  }
};

const BLOB = extend(() => {}, {
  db: "BLOB",
  async serialize(value: Buffer) {
    return value;
  },
  async deserialize(value: Buffer) {
    return value;
  }
});

const typeJSON = {
  db: "TEXT",
  async serialize(value: any) {
    return JSON.stringify(value);
  },
  async deserialize(value: string) {
    return JSON.parse(value);
  }
};

const DataTypes = {
  ID,
  NUMBER,
  STRING,
  BOOLEAN,
  DATE,
  JSON: typeJSON,
  BLOB
};

export { DataTypes, DataType };
