import express from "express";
import * as http from "node:http";
import {Server as SocketServer} from "socket.io"
import cors from "cors"
import morgan from "morgan"
import bodyParser from "body-parser"
import {MessageModel} from "./utils/MessageModel";
import {LoginModel} from "./utils/loginModel";

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const corsConfig = {
    origin: "http://localhost:3000"
}

const app = express();
const server = http.createServer(app)
const io = new SocketServer(server,{
    cors:corsConfig
})

app.use(morgan("dev"))
app.use(cors())
app.use(bodyParser.json())

app.post("/login",(req,res) => {
    const {username} = req.body
    if (authUser(req.body))
        res.send({
            username
        })
    else {
        res.send(400)
    }
})

const users:Map<string,string> = new Map([])
const authUser = (auth: { [x: string]: any; username?: string; }) => {
    const {username} = auth;
    if ([...users].some(([id,user]) => user == username)) return false
    if (username && username.length > 0) {
        return true;
    } else {
        return false;
    }
};

io.use((socket, next) => {
    const auth = socket.handshake.auth;
    console.log(auth);
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
        console.log(`user ${socket.id} has disconnected`)
        users.delete(socket.id)
        const usersList = [...users].map(([id,username]) => username)
        socket.emit("userList", usersList)
    })

    socket.on("message",(msg:string) => {
        if (msg.trim().length == 0 ) return
        console.log(msg)
        socket.broadcast.emit("message", new MessageModel(msg,socket.id))
    })

    socket.on("newUser",() => {
        const usersList = [...users].map(([id,username]) => username)
        socket.emit("userList", usersList)
    })
});

const port = process.env.PORT || 3001
server.listen(port, () => {
    console.log(`listening on *:${port}`);
});