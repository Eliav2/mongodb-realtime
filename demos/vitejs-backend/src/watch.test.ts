// sum.test.js
import { expect, test } from "vitest";
import { MongoClient } from "mongodb";

import { watchCollection } from "./watchCollection";
// import { sum } from './sum'

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, {});
const db = client.db("realtime");

await client.connect().then(async (client) => {});
const usersCollection = db.collection("users");

await db.command({
  collMod: "users",
  validator: {},
  changeStreamPreAndPostImages: {
    enabled: true,
  },
});
test("mongo aggression", async () => {
  const userFilter = { age: { $lt: 28 } };

  let users = [];
  await watchCollection(usersCollection, (updatedDocuments) => {
    console.log("users updated");
    users = updatedDocuments;
  });
  expect(1).toBe(1);
});
