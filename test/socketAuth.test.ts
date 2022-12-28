// import server,{io} from "../src/socketServer";
// import {IncomingMessage, Server, ServerResponse} from "http";
// const Client = require("socket.io-client");
// const { Server } = require("socket.io");

import * as http from "http";
import app from "../src/app";
import {setIoServer} from "../src/socketServer";
const ioClient = require('socket.io-client');
const ioBack = require('socket.io');

describe('socket when clients connect wi', () => {

    let socket;
    let httpServer;
    let httpServerAddr;
    let ioServer;

    /**
     * Setup WS & HTTP servers
     */
    beforeAll((done) => {
        httpServer = http.createServer(app).listen(3001);
        httpServerAddr = httpServer.address();
        ioServer = setIoServer(ioBack(httpServer));
        done();
    });

    /**
     *  Cleanup WS & HTTP servers
     */
    afterAll((done) => {

        ioServer.close();
        httpServer.close();
        done();
    });

    /**
     * Run before each test
     */
    beforeEach((done) => {
        // Setup
        // Do not hardcode server port and address, square brackets are used for IPv6
        console.log(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`)
        socket = ioClient(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
            'reconnection delay': 0,
            'reopen delay': 0,
            autoConnect:false,
            'force new connection': true,
            transports: ['websocket'],
        });

        done();
    });

    /**
     * Run after each test
     */
    afterEach((done) => {
        // Cleanup
        if (socket.connected) {
            socket.disconnect();
        }
        done();
    });

    it('should communicate with waiting for socket.io handshakes', (done) => {
        const username = "John"
        socket.auth = {username}
        socket.connect()
        socket.on('connect', () => {
            //requesting users
            socket.emit("newUser")
        });
        socket.emit('example', 'some messages');
        socket.on("userList",(users) => {
            expect(users).toBeInstanceOf(Array)
            expect(users).toContain(username)
            done()
        })
    },10000);
});
