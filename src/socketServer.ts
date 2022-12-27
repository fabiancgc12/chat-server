import http from "node:http";
import app, {corsConfig} from "./app";
import {Server as SocketServer} from "socket.io";
import {authUser, users} from "./common/utils/authUser";
import {MessageModel} from "./common/models/MessageModel";

const server = http.createServer(app)
const io = new SocketServer(server,{
    cors:corsConfig
})

io.use((socket, next) => {
    const auth = socket.handshake.auth;
    if (authUser(auth)) {
        return next();
    }
    return next(new Error('authentication error'));
});

io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`)
    // @ts-ignore
    const {username} = socket.handshake.auth
    users.set(socket.id,username)
    socket.on("disconnect",() => {
        const user = users.get(socket.id)
        console.log(`user ${socket.id}: ${user} has disconnected`)
        users.delete(socket.id)
        const usersList = [...users].map(([id,username]) => username)
        io.emit("userList", usersList)
        socket.broadcast.emit("stopTyping",user)
    })

    socket.on("message",(msg:string) => {
        if (msg.trim().length == 0 ) return
        console.log(msg)
        const user = users.get(socket.id)
        socket.broadcast.emit("message", new MessageModel(msg,user))
    })

    socket.on("isTyping",() => {
        const user = users.get(socket.id)
        console.log(`${user} is typing`)
        socket.broadcast.emit("isTyping", user)
    })

    socket.on("stopTyping",() => {
        const user = users.get(socket.id)
        console.log(`${user} stopped typing`)
        socket.broadcast.emit("stopTyping", user)
    })

    socket.on("newUser",() => {
        const usersList = [...users].map(([id,username]) => username)
        io.emit("userList", usersList)
    })
});

export default server