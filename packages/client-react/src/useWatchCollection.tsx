import { useMongoRealtimeProvider } from "./mongoRealtimeProvider";
import { useEffect } from "react";

export const useWatchCollection = (collectionName: string) => {
  const socket = useMongoRealtimeProvider();
  useEffect(() => {
    console.log("effect");

    console.log("watching", collectionName);
    socket.emit("watch", {
      collectionName,
    });
    const onCollection = (update: any) => {
      console.log(`${collectionName} updated`, update);
    };
    socket.on(collectionName, onCollection);

    return () => {
      console.log("uneffect");
      socket.emit("unwatch", {
        collectionName,
      });
      socket.off(collectionName, onCollection);
    };
  }, []);
};
