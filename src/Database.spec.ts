import "reflect-metadata";
import "mocha";
import "chai-as-promised";
import { expect } from "chai";
import * as dotenv from "dotenv";
import * as mysql from "mysql2";

import { Component } from "@nova-engine/ecs";

import { Database } from "./Database";
import { Persistent } from "./decorators/Persistent";
import { Field } from "./decorators/Field";

dotenv.config();

describe("Database persistence", function() {
  it("Should sync a database", function() {
    function recreateDatabase() {
      const connection = mysql.createConnection({
        host: process.env.DB_TEST_HOST,
        port: parseInt(process.env.DB_TEST_PORT || "3306", 10) || 3306,
        user: process.env.DB_TEST_USER,
        password: process.env.DB_TEST_PASSWORD
      });
      return new Promise((resolve, reject) => {
        const name = process.env.DB_TEST1_NAME;
        connection.query(`DROP DATABASE IF EXISTS ${name}`, error => {
          if (error) return reject(error);
          connection.query(`CREATE DATABASE ${name}`, error => {
            if (error) return reject(error);
            connection.end(error => (error ? reject(error) : resolve()));
          });
        });
      });
    }

    async function test() {
      @Persistent()
      class Persistent1 implements Component {
        @Field() x: number = 0;
        @Field() y: number = 0;
      }

      @Persistent()
      class Persistent2 implements Component {
        @Field() a: number = 0;
        @Field() b: number = 0;
      }
      await recreateDatabase();
      const db = new Database({
        connectionLimit: 10,
        host: process.env.DB_TEST_HOST,
        port: parseInt(process.env.DB_TEST_PORT || "3306", 10) || 3306,
        user: process.env.DB_TEST_USER,
        password: process.env.DB_TEST_PASSWORD,
        database: process.env.DB_TEST1_NAME
      });
      try {
        db.addComponentTypes(Persistent1, Persistent2);
        await db.sync();
        await db.close();
      } catch (e) {
        await db.close();
        throw e;
      }
    }
    return test();
  });
});
