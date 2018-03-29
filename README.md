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

You must then add all components your database must persist:

```ts
db.addComponentType(MyComponent);
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

All methods are async so you can wait untill they are resolved using await
or using attach then/catch callbacks.

## Testing

Because this library is meant to be used with mysql, you will need to use a
development server to test it:

Install MySQL in your computer (or use a remote server)

Create a .ENV file at the root of this project.

Add the following values to your .ENV file:

```
DB_TEST1_NAME=mydb_test1
DB_TEST2_NAME=mydb_test2
DB_TEST3_NAME=mydb_test3
DB_TEST4_NAME=mydb_test4
DB_TEST_USER=test_user
DB_TEST_PASSWORD=test_password
DB_TEST_HOST=localhost
DB_TEST_PORT=3306
```

You may need to change them according to your settings.

## License

Apache 2.0
