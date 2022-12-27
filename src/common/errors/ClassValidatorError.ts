import {BaseError} from "./BaseError";

export class ClassValidatorError extends BaseError{
    constructor(error:Record<string,string>) {
        const errorArray = Object.values(error)
        super(400,errorArray);
    }
}