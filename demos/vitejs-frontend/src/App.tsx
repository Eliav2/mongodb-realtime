import "./App.css";
import { useWatchCollection } from "@mongodb-realtime/client-react";

function App() {
  const users = useWatchCollection("users");
  // useWatchCollection("posts");

  console.log("users", users);

  return (
    <div className="App">
      <h2>realtime mongodb</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.name} is {user.age} years old
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
