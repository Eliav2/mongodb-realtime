import { MongoRealtimeIOServer } from "@mongodb-realtime/server";

const mongoRealtime = new MongoRealtimeIOServer({
  mongoUri: "mongodb://localhost:27017/realtime",
  ServerOptions: {
    cors: {
      origin: "http://localhost:5173",
    },
  },
});
// mongoRealtime.db.collection("test").find();
mongoRealtime.ioServer.listen(8080);
