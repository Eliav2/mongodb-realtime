import "./App.css";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
// "undefined" means the URL will be computed from the `window.location` object
const URL = "http://localhost:8080";

export const socket = io(URL);

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState([]);

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

    const onUsers = (users) => {
      console.log("users updated", users);
    };

    socket.emit("watch", {
      collectionName: "users",
    });

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);
    socket.on("users", onUsers);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("foo", onMessage);
      socket.off("users", onUsers);
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
