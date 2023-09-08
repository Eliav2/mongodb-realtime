import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


const socket = new WebSocket('ws://localhost:8080');
const messages = document.getElementById('messages');

socket.addEventListener('message', async (event:MessageEvent) => {
    const rawData:Blob = event.data;
    const data = await rawData.text();
    console.log('data', data)
    const li = document.createElement('li');
    li.textContent = data;
    messages.appendChild(li);
});

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    if (message) {
        socket.send(message);
        messageInput.value = '';
    }
}

function App() {

  return (
    <>
        <input type="text" id="messageInput" placeholder="Type a message..."></input>
        <button onClick={sendMessage}>Send</button>
        <ul id="messages"></ul>

    </>
  )
}

export default App