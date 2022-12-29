export class BaseError extends Error{

    data:{
        status:number;
        error:string;
    }

    constructor(status,error) {
        super(error);
        this.data = {status,error}
    }
}