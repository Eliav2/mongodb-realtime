import { updateDocsHash } from "./updateDocsHash";
import { expect, test, describe, beforeEach } from "vitest";
import { ChangeStreamDocument } from "shared/types";

describe("MongoDB Update Operations dry tests", () => {
  test("insert operation", () => {
    const docs = {};
    const update = {
      operationType: "insert",
      documentKey: { _id: "1" },
      fullDocument: { _id: "1", name: "John Doe", age: 30 },
    } as unknown as ChangeStreamDocument;

    const result = updateDocsHash(docs, update);

    expect(result).toEqual({
      "1": { _id: "1", name: "John Doe", age: 30 },
    });
  });

  test("update operation with updatedFields", () => {
    const docs = {
      "1": { _id: "1", name: "John Doe", age: 30 },
    };

    const update = {
      operationType: "update",
      documentKey: { _id: "1" },
      updateDescription: {
        updatedFields: { age: 33, name: "Jane Doe" },
        removedFields: [],
        truncatedArrays: [],
      },
    } as unknown as ChangeStreamDocument;

    const result = updateDocsHash(docs, update);

    expect(result).toEqual({
      "1": { _id: "1", name: "Jane Doe", age: 33 },
    });
  });

  test("update operation with removedFields", () => {
    const docs = {
      "1": { _id: "1", name: "John Doe", age: 30 },
    };

    const update = {
      operationType: "update",
      documentKey: { _id: "1" },
      updateDescription: {
        updatedFields: {},
        removedFields: ["name"],
        truncatedArrays: [],
      },
    } as unknown as ChangeStreamDocument;

    const result = updateDocsHash(docs, update);

    expect(result).toEqual({
      "1": { _id: "1", age: 30 },
    });
  });

  test("update operation with truncatedArrays", () => {
    const docs = {
      "1": {
        _id: "1",
        name: "John Doe",
        hobbies: ["Reading", "Gardening", "Traveling"],
      },
    };

    const update = {
      operationType: "update",
      documentKey: { _id: "1" },
      updateDescription: {
        updatedFields: {},
        removedFields: [],
        truncatedArrays: ["hobbies"],
      },
    } as unknown as ChangeStreamDocument;

    const result = updateDocsHash(docs, update);

    expect(result).toEqual({
      "1": { _id: "1", name: "John Doe", hobbies: ["Reading", "Gardening"] },
    });
  });

  test("delete operation", () => {
    const docs = {
      "1": { _id: "1", name: "John Doe", age: 30 },
    };

    const update = {
      operationType: "delete",
      documentKey: { _id: "1" },
    } as unknown as ChangeStreamDocument;

    const result = updateDocsHash(docs, update);

    expect(result).toEqual({});
  });

  test("replace operation", () => {
    const docs = {
      "1": { _id: "1", name: "John Doe", age: 30 },
    };

    const update = {
      operationType: "replace",
      documentKey: { _id: "1" },
      fullDocument: { _id: "1", name: "Jane Doe", age: 33 },
    } as unknown as ChangeStreamDocument;

    const result = updateDocsHash(docs, update);

    expect(result).toEqual({
      "1": { _id: "1", name: "Jane Doe", age: 33 },
    });
  });
});

import { Collection, MongoClient } from "mongodb";
import { MongoRealtimeIOServer } from "@mongodb-realtime/server";
// Test Suite
describe("MongoDB Update Operations wet test", () => {
  // Connect to MongoDB
  const mongoUri = "mongodb://localhost:27017/realtime";
  const mongoClient = new MongoClient(mongoUri);
  const db = mongoClient.db();
  const collection: Collection<{ name: string; age: number }> =
    db.collection("testCollection");

  const mongoRealtime = new MongoRealtimeIOServer({
    mongoUri,
    ServerOptions: {
      cors: {
        origin: "http://localhost:5173",
      },
    },
  });

  beforeEach(async () => {
    const document = { _id: "1", name: "John Doe", age: 30 };
    await collection.insertOne(document);

    // clean up function, called once after each test run
    return async () => {
      await collection.deleteOne({ _id: "1" });
    };
  });

  // Insert Operation
  test("Insert Operation", async () => {
    const insertedDocument = await collection.findOne({ _id: "1" });

    expect(insertedDocument).toEqual({ _id: "1", name: "John Doe", age: 30 });
  });

  // Delete Operation
  test("Delete Operation", async () => {
    const deleteResult = await collection.deleteOne({ _id: "1" });

    const deletedDocument = await collection.findOne({ _id: "1" });

    expect(deleteResult.deletedCount).toBe(1);
    expect(deletedDocument).toBe(null);
  });

  // Update Operation
  describe("Update Operation", async () => {
    test("Update Operation with updatedFields", async () => {
      const updateResult = await collection.updateOne(
        { _id: "1" },
        { $set: { age: 33, name: "Jane Doe" } },
      );

      const updatedDocument = await collection.findOne({ _id: "1" });

      expect(updateResult.modifiedCount).toBe(1);
      expect(updatedDocument).toEqual({ _id: "1", name: "Jane Doe", age: 33 });
    });

    test("Update Operation with removedFields", async () => {
      const updateResult = await collection.updateOne(
        { _id: "1" },
        { $unset: { age: "" } },
      );

      const updatedDocument = await collection.findOne({ _id: "1" });

      expect(updateResult.modifiedCount).toBe(1);
      expect(updatedDocument).toEqual({ _id: "1", name: "Jane Doe" });
    });

    test("Update Operation with truncatedArrays", async () => {
      const updateResult = await collection.updateOne(
        { _id: "1" },
        { $push: { hobbies: { $each: ["Swimming", "Cooking"], $slice: 2 } } },
      );

      const updatedDocument = await collection.findOne({ _id: "1" });

      expect(updateResult.modifiedCount).toBe(1);
      expect(updatedDocument).toEqual({
        _id: "1",
        name: "Jane Doe",
        hobbies: ["Gardening", "Reading"],
      });
    });

    // const updateResult = await collection.updateOne(
    //   { _id: "1" },
    //   { $set: { age: 33 } },
    // );
    //
    // const updatedDocument = await collection.findOne({ _id: "1" });
    //
    // expect(updateResult.modifiedCount).toBe(1);
    // expect(updatedDocument.age).toBe(33);
  });
});
