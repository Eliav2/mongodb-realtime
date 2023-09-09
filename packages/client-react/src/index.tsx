import React, { useEffect } from "react";
import { io, Socket } from "socket.io-client";

export type MongoRealtimeContextType = Socket | null;

export const MongoRealtimeContext =
  React.createContext<MongoRealtimeContextType>(null);

export const MongoRealtimeProvider: React.FC<{
  url: string;
  children: React.ReactNode;
}> = ({ url, children }) => {
  const [socket] = React.useState(() => io(url));
  return (
    <MongoRealtimeContext.Provider value={socket}>
      {children}
    </MongoRealtimeContext.Provider>
  );
};

export const useMongoRealtimeProvider: () => Socket = () => {
  const context = React.useContext(MongoRealtimeContext);
  if (!context) {
    throw new Error(
      "useMongoRealtimeProvider must be used within a MongoRealtimeProvider",
    );
  }
  return context;
};

export const useWatchCollection = (collectionName: string) => {
  const socket = useMongoRealtimeProvider();
  useEffect(() => {
    socket.emit("watch", {
      collectionName,
    });
    const onCollection = (update: any) => {
      console.log(`${collectionName} updated`, update);
    };
    socket.on(collectionName, onCollection);

    return () => {
      socket.emit("unwatch", {
        collectionName,
      });
      socket.off(collectionName, onCollection);
    };
  }, []);
};
