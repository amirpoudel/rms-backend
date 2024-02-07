const asyncHandler = function (requestHandler: any) {
    return async (req:any, res:any, next:any) => {
        try {
            await Promise.resolve(requestHandler(req, res, next));
        } catch (error) {
            next(error);
        }
    };
};


export default asyncHandler;
