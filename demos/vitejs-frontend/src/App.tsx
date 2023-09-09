import "./App.css";
import React, { useEffect, useState } from "react";
import {
  useMongoRealtimeProvider,
  useWatchCollection,
} from "@mongodb-realtime/client-react";

// import { MongoRealtimeContext } from "./main.tsx";
// "undefined" means the URL will be computed from the `window.location` object

function App() {
  const socket = useMongoRealtimeProvider();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState([]);

  useWatchCollection("users");
  useWatchCollection("test");
  // useWatchCollection("posts");

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onMessage(value) {
      setMessages((previous) => [...previous, value]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);

    // socket.emit("watch", {
    //   collectionName: "users",
    // });
    // const onUsers = (users) => {
    //   console.log("users updated", users);
    // };
    // socket.on("users", onUsers);
    //
    // socket.emit("watch", {
    //   collectionName: "posts",
    // });
    // const onPosts = (posts) => {
    //   console.log("posts updated", posts);
    // };
    // socket.on("posts", onPosts);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("foo", onMessage);
      // socket.off("users", onUsers);
      // socket.off("posts", onUsers);
    };
  }, []);

  return (
    <div className="App">
      <ConnectionState isConnected={isConnected} />
      <Events events={messages} />
      <ConnectionManager />
      <MyForm />
    </div>
  );
}

export function ConnectionState({ isConnected }) {
  return <p>State: {"" + isConnected}</p>;
}
export function Events({ events }) {
  return (
    <ul>
      {events.map((event, index) => (
        <li key={index}>{event}</li>
      ))}
    </ul>
  );
}
export function ConnectionManager() {
  function connect() {
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  return (
    <>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
    </>
  );
}
export function MyForm() {
  const [value, setValue] = useState("");

  function onSubmit(event) {
    event.preventDefault();

    socket.emit("message", value);
  }

  return (
    <form onSubmit={onSubmit}>
      <input onChange={(e) => setValue(e.target.value)} />

      <button type="submit">Submit</button>
    </form>
  );
}

export default App;
