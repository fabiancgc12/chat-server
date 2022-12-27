export class BaseError extends Error{
    status:number;
    error:string

    constructor(status,error) {
        super(error);
        this.status = status
        this.error = error
    }
}