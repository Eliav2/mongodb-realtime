import { Socket } from "socket.io";

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

export default WatchingClients;
