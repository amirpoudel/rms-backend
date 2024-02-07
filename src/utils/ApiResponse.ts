// Purpose: Define the ApiResponse class to be used as a response object for the API.
// can also use constructor function instead of class
class ApiResponse {
    readonly statusCode: number;
    readonly data: any;
    readonly message: string;
    readonly success: boolean;

    constructor(statusCode:number,data:any,message:string="Success",success:boolean = statusCode<400){
            this.statusCode = statusCode;
            this.data = data;
            this.message = message;
            this.success = success;

    }
}


export default ApiResponse;