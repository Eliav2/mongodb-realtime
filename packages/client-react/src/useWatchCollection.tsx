import { useMongoRealtimeProvider } from "./mongoRealtimeProvider";
import { useEffect, useState } from "react";
import { ChangeStreamDocument, DocWithId } from "shared/types";
import { updateDocsHash } from "./updateDocsHash";

const array2Hashmap = <T extends DocWithId>(arr: T[]) => {
  const hashmap: { [key: string]: T } = {};
  for (const doc of arr) {
    hashmap[doc._id] = doc;
  }
  return hashmap;
};

export const useWatchCollection = <T extends DocWithId = DocWithId>(
  collectionName: string,
) => {
  // todo: replace 2 usestate with 2 userefs and rerender manually on received event
  const socket = useMongoRealtimeProvider();
  const [docsMap, setDocsMap] = useState<{ [key: string]: T }>({});
  const [docs, setDocs] = useState<T[]>([]);
  useEffect(() => {
    setDocs(Object.values(docsMap));
  }, [docsMap]);

  console.log("docsMap body", docsMap);

  useEffect(() => {
    socket.emit("watch", {
      collectionName,
    });

    const onCollection = (update: ChangeStreamDocument<any>) => {
      console.log(`${collectionName} updated`, update);
      console.log("docsMap before", docsMap);
      // todo: docsMap in not updated because of dead clouser with socket io 'on' events
      const updatedHashMap = updateDocsHash(docsMap, update);
      console.log(updatedHashMap);
      setDocs(Object.values(updatedHashMap));
    };
    socket.on(`update:${collectionName}`, onCollection);

    const onFirstFetch = (docs: T[]) => {
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
