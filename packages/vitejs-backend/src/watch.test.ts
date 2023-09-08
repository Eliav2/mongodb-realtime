// sum.test.js
import { expect, test } from 'vitest'
import {MongoClient} from "mongodb";
// import { sum } from './sum'

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, {});
const db = client.db('realtime');

await client.connect().then(async (client) => {

})

test('aggergation', async () => {
    const usersCollection = db.collection('users');
    const userFilter = { age: { $lt: 28 } };

    await db.command({
        collMod: "users",
        validator: {},
        changeStreamPreAndPostImages:{
            enabled: true
        }
    });
    expect(1).toBe(1)
})