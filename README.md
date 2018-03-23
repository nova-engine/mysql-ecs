# Nova Engine - Entity Component System Persistent Engine (MySQL)

A Database persistence system for the Entities and Components in MySQL.

## Installing

```sh
npm i --save @nova-engine/mysql-ecs reflect-metadata mysql2
```

## Basic Use

Enable decorators in your tsconfig.json:

```js
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        // ... more options ...
    }
}
```

When you define a Component using @nova-engine/ecs, you must do two things:

Add a `@Persistent()` decorator to your component class.
This means than your component must be stored in the database.

For each field you must preserve, add a `@Field()` tag.

```ts
import { Component } from "@nova-engine/ecs";
import { Persistent, Field } from "@nova-engine/mysql-ecs";

@Persistent()
class PersistentComponent implements Component {
  @Field() tag: string;
  @Field() x: number;
  @Field() y: number;
}
```

The persistent engine will then underscore and pluralize your component name,
in this example `"PersistentComponent"` will become `"persistent_components"`.

The `@Field` decorator will try to detect the type automatically type.

Remember, properties without `@Field` decorator won't persisnt on the database.

After that, you create your database instance:

```ts
import { Database } from "@nova-engine/mysql-ecs";

const db = new Database({
  /* options */
});
```

And then you can simply CRUD your entities:

```ts
// Convenience method to create a new empty entity and
// store it on the database
// Because of that, it will have an ID already generated for you.
db.create(entity);
// This will create a new entity if it doesn't exists, or
// update the existent one.
db.save(entity);
// This will update your entity
// It will throw an error if your entity is not previously saved
db.update(entity);
// Will remove the entity from the database
// It will throw an error if the entity is not stored or is a new one
db.delete(entity);
```

## License

Apache 2.0
