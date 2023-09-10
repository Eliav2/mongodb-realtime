import { ChangeStreamDocument, Filter, Document } from "mongodb";

type DocWithId = Document & { _id: string };
export type Client2ServerEvents = {
  watch: <T extends DocWithId = DocWithId>(args: {
    collectionName: string;
    filter?: Filter<T>;
  }) => void;
  unwatch: (args: { collectionName: string }) => void;
};
export type Server2ClientEvents = {
  [event: `update:${string}`]: <T extends DocWithId = DocWithId>(
    change: ChangeStreamDocument<T>,
  ) => void;
} & {
  [event: `first-fetch:${string}`]: <T extends DocWithId = DocWithId>(
    documents: T[],
  ) => void;
};

export type { ChangeStreamDocument, Document, DocWithId };
