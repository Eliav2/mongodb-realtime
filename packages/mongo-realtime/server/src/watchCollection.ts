import { ChangeStreamDocument, Collection } from "mongodb";

export const watchCollection = async (
  collection: Collection,
  onChange?: (updatedDocuments: any[]) => void,
) => {
  let docs = [];

  const userFilter = { age: { $lt: 28 } };
  // match only relevant changes
  const filterPipeline = [
    // {
    //   $replaceRoot: {
    //     newRoot: {
    //       $mergeObjects: [
    //         {
    //           $cond: {
    //             if: {
    //               $or: [
    //                 { operationType: "update" },
    //                 { operationType: "delete" },
    //               ],
    //             },
    //             then: "$fullDocumentBeforeChange",
    //             else: "$fullDocument",
    //           },
    //         },
    //         "$$ROOT",
    //       ],
    //     },
    //   },
    // },
    // { $match: userFilter },
    // {
    //   $match: {
    //     $and: [{ operationType: "update" }],
    //     // $or: [
    //     //   // catch update operations that are relevant
    //     //   {
    //     //     $and: [
    //     //       { operationType: "update" },
    //     //       {
    //     //         $replaceRoot: {
    //     //           newRoot: {
    //     //             $mergeObjects: ["$fullDocumentBeforeChange", "$$ROOT"],
    //     //           },
    //     //         },
    //     //       },
    //     //     ],
    //     //   },
    //     //   {
    //     //     $match: userFilter,
    //     //   },
    //     // ],
    //   },
    // },
  ];

  const changeStream = collection.watch(filterPipeline, {
    fullDocument: "updateLookup",
    fullDocumentBeforeChange: "whenAvailable",
  });
  changeStream.on("change", (change) => {
    // console.log("change", change);
    console.log("change");
    onChange && onChange(change);
    //
    // const array = change.fullDocument.participants;
    //
    // // Check the type of change operation.
    // switch (change.operationType) {
    //     case 'insert':
    //         // Add the new document to the array.
    //         array.push(change.document);
    //         break;
    //     case 'update':
    //         // Update the existing document in the array.
    //         const index = array.indexOf(change.document._id);
    //         array[index] = change.document;
    //         break;
    //     case 'delete':
    //         // Remove the document from the array.
    //         array.splice(array.indexOf(change.document._id), 1);
    //         break;
    // }

    // wss.clients.forEach(client => {
    //     if (client.readyState === WebSocket.OPEN) {
    //         client.send(JSON.stringify({type: 'update', data: change.fullDocument}));
    //     }
    // });
  });

  const a1 = await collection;
  docs = await collection.find().toArray();
  onChange && onChange(docs);
};

export const streamChanges = (
  collection: Collection,
  onChange?: (change: ChangeStreamDocument) => void,
) => {
  const changeStream = collection.watch([], {
    fullDocument: "updateLookup",
    fullDocumentBeforeChange: "whenAvailable",
  });
  return changeStream.on("change", (change) => {
    // console.log("change", change);
    console.log("change");
    onChange && onChange(change);
  });
};
