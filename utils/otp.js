const crypto = require("crypto");

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const hashOTP = (otp) => {
    return crypto.createHash("sha256").update(otp).digest("hex");
};

const verifyOTP = (otp,hashedOTP) => {
    const hashedInput = hashOTP(otp);
    return hashedInput === hashedOTP;
};

module.exports = {
    generateOTP,
    hashOTP,
    verifyOTP
}