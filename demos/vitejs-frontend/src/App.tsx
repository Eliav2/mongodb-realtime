import "./App.css";
import React from "react";
import { useWatchCollection } from "@mongodb-realtime/client-react";

function App() {
  const users = useWatchCollection("users");
  // useWatchCollection("posts");

  return (
    <div className="App">
      <h2>realtime mongodb</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
