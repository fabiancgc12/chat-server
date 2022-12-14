import * as http from "http";
import app from "../src/app";
import {setIoServer} from "../src/socketServer";
import {MessageModel} from "../src/common/models/MessageModel";
const ioClient = require('socket.io-client');
const ioBack = require('socket.io');

function connectClient(socket,username){
    socket.auth = {username}
    socket.connect()
}

describe('Testing chat Socket', () => {
    const firstUsername = "John"
    const secondUsername = "Doe"
    let firstUserSocket;
    let secondUserSocket;
    let httpServer;
    let httpServerAddr;
    let ioServer;

    function connectFirstClient(){
        connectClient(firstUserSocket,firstUsername)
    }

    function connectSecondClient(){
        connectClient(secondUserSocket,secondUsername)
    }

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
        firstUserSocket = ioClient(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
            'reconnection delay': 0,
            'reopen delay': 0,
            autoConnect:false,
            'force new connection': true,
            transports: ['websocket'],
        });
        secondUserSocket = ioClient(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
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
        if (firstUserSocket.connected) {
            firstUserSocket.disconnect();
        }
        if (secondUserSocket.connected) {
            secondUserSocket.disconnect();
        }
        done();
    });

    it('should connect one user', (done) => {
        const username = "John"
        firstUserSocket.auth = {username}
        firstUserSocket.connect()
        firstUserSocket.on('connect', () => {
            //requesting users
            firstUserSocket.emit("newUser")
        });
        firstUserSocket.on("userList",(users) => {
            expect(users).toBeInstanceOf(Array)
            expect(users).toContain(username)
            done()
        })
    });

    it('should connect two users', (done) => {
        // 1. we connect the first user
        connectFirstClient()
        firstUserSocket.on('connect', () => {
            //requesting users
            firstUserSocket.emit("newUser")
        });

        //2. when first user is connected we connect the second
        secondUserSocket.on('connect', () => {
            //requesting users
            secondUserSocket.emit("newUser")
        });
        firstUserSocket.once("userList",(users) => {
            expect(users).toBeInstanceOf(Array)
            expect(users).toContain(firstUsername);
            expect(users).not.toContain(secondUsername);
            connectSecondClient()
        })

        secondUserSocket.on("userList",(users) => {
            expect(users).toBeInstanceOf(Array)
            expect(users).toContain(firstUsername);
            expect(users).toContain(secondUsername);
            done()
        })
    },10000);

    it('should Should connect three users and then disconnect the first', function (done) {
        const thirdUsername = "Maria"
        const thirdClientSocket = ioClient(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
            'reconnection delay': 0,
            'reopen delay': 0,
            autoConnect:false,
            'force new connection': true,
            transports: ['websocket'],
        });
        connectFirstClient()
        firstUserSocket.on('connect', () => {
            connectSecondClient()
            connectClient(thirdClientSocket,thirdUsername)
        });
        thirdClientSocket.on("connect",() => {
            firstUserSocket.disconnect();
        })
        thirdClientSocket.on("userList",(users) => {
            expect(users).toContain(thirdUsername)
            expect(users).toContain(secondUsername)
            expect(users).not.toContain(firstUsername)
            thirdClientSocket.disconnect()
            done()
        })
    });

    it('should send messages between two users', function (done) {
        const firstMessage = "lorem ipsum";
        const secondMessage = "this is a test message";
        connectFirstClient()
        firstUserSocket.on('connect', () => {
            connectSecondClient()
        });
        firstUserSocket.on('message', (data:MessageModel) => {
            expect(data.message).toBe(firstMessage)
            expect(data.user).toBe(secondUsername)
            firstUserSocket.emit("message",secondMessage)
        });
        secondUserSocket.on('connect', () => {
            secondUserSocket.emit("message",firstMessage)
        });
        secondUserSocket.on('message', (data:MessageModel) => {
            expect(data.message).toBe(secondMessage)
            expect(data.user).toBe(firstUsername)
            done()
        });
    });

    it('should throw error when message is empty', function (done) {
        connectFirstClient()
        let timesCalled = 0
        firstUserSocket.on('connect', () => {
            firstUserSocket.emit("message")
        });

        firstUserSocket.on("errorMessage",(err) => {
            if (timesCalled < 2){
                expect(err.data.status).toBe(400)
                firstUserSocket.emit("message","")
                timesCalled++
            } else {
                done()
            }
        })
    });

    it('should test isTyping event', function (done) {
        connectFirstClient()
        firstUserSocket.on('connect', () => {
            connectSecondClient()
        });
        firstUserSocket.on('isTyping', (data:MessageModel) => {
            expect(data).toBe(secondUsername)
            firstUserSocket.emit("isTyping")
        });
        secondUserSocket.on('connect', () => {
            secondUserSocket.emit("isTyping")
        });
        secondUserSocket.on('isTyping', (data) => {
            expect(data).toBe(firstUsername)
            done()
        });
    });

    it('should test stopTyping event', function (done) {
        connectFirstClient()
        firstUserSocket.on('connect', () => {
            connectSecondClient()
        });
        firstUserSocket.on('stopTyping', (data:MessageModel) => {
            expect(data).toBe(secondUsername)
            firstUserSocket.emit("stopTyping")
        });
        secondUserSocket.on('connect', () => {
            secondUserSocket.emit("stopTyping")
        });
        secondUserSocket.on('stopTyping', (data) => {
            expect(data).toBe(firstUsername)
            done()
        });
    });

    it('should test disconnect event should send userlist to client', function (done) {
        connectFirstClient()
        firstUserSocket.on('connect', () => {
            connectSecondClient()
        });
        secondUserSocket.on('connect', () => {
            firstUserSocket.disconnect()
        });
        secondUserSocket.on('userList',(users) => {
            expect(users).toContain(secondUsername)
            expect(users).not.toContain(firstUsername)
            done()
        })
    });

    it('should test disconnect event should send stopTyping to client', function (done) {
        connectFirstClient()
        firstUserSocket.on('connect', () => {
            connectSecondClient()
        });
        secondUserSocket.on('connect', () => {
            firstUserSocket.disconnect()
        });
        secondUserSocket.on('stopTyping',(user) => {
            expect(user).toContain(firstUsername)
            done()
        })
    });

});
