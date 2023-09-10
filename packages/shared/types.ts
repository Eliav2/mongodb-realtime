import { ChangeStreamDocument, Filter, Document } from "mongodb";

export type Client2ServerEvents = {
  watch: <T extends Document = Document>(args: {
    collectionName: string;
    filter?: Filter<T>;
  }) => void;
  unwatch: (args: { collectionName: string }) => void;
};
export type Server2ClientEvents = {
  [event: `update:${string}`]: <T extends Document = Document>(
    change: ChangeStreamDocument<T>,
  ) => void;
} & {
  [event: `first-fetch:${string}`]: <T extends Document = Document>(
    documents: T[],
  ) => void;
};
