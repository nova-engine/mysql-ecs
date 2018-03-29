import "reflect-metadata";
import "mocha";
import "chai-as-promised";
import { expect } from "chai";
import * as dotenv from "dotenv";
import * as mysql from "mysql2";

import { Component, Entity } from "@nova-engine/ecs";

import { Database } from "./Database";
import { Persistent } from "./decorators/Persistent";
import { Field } from "./decorators/Field";

dotenv.config();

function recreateDatabase(name: string) {
  const connection = mysql.createConnection({
    host: process.env.DB_TEST_HOST,
    port: parseInt(process.env.DB_TEST_PORT || "3306", 10) || 3306,
    user: process.env.DB_TEST_USER,
    password: process.env.DB_TEST_PASSWORD
  });
  return new Promise((resolve, reject) => {
    connection.query(`DROP DATABASE IF EXISTS ${name}`, error => {
      if (error) return reject(error);
      connection.query(`CREATE DATABASE ${name}`, error => {
        if (error) return reject(error);
        connection.end(error => (error ? reject(error) : resolve()));
      });
    });
  });
}

function connect(name: string) {
  return new Database({
    connectionLimit: 10,
    host: process.env.DB_TEST_HOST,
    port: parseInt(process.env.DB_TEST_PORT || "3306", 10) || 3306,
    user: process.env.DB_TEST_USER,
    password: process.env.DB_TEST_PASSWORD,
    database: name
  });
}

describe("Database persistence", function() {
  it("Should sync a database", function() {
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
      await recreateDatabase(process.env.DB_TEST1_NAME);
      const db = connect(process.env.DB_TEST1_NAME);
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
  it("Should create new entities", function() {
    async function test() {
      await recreateDatabase(process.env.DB_TEST2_NAME);
      const db = connect(process.env.DB_TEST2_NAME);
      try {
        await db.sync();
        for (let i = 0; i < 10; ++i) {
          let entity = await db.create();
          expect(() => entity.id).to.not.throw();
          expect(entity.id).to.be.a("string");
        }
        await db.close();
      } catch (e) {
        await db.close();
        throw e;
      }
    }
    return test();
  });
  it("Should save entities with components", function() {
    async function test() {
      await recreateDatabase(process.env.DB_TEST3_NAME);
      @Persistent()
      class Position implements Component {
        @Field() x: number = 0;
        @Field() y: number = 0;
      }
      @Persistent()
      class Velocity implements Component {
        @Field() x: number = 0;
        @Field() y: number = 0;
      }
      class NonPersistent implements Component {
        nonPersistent: boolean = true;
      }
      const entity = new Entity();
      entity.putComponent(Position);
      entity.putComponent(Velocity);
      entity.putComponent(NonPersistent);
      const vel = entity.getComponent(Velocity);
      vel.x = 16;
      vel.y = 4;
      const pos = entity.getComponent(Position);
      pos.x = 2;
      pos.y = 8;
      const db = connect(process.env.DB_TEST3_NAME);
      try {
        db.addComponentTypes(Position, Velocity);
        await db.sync();
        // This should be an insert
        await db.save(entity);
        // This should be an update
        await db.save(entity);
        // This should be another insert
        await db.save(new Entity());
        await db.close();
      } catch (e) {
        await db.close();
        throw e;
      }
    }
    return test();
  });
  it("Should load the entity correctly", function() {
    async function test() {
      await recreateDatabase(process.env.DB_TEST4_NAME);
      @Persistent()
      class Position implements Component {
        @Field() posX: number = 0;
        @Field() posY: number = 0;
      }
      @Persistent()
      class Velocity implements Component {
        @Field() velX: number = 0;
        @Field() velY: number = 0;
      }
      const db = connect(process.env.DB_TEST4_NAME);
      const entity1 = new Entity();
      const entity2 = new Entity();
      const pos = entity1.putComponent(Position);
      const vel1 = entity1.putComponent(Velocity);
      pos.posX = 1;
      pos.posY = 2;
      vel1.velX = 3;
      vel1.velY = 4;
      const vel2 = entity2.putComponent(Velocity);
      vel2.velX = 5;
      vel2.velY = 6;
      try {
        db.addComponentTypes(Position, Velocity);
        await db.sync();
        await db.save(entity1);
        await db.save(entity2);
        const results1 = await db.findByComponents({
          include: [Position],
          exclude: []
        });
        const results2 = await db.findByComponents({
          include: [Velocity],
          exclude: []
        });
        expect(results1.length).to.be.equals(1);
        expect(results2.length).to.be.equals(2);
        expect(() => {
          const entity = results1[0];
          const pos = entity.getComponent(Position);
          const vel = entity.getComponent(Velocity);
          expect(pos.posX).to.be.equals(1);
          expect(pos.posY).to.be.equals(2);
          expect(vel.velX).to.be.equals(3);
          expect(vel.velY).to.be.equals(4);
        }).to.not.throw();
        expect(() => {
          for (let entity of results2) {
            entity.getComponent(Position);
          }
        }).to.throw();
        await db.close();
      } catch (e) {
        await db.close();
        throw e;
      }
    }
    return test();
  });
});
