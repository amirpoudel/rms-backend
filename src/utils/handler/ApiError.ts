import { error } from "console";

class ApiError extends Error {
    statusCode: number;
    data: any | null;
    success: boolean;
    error: any;
    errors: any[];

    constructor(
        statusCode: number,
        message: string = "Something went wrong",
        error: any = null,
        errors: any[] = [],
        stack: string = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.error= error
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;
