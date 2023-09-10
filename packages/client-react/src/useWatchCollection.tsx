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
  // todo: replace 2 usestate with 2 userefs and rerender manually on received event
  const socket = useMongoRealtimeProvider();

  // const docsRef = useRef<T[]>([]);
  // const docsMapRef = useRef<{ [key: string]: T }>({});
  // const rerender = useRerender();

  const [docsMap, setDocsMap] = useState<{ [key: string]: T }>({});
  const [docs, setDocs] = useState<T[]>([]);

  useEffect(() => {
    setDocs(Object.values(docsMap));
  }, [docsMap]);
  // console.log("docsMap", docsMap);
  // useEffect(() => {
  //   docsRef.current = Object.values(docsMapRef.current);
  //   rerender();
  // }, [docsMapRef.current]);

  // console.log("docsMap body", docsMap);
  // console.log("docsMap body", docsMapRef);

  useEffect(() => {
    socket.emit("watch", {
      collectionName,
    });

    // console.log("DocsMap", docsMap);
    const onCollection = (update: ChangeStreamDocument<any>) => {
      console.log("onCollection");
      // console.log(`${collectionName} updated`, update);
      // console.log("docsMap before", docsMap);
      // console.log("docsMap before", docsMapRef);
      // todo: docsMap in not updated because of dead clouser with socket io 'on' events
      // console.log("updated", docsMapRef.current);
      // setDocs(Object.values(updatedHashMap));
      setDocsMap((prevDocsMap) => {
        // console.log("updating docsMap");
        // console.log("old value", prevDocsMap);
        const updatedHashMap = updateDocsHash(prevDocsMap, update);
        // console.log("new value", updatedHashMap);
        return { ...updatedHashMap };
      });

      // docsMapRef.current = updatedHashMap;
      // rerender();
    };
    socket.on(`update:${collectionName}`, onCollection);

    const onFirstFetch = (docs: T[]) => {
      console.log("onFirstFetch");
      // setDocs((prevDocs) => {
      //   return docs;
      // });
      setDocsMap(array2Hashmap(docs));

      // docsMapRef.current = array2Hashmap(docs);
      // rerender();
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
