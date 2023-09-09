import { MongoClient, MongoClientOptions } from "mongodb";
import { streamChanges, watchCollection } from "./watchCollection";
import { Server as IOServer, Socket } from "socket.io";
import WatchingClients from "./WatchingClients";

// Object to store connected clients
const watchingClients = new WatchingClients();

interface User {
  name: string;
  age: number;
}

let users: User[] = [];

const createServer = ({
  mongoUri,
  mongoDriverOptions = {},
  scoketioOptions = {},
}: {
  mongoUri: string;
  mongoDriverOptions?: MongoClientOptions;
  scoketioOptions?: any;
}) => {
  console.log("creating server");
  const io = new IOServer(scoketioOptions);
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
    });
    socket.on("disconnect", () => {
      console.log(`User with socket ID ${socket.id} disconnected`);
      // Remove the socket from the connectedClients object when a client disconnects
      watchingClients.unregisterSocket(socket.id);
    });
  });

  const mongoClient = new MongoClient(mongoUri, mongoDriverOptions);

  const initializeMongo = async () => {
    const db = mongoClient.db("realtime");
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

  mongoClient.connect().then(async () => {
    initializeMongo();
  });

  return io;
};
export default createServer;
