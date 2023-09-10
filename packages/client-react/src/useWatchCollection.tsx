import { useMongoRealtimeProvider } from "./mongoRealtimeProvider";
import { useEffect, useState } from "react";

export const useWatchCollection = <T extends any = any>(
  collectionName: string,
) => {
  const socket = useMongoRealtimeProvider();
  const [docs, setDocs] = useState<T[]>([]);
  useEffect(() => {
    socket.emit("watch", {
      collectionName,
    });
    const onCollection = (update: any) => {
      console.log(`${collectionName} updated`, update);
    };
    socket.on(`update:${collectionName}`, onCollection);

    const onFirstFetch = (docs: any) => {
      setDocs(docs);
      console.log(docs);
    };
    socket.on(`first-fetch:${collectionName}`, onFirstFetch);

    return () => {
      socket.emit("unwatch", {
        collectionName,
      });
      socket.off(`update:${collectionName}`, onCollection);
      socket.off(`first-fetch:${collectionName}`, onFirstFetch);
    };
  }, []);
  return docs;
};
