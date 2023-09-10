import { ChangeStreamDocument, Filter } from "mongodb";

export type Client2ServerEvents<TSchema extends Document = Document> = {
  watch: (args: { collectionName: string; filter?: Filter<TSchema> }) => void;
  unwatch: (args: { collectionName: string }) => void;
};
export type Server2ClientEvents<TSchema extends Document = Document> = {
  [event: `update:${string}`]: (change: ChangeStreamDocument) => void;
};
