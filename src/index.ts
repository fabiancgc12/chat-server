import express from "express";
import * as http from "node:http";
import {Server as SocketServer} from "socket.io"
import cors from "cors"
import morgan from "morgan"
import {MessageModel} from "./utils/MessageModel";

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


io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`)

    socket.on("disconnect",() => {
        console.log(`user ${socket.id} has disconnected`)
    })

    socket.on("message",(msg:string) => {
        console.log(msg)
        socket.broadcast.emit("message", new MessageModel(msg,socket.id))
    })
});

const port = process.env.PORT || 3001
server.listen(port, () => {
    console.log(`listening on *:${port}`);
});