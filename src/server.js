import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public",express.static(__dirname+"/public"));
app.get("/",(req,res) => res.render("home"));
app.get("/*",(req,res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true,
    },
  });
  
  instrument(io, {
    auth: false,
  });

function countRoom(roomName) {
    return io.sockets.adapter.rooms.get(roomName)?.size;
}

function publicRooms() {
    const {
      sockets: {
        adapter: { sids, rooms },
      },
    } = io;
    const publicRooms = [];
    rooms.forEach((_, key) => {
      if (sids.get(key) === undefined) {
        publicRooms.push(key);
      }
    });
    return publicRooms;
}

  
io.on("connection", (socket)  => {
    socket["nickname"] = "Anon";
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        io.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) =>
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
        );
    });
    socket.on("disconnect", () => {
        io.sockets.emit("room_change", publicRooms());
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("nickname", (nickname) => {socket["nickname"] = nickname});
});

// websocket 사용했을 때 연결 코드
// const wss = new WebSocket.Server({ server });
// const sockets = [];
// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nick"] = "Anonymous";
//   socket.on("close", ()=>{console.log("Discount client")});
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg)
//     switch(message.type){
//         case "nick":
//             socket["nick"] = message.payload;
//             break;
//         case "message":
//             sockets.forEach((aSocket) => {aSocket.send(`${socket.nick} : ${message.payload}`)});
//             break;
//     }
//   });
// });

server.listen(3000,handleListen);
