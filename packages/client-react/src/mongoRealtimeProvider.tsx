import React from "react";
import { io, Socket } from "socket.io-client";
import type { Client2ServerEvents, Server2ClientEvents } from "shared/types";

export type MongoRealtimeContextType = Socket<
  Server2ClientEvents,
  Client2ServerEvents
> | null;

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
export const useMongoRealtimeProvider: () => NonNullable<MongoRealtimeContextType> =
  () => {
    const context = React.useContext(MongoRealtimeContext);
    if (!context) {
      throw new Error(
        "useMongoRealtimeProvider must be used within a MongoRealtimeProvider",
      );
    }
    return context;
  };
