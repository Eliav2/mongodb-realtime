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
