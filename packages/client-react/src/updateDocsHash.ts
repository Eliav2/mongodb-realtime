import { ChangeStreamDocument, DocWithId } from "shared/types";

export const updateDocsHash = <T extends Document = Document>(
  docs: {
    [key: string]: T;
  },
  update: ChangeStreamDocument<T>,
): {
  [key: string]: T;
} => {
  console.log(docs, update);
  switch (update.operationType) {
    case "insert":
      // Handle insert operation
      const insertedDocument = update.fullDocument;
      docs.add(insertedDocument);
      console.log("Inserted Document:", insertedDocument);
      break;

    case "update":
      // Handle update operation
      console.log("updateing", docs);
      const updatedDocument = update.updateDescription;
      const updatedId = update.documentKey._id;

      // Get the updated fields from updateDescription
      const updatedFields = update.updateDescription?.updatedFields || {};

      // Find the document in the set
      // const updatedDocInSet = [...docs].find(
      //   (item) => item._id._data === updatedId,
      // );
      const updatedDocInSet = docs["updatedId"];

      // If the document exists in the set, update its fields
      if (updatedDocInSet) {
        Object.assign(updatedDocInSet, updatedFields);
        console.log("Updated Document:", updatedDocument);
      } else {
        console.log("Document not found in the Set:", updatedId);
      }

      break;

    case "replace":
      // Handle replace operation
      const replacedDocument = update.fullDocument;
      docs.forEach((item) => {
        if (item._id === replacedDocument._id) {
          docs.delete(item);
          docs.add(replacedDocument);
        }
      });
      console.log("Replaced Document:", replacedDocument);
      break;

    case "delete":
      // Handle delete operation
      const deletedId = update.documentKey._id;
      docs.forEach((item) => {
        if (item._id === deletedId) {
          docs.delete(item);
        }
      });
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
