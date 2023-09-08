import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017'; // Replace with your MongoDB connection string
const dbName = 'mydatabase'; // Replace with your database name
const collectionName = 'mycollection'; // Replace with your collection name

interface Users {
    _id: number;
    name: string;
    age: number;
    // Add any other fields as needed
}

let data: Users[] = [];


// good name for function that
const func = (collection,pipeline) =>{

}

MongoClient.connect(url, { })
    .then((client) => {
        const db = client.db(dbName);
        const collection = db.collection<Users>(collectionName);

        const changeStream = collection.watch();

        changeStream.on('change', (change) => {
            switch (change.operationType) {
                case 'insert':
                    // Handle insert operation
                    const insertedDocument = change.fullDocument!;
                    data.push(insertedDocument);
                    console.log('Inserted Document:', insertedDocument);
                    break;

                case 'update':
                    // Handle update operation
                    const updatedDocument = change.fullDocument!;
                    const updatedId = updatedDocument._id;
                    data = data.map((item) =>
                        item._id === updatedId ? { ...item, ...updatedDocument } : item
                    );
                    console.log('Updated Document:', updatedDocument);
                    break;

                case 'replace':
                    // Handle replace operation
                    const replacedDocument = change.fullDocument!;
                    const replacedId = replacedDocument._id;
                    data = data.map((item) =>
                        item._id === replacedId ? replacedDocument : item
                    );
                    console.log('Replaced Document:', replacedDocument);
                    break;

                case 'delete':
                    // Handle delete operation
                    const deletedId = change.documentKey!._id;
                    data = data.filter((item) => item._id !== deletedId);
                    console.log('Deleted Document ID:', deletedId);
                    break;

                case 'invalidate':
                    // Handle invalidate operation
                    console.log('Change stream is no longer valid.');
                    break;

                case 'drop':
                    // Handle drop operation
                    data = [];
                    console.log('Collection has been dropped.');
                    break;

                case 'rename':
                    // Handle rename operation
                    console.log('Collection has been renamed.');
                    break;

                case 'dropDatabase':
                    // Handle dropDatabase operation
                    data = [];
                    console.log('Database has been dropped.');
                    break;

                default:
                    console.log('Unknown operation type:', change.operationType);
                    break;
            }
        });
    })
    .catch((err) => console.error(err));
