import { Server as IOServer, Socket } from "socket.io";

class WatchingIOServer {
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
  ioServer: IOServer;

  initIOServer(ServerOptions?: any) {
    const io = new IOServer(ServerOptions);

    io.on("connection", (socket) => {
      // console.log("watchingClients", this);
      console.log("New client connected");
      socket.on("message", (message) => {
        console.log("message received: " + message);
        socket.broadcast.emit("message", message);
        // this.ioServer.clients.forEach((client) => {
        //   if (client !== socket && client.readyState === WebSocket.OPEN) {
        //     client.send(message);
        //   }
        // });
      });
      socket.on("watch", ({ collectionName }) => {
        console.log("watching collection", collectionName);
        this.watchCollection(collectionName, socket.id, socket);
      });
      socket.on("disconnect", () => {
        console.log(`User with socket ID ${socket.id} disconnected`);
        // Remove the socket from the connectedClients object when a client disconnects
        this.unregisterSocket(socket.id);
      });
    });
    return io;
  }

  constructor(ServerOptions?: any) {
    this.collections = {};
    this.sockets = {};
    this.ioServer = this.initIOServer(ServerOptions);
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

export default WatchingIOServer;
