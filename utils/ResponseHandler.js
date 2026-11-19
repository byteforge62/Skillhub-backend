class ResponseHandler {
    static success(res,message,data = null,statusCode = 200,meta = null){
        return res.status(statusCode).json({
            success:true,
            message,
            data,
            meta,
        });
    }

    static error(res,message,statusCode = 500,errors = null){
        return res.status(statusCode).json({
            success:false,
            message,
            errors,
        })
    }
}

module.exports = ResponseHandler;