import * as http from "http";
import app from "../src/app";
import {setIoServer} from "../src/socketServer";
const ioClient = require('socket.io-client');
const ioBack = require('socket.io');

describe('Testing chat Socket', () => {

    let socketFirstUser;
    let socketSecondUser;
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
        socketFirstUser = ioClient(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
            'reconnection delay': 0,
            'reopen delay': 0,
            autoConnect:false,
            'force new connection': true,
            transports: ['websocket'],
        });
        socketSecondUser = ioClient(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
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
        if (socketFirstUser.connected) {
            socketFirstUser.disconnect();
        }
        if (socketSecondUser.connected) {
            socketSecondUser.disconnect();
        }
        done();
    });

    it('should connect one user', (done) => {
        const username = "John"
        socketFirstUser.auth = {username}
        socketFirstUser.connect()
        socketFirstUser.on('connect', () => {
            //requesting users
            socketFirstUser.emit("newUser")
        });
        socketFirstUser.emit('example', 'some messages');
        socketFirstUser.on("userList",(users) => {
            expect(users).toBeInstanceOf(Array)
            expect(users).toContain(username)
            done()
        })
    });

    it('should connect two users', (done) => {
        const firstUsername = "John"
        socketFirstUser.auth = {username:firstUsername}
        // 1. we connect the first user
        socketFirstUser.connect()
        socketFirstUser.on('connect', () => {
            //requesting users
            socketFirstUser.emit("newUser")
        });

        //2. when first user is connected we connect the second
        const secondUsername = "Doe"
        socketSecondUser.auth = {username:secondUsername}
        socketSecondUser.on('connect', () => {
            //requesting users
            socketSecondUser.emit("newUser")
        });
        socketFirstUser.on("userList",(users) => {
            expect(users).toBeInstanceOf(Array)
            expect(users).toContain(firstUsername);
            expect(users).not.toContain(secondUsername);
            socketSecondUser.connect()
            done()
        })

        socketSecondUser.on("userList",(users) => {
            expect(users).toBeInstanceOf(Array)
            expect(users).toContain(firstUsername);
            expect(users).toContain(secondUsername);
            done()
        })
    },10000);

});
