import { MongoClient, MongoClientOptions } from "mongodb";
import { streamChanges, watchCollection } from "./watchCollection";
import { Server as IOServer, ServerOptions, Socket } from "socket.io";
import WatchingIOServer from "./WatchingIOServer";

const createServer = ({
  mongoUri,
  mongoDriverOptions = {},
  ServerOptions = {},
}: {
  mongoUri: string;
  mongoDriverOptions?: MongoClientOptions;
  ServerOptions?: any;
}) => {
  // Object to store connected clients
  const watchingIOServer = new WatchingIOServer(ServerOptions);

  console.log("creating server");
  // const io = new IOServer(ServerOptions);
  // io.on("connection", (socket) => {
  //   console.log("watchingClients", watchingClients);
  //   console.log("New client connected");
  //   socket.on("message", (message) => {
  //     console.log("message received: " + message);
  //     socket.broadcast.emit("message", message);
  //     // io.clients.forEach((client) => {
  //     //   if (client !== socket && client.readyState === WebSocket.OPEN) {
  //     //     client.send(message);
  //     //   }
  //     // });
  //   });
  //   socket.on("watch", ({ collectionName }) => {
  //     console.log("watching collection", collectionName);
  //     watchingClients.watchCollection(collectionName, socket.id, socket);
  //   });
  //   socket.on("disconnect", () => {
  //     console.log(`User with socket ID ${socket.id} disconnected`);
  //     // Remove the socket from the connectedClients object when a client disconnects
  //     watchingClients.unregisterSocket(socket.id);
  //   });
  // });

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
      watchingIOServer.pushChange("users", change);
      // io.emit("users", users);
    });
  };

  mongoClient.connect().then(async () => {
    initializeMongo();
  });

  return watchingIOServer;
};
export default createServer;
