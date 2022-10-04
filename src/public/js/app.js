const socket = new WebSocket(`ws://${window.location.host}`);
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

socket.addEventListener("open",()=>{console.log("Connect to Server")});
socket.addEventListener("close",()=>{console.log("Disconnect")});
socket.addEventListener("message",(message)=>{
    const li = document.createElement("li");
    li.innerHTML = message.data;
    messageList.append(li);

});

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(input.value);
    input.value = "";
}

messageForm.addEventListener("submit",handleSubmit);
