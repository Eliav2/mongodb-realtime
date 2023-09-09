import { Server as IOServer, Socket } from "socket.io";
import { ChangeStream, Db, MongoClient, MongoClientOptions } from "mongodb";

class MongoRealtimeIOServer {
  // store a map that says per collection which socket is watching it
  collections: {
    [collectionName: string]: {
      socketIds: Set<string>; //socketIds that are watching this collection}
      changeStream: ChangeStream;
    };
  };
  // store a map that says per socket which collections it is watching
  sockets: {
    [socketId: string]: {
      watchingOnCollections: Set<string>;
      socket: Socket;
    };
  };
  ioServer: IOServer;
  mongoClient: MongoClient;
  db: Db;

  private autoConfigureCollections: boolean;

  initIOServer(ServerOptions?: any) {
    const io = new IOServer(ServerOptions);

    io.on("connection", (socket) => {
      // console.log("watchingClients", this);
      console.log("New client connected");
      socket.on("message", (message) => {
        // console.log("message received: " + message);
        socket.broadcast.emit("message", message);
      });
      socket.on("watch", ({ collectionName }) => {
        console.log("watching collection", collectionName);
        this.watchCollection(collectionName, socket.id, socket);
      });
      socket.on("unwatch", ({ collectionName }) => {
        // console.log("unwatching collection", collectionName);
        this.unwatchCollection(collectionName, socket.id);
      });
      socket.on("disconnect", () => {
        // console.log(`User with socket ID ${socket.id} disconnected`);
        // Remove the socket from the connectedClients object when a client disconnects
        this.unregisterSocket(socket.id);
      });
    });
    return io;
  }

  constructor({
    mongoUri,
    mongoDriverOptions = {},
    ServerOptions = {},
    autoConfigureCollections = false,
  }: {
    mongoUri: string;
    mongoDriverOptions?: MongoClientOptions;
    ServerOptions?: any;

    // should configure each watched collection automatically with 'changeStreamPreAndPostImages' https://www.mongodb.com/docs/manual/changeStreams/#change-streams-with-document-pre--and-post-images
    autoConfigureCollections?: boolean;
  }) {
    this.collections = {};
    this.sockets = {};
    this.ioServer = this.initIOServer(ServerOptions);
    this.mongoClient = new MongoClient(mongoUri, mongoDriverOptions);
    this.db = this.mongoClient.db();
    this.autoConfigureCollections = autoConfigureCollections;

    // debug
    // setInterval(() => {
    //   console.log(
    //     "watchingClients",
    //     // this.collections,
    //   );
    // }, 2000);
  }

  async _openChangeStream(collectionName: string) {
    if (this.autoConfigureCollections) {
      await this.db.command({
        collMod: collectionName,
        validator: {},
        changeStreamPreAndPostImages: {
          enabled: true,
        },
      });
    }

    const changeStream = this.db.collection(collectionName).watch();

    // console.log("registering changeStream for collection", collectionName);
    changeStream.on("change", (change) => {
      // console.log("change", change);
      // console.log("change occurred in collection", collectionName);
      this.pushChange(collectionName, change);
    });

    return changeStream;
  }

  async _closeChangeStream(collectionName: string) {
    // console.log("unregistering changeStream for collection", collectionName);
    await this.collections[collectionName]["changeStream"].close();
  }

  async watchCollection(
    collectionName: string,
    socketId: string,
    socket: Socket,
  ) {
    if (!this.collections[collectionName]) {
      this.collections[collectionName] = {
        socketIds: new Set(),
        changeStream: await this._openChangeStream(collectionName),
      };
    }
    this.collections[collectionName]["socketIds"].add(socketId);
    if (!this.sockets[socketId]) {
      this.sockets[socketId] = {
        watchingOnCollections: new Set(),
        socket,
      };
    }
    this.sockets[socketId].watchingOnCollections.add(collectionName);
  }

  unwatchCollection(collectionName: string, socketId: string) {
    if (!this.collections[collectionName]) return;
    this.collections[collectionName]["socketIds"].delete(socketId);
    // close change stream if no more sockets are watching
    if (this.collections[collectionName]["socketIds"].size === 0) {
      this._closeChangeStream(collectionName);
      delete this.collections[collectionName];
    }
  }

  unregisterSocket(socketId: string) {
    console.log("unregistering socket", socketId);
    if (!this.sockets[socketId]) return;
    const collections = this.sockets[socketId].watchingOnCollections;
    collections.forEach((collectionName) => {
      this.unwatchCollection(collectionName, socketId);
    });
    delete this.sockets[socketId];
  }

  pushChange(collectionName: string, change: any) {
    if (!this.collections[collectionName]) return;
    // todo: check if its possible to somehow emit all events simultaneously instead iterating over them
    this.collections[collectionName]["socketIds"].forEach((socketId) => {
      this.sockets[socketId].socket.emit(collectionName, change);
    });
  }
}

export default MongoRealtimeIOServer;
