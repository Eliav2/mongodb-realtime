import { useMongoRealtimeProvider } from "./mongoRealtimeProvider";
import { useEffect, useRef, useState } from "react";
import { ChangeStreamDocument, DocWithId } from "shared/types";
import { updateDocsHash } from "./updateDocsHash";

const array2Hashmap = <T extends DocWithId>(arr: T[]) => {
  const hashmap: { [key: string]: T } = {};
  for (const doc of arr) {
    hashmap[doc._id] = doc;
  }
  return hashmap;
};

const useRerender = () => {
  const [, setRerender] = useState({});
  return () => setRerender({});
};

export const useWatchCollection = <T extends DocWithId = DocWithId>(
  collectionName: string,
) => {
  const socket = useMongoRealtimeProvider();
  const [docsMap, setDocsMap] = useState<{ [key: string]: T }>({});
  const [docs, setDocs] = useState<T[]>([]);

  useEffect(() => {
    setDocs(Object.values(docsMap));
  }, [docsMap]);

  useEffect(() => {
    socket.emit("watch", {
      collectionName,
    });

    const onCollection = (update: ChangeStreamDocument<any>) => {
      console.log("onCollection");
      setDocsMap((prevDocsMap) => {
        const updatedHashMap = updateDocsHash(prevDocsMap, update);
        return { ...updatedHashMap };
      });
    };
    socket.on(`update:${collectionName}`, onCollection);

    const onFirstFetch = (docs: T[]) => {
      console.log("onFirstFetch");
      setDocsMap(array2Hashmap(docs));
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
