import { MongoClient, MongoClientOptions } from "mongodb";
import { streamChanges, watchCollection } from "./watchCollection";
import { Server as IOServer, ServerOptions, Socket } from "socket.io";
import MongoRealtimeIOServer from "./MongoRealtimeIOServer";

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
  const watchingIOServer = new MongoRealtimeIOServer({
    mongoUri,
    mongoDriverOptions,
    ServerOptions,
  });

  console.log("creating server");

  const mongoClient = new MongoClient(mongoUri, mongoDriverOptions);

  mongoClient.connect().then(async () => {
    // initializeMongo();
  });

  return watchingIOServer;
};
export default createServer;
