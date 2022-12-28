import {BaseError} from "./BaseError";

export class AuthError extends BaseError{
    constructor() {
        super(401,"Unauthorized");

    }

}