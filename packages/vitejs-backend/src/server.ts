import express from "express";
import http from "http";
import WebSocket from "ws";
import { MongoClient } from "mongodb";
import { streamChanges, watchCollection } from "./watchCollection";
import { Server, Socket } from "socket.io";

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  /* options */
  cors: {
    origin: "http://localhost:5173",
  },
});

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, {});

class WatchingClients {
  // store a map that says per collection which socket is watching it
  collections: {
    [collectionName: string]: Set<string>; //socketIds that are watching this collection
  };
  // store a map that says per socket which collections it is watching
  sockets: {
    [socketId: string]: {
      watchingOnCollections: Set<string>;
      socket: Socket;
    };
  };

  constructor() {
    this.collections = {};
    this.sockets = {};
  }

  watchCollection(collectionName: string, socketId: string, socket: Socket) {
    // console.log(
    //   "registering socketId",
    //   socketId,
    //   "for collection",
    //   collectionName,
    // );
    if (!this.collections[collectionName]) {
      this.collections[collectionName] = new Set();
    }
    this.collections[collectionName].add(socketId);
    if (!this.sockets[socketId]) {
      this.sockets[socketId] = {
        watchingOnCollections: new Set(),
        socket,
      };
    }
    this.sockets[socketId].watchingOnCollections.add(collectionName);
  }

  unregisterSocket(socketId: string) {
    console.log("unregistering socket", socketId);
    if (!this.sockets[socketId]) return;
    const collections = this.sockets[socketId].watchingOnCollections;
    collections.forEach((collectionName) => {
      this.collections[collectionName].delete(socketId);
    });
    delete this.sockets[socketId];
  }

  pushChange(collectionName: string, change: any) {
    console.log("pushChange", collectionName, change);
    if (!this.collections[collectionName]) return;
    this.collections[collectionName].forEach((socketId) => {
      this.sockets[socketId].socket.emit(collectionName, change);
    });
  }
}

// Object to store connected clients
const watchingClients = new WatchingClients();

io.on("connection", (socket) => {
  console.log("watchingClients", watchingClients);
  console.log("New client connected");
  socket.on("message", (message) => {
    console.log("message received: " + message);
    socket.broadcast.emit("message", message);
    // io.clients.forEach((client) => {
    //   if (client !== socket && client.readyState === WebSocket.OPEN) {
    //     client.send(message);
    //   }
    // });
  });
  socket.on("watch", ({ collectionName }) => {
    console.log("watching collection", collectionName);
    watchingClients.watchCollection(collectionName, socket.id, socket);
    // io.clients.forEach((client) => {
    //   if (client !== socket && client.readyState === WebSocket.OPEN) {
    //     client.send(message);
    //   }
    // });
  });
  socket.on("disconnect", () => {
    console.log(`User with socket ID ${socket.id} disconnected`);
    // Remove the socket from the connectedClients object when a client disconnects
    watchingClients.unregisterSocket(socket.id);
  });
});

interface User {
  name: string;
  age: number;
}

let users: User[] = [];

const initializeMongo = async () => {
  const db = client.db("realtime");
  const usersCollection = db.collection("users");

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
    changeStreamPreAndPostImages: {
      enabled: true,
    },
  });

  streamChanges(usersCollection, (change) => {
    console.log("users collection updated");
    watchingClients.pushChange("users", change);
    // io.emit("users", users);
  });
};

app.get("/mongo", async (req, res) => {
  res.json(users);
  console.log(users);
});

client.connect().then(async (client) => {
  initializeMongo();
});

httpServer.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
