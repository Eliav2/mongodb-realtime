import { useMongoRealtimeProvider } from "./mongoRealtimeProvider";
import { useEffect } from "react";

export const useWatchCollection = (collectionName: string) => {
  const socket = useMongoRealtimeProvider();
  useEffect(() => {
    socket.emit("watch", {
      collectionName,
    });
    const onCollection = (update: any) => {
      console.log(`${collectionName} updated`, update);
    };
    socket.on(`update:${collectionName}`, onCollection);

    return () => {
      socket.emit("unwatch", {
        collectionName,
      });
      socket.off(`update:${collectionName}`, onCollection);
    };
  }, []);
};
