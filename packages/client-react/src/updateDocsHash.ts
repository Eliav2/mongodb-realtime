import { ChangeStreamDocument, DocWithId, Document } from "shared/types";

export const updateDocsHash = <T extends Document = Document>(
  docs: {
    [key: string]: T;
  },
  update: ChangeStreamDocument<T>,
): {
  [key: string]: T;
} => {
  console.log("recived update", update, "on", docs);
  switch (update.operationType) {
    case "insert":
      // Handle insert operation
      const insertedDocument = update.fullDocument;
      docs[update.documentKey._id as any] = update.fullDocument;
      // console.log("Inserted Document:", insertedDocument);
      break;

    case "update":
      // Handle update operation
      const updatedId = update.documentKey._id;

      const {
        removedFields = [],
        updatedFields: updatedFields = {},
        truncatedArrays,
        disambiguatedPaths,
      } = update.updateDescription;

      const updatedDoc = docs[updatedId as any];

      // If the document exists in the set, update its fields
      if (updatedDoc) {
        Object.assign(updatedDoc, updatedFields);
        for (const prop of removedFields) {
          delete (updatedDoc as any)[prop];
        }
        // Handle truncatedArrays operation
        if (truncatedArrays) {
          for (const field of truncatedArrays) {
            if (updatedDoc[field] && Array.isArray(updatedDoc[field])) {
              // Apply your logic to handle truncated arrays here
              // For example, you might want to trim the array to a specific length
              updatedDoc[field] = updatedDoc[field].slice(0, 3); // This keeps only the first 3 elements
            }
          }
        }
      } else {
        console.log("Document not found in the Set:", updatedId);
      }

      break;

    case "replace":
      // Handle replace operation
      const replacedDocument = update.fullDocument;
      docs[update.documentKey._id as any] = update.fullDocument;
      console.log("Replaced Document:", replacedDocument);
      break;

    case "delete":
      // Handle delete operation
      const deletedId = update.documentKey._id;
      delete docs[update.documentKey._id as any];
      console.log("Deleted Document ID:", deletedId);
      break;

    case "invalidate":
      // Handle invalidate operation
      console.log("Change stream is no longer valid.");
      break;

    case "drop":
      // Handle drop operation
      docs.clear();
      console.log("Collection has been dropped.");
      break;

    case "rename":
      // Handle rename operation
      console.log("Collection has been renamed.");
      break;

    case "dropDatabase":
      // Handle dropDatabase operation
      docs.clear();
      console.log("Database has been dropped.");
      break;

    default:
      console.log("Unknown operation type:", update.operationType);
      break;
  }
  return docs;
};

// // update
// {
//     "_id": {
//         "_data": "8264FD1B7F000000022B022C0100296E5A10042A9FA70E801046FEAD7460CEC146E9C546645F6964006464FA668FF3C6FC43CDEC344A0004"
//     },
//     "operationType": "update",
//     "clusterTime": {
//         "$timestamp": "7277002805175386114"
//     },
//     "wallTime": "2023-09-10T01:27:27.630Z",
//     "ns": {
//         "db": "realtime",
//         "coll": "users"
//     },
//     "documentKey": {
//         "_id": "64fa668ff3c6fc43cdec344a"
//     },
//     "updateDescription": {
//         "updatedFields": {
//             "age": 33
//         },
//         "removedFields": [],
//         "truncatedArrays": []
//     }
// }

// // delete
// {
//     "_id": {
//         "_data": "8264FD1BB4000000012B022C0100296E5A10042A9FA70E801046FEAD7460CEC146E9C546645F6964006464FA668FF3C6FC43CDEC344A0004"
//     },
//     "operationType": "delete",
//     "clusterTime": {
//         "$timestamp": "7277003032808652801"
//     },
//     "wallTime": "2023-09-10T01:28:20.856Z",
//     "ns": {
//         "db": "realtime",
//         "coll": "users"
//     },
//     "documentKey": {
//         "_id": "64fa668ff3c6fc43cdec344a"
//     }
// }
