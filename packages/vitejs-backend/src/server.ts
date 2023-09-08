import express from 'express'
import http from 'http'
import WebSocket from 'ws'
import {MongoClient} from 'mongodb'


const app = express();
const server = http.createServer(app);
// const wss = new WebSocket.Server({server});
const wss = new WebSocket.Server({noServer: true});

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, {});

wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('message', (message) => {
        console.log('message received: ' + message)
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

server.on('upgrade', (request, socket, head) => {
    console.log('Parsing session from request...')
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

app.use('/src', express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


let users = []

const initializeMongo = async () => {
    const db = client.db('realtime');
    const usersCollection = db.collection('users');

    // // enable preAndPostImages for change stream
    // await db.command({
    //     setClusterParameter: {
    //         changeStreamOptions: {
    //             preAndPostImages: {
    //                 expireAfterSeconds: 100
    //             }
    //         }
    //     }
    // });
    await db.command({
        collMod: "users",
        validator: {},
        changeStreamPreAndPostImages:{
            enabled: true
        }
    });

    // age smaller than 28

    //
    const userFilter = { age: { $lt: 28 } };
    const match = {
        $match: {
            $or: [{
                $and: [
                    {"fullDocumentBeforeChange": userFilter},
                    // { $expr: { $lt: ["$fullDocumentBeforeChange.age", 28] } },
                    {operationType: "update"}
                ]
            }]
        }
    }

    const changeStream = usersCollection.watch([
        {
            $replaceRoot: {
                newRoot: "$fullDocumentBeforeChange"
            }
        },
        // match
    ], {
        fullDocument: 'updateLookup',
        fullDocumentBeforeChange: "whenAvailable"
    });
    changeStream.on('change', (change) => {
        console.log('change', change)
        //
        // const array = change.fullDocument.participants;
        //
        // // Check the type of change operation.
        // switch (change.operationType) {
        //     case 'insert':
        //         // Add the new document to the array.
        //         array.push(change.document);
        //         break;
        //     case 'update':
        //         // Update the existing document in the array.
        //         const index = array.indexOf(change.document._id);
        //         array[index] = change.document;
        //         break;
        //     case 'delete':
        //         // Remove the document from the array.
        //         array.splice(array.indexOf(change.document._id), 1);
        //         break;
        // }

        // wss.clients.forEach(client => {
        //     if (client.readyState === WebSocket.OPEN) {
        //         client.send(JSON.stringify({type: 'update', data: change.fullDocument}));
        //     }
        // });
    });

    users = await usersCollection.find().toArray()

}

app.get('/mongo', async (req, res) => {
    res.json(users)
    console.log(users)

});


client.connect().then(async (client) => {
    initializeMongo()
})


server.listen(8080, () => {
    console.log('Server is running on port 8080');
});
