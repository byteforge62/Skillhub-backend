const {ZodError} = require("zod");
const ResponseHandler = require("../utils/ResponseHandler");
const logger = require("../config/logger");

const handleCastError = (err) => ({
  statusCode:400,
message: `Invalid value '${err.value}' for '${err.path}'.`,
});

const handleDuplicateKeyError = (err) => ({
  statusCode:409,
  message:`${Object.keys(err.keyValue)[0]} already exists`,
});

const handleValidationError = (err) => ({
  statusCode:400,
  message: Object.values(err.errors)
  .map(error => error.message)
  .join(", ")
});

const handleZodError = (err) => ({
  statusCode: 400,
  message:"validation failed",
  errors: err.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }))
})

const errorHandler = (err, req, res, next) => {
  logger.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = null;

  if(err instanceof ZodError) {
    const zod = handleZodError(err);
    statusCode = zod.statusCode;
    message = zod.message;
    errors = zod.errors;
  }else if (err.name === "CastError"){
    const cast = handleCastError(err);
    statusCode = cast.statusCode;
    message = cast.message;
  }else if (err.code === 11000){
    const duplicate = handleDuplicateKeyError(err);
    statusCode = duplicate.statusCode;
    message = duplicate.message;
  }else if(err.name === "ValidationError"){
    const validation = handleValidationError(err);
    statusCode = validation.statusCode;
    message = validation.message;
  }

  return ResponseHandler.error(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === "development" ? errors || err.stack : errors
  );
};

module.exports = errorHandler;
