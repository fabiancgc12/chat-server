export class MessageModel {
    timeStamp:number;

    constructor(public message:string,public user:string) {
        this.timeStamp = new Date().getTime()
    }
}