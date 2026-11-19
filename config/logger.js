const winston = require("winston");

const logger = winston.createLogger({
    level:"info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({stack:true}),
        winston.format.printf(({timestamp,level,message,stack}) => {
            return stack 
             ? `${timestamp} [${level.toUpperCase()}] ${stack}` 
             : `${timestamp} [${level.toUpperCase()}] ${message}`;
        })
    ),

    transports : [
        new winston.transports.Console(),
    ]
});

module.exports = logger;