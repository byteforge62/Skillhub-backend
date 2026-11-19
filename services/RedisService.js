const redis = require("../config/redis");
const EMAIL_VERIFICATION_PREFIX = "verify-email:";
const PASSWORD_RESET_PREFIX = "password-reset:";
const LOGIN_ATTEMPTS_PREFIX = "login-attempts:";

class RedisService {

    async set(key,value,ttlSeconds = null){
        const serializedValue = typeof value === "string" ? value : JSON.stringify(value);
        if(ttlSeconds){
            await redis.set(key,serializedValue,"EX",ttlSeconds);
        }else{
            await redis.set(key,serializedValue);
        }
    }

    async get(key){
        const value = await redis.get(key);
        if(!value) return null;
        try{
           return JSON.parse(value);
        }catch{
           return value;
        }
    }

    async delete(key){
        await redis.del(key);
    }

    async exists(key){
        return await redis.exists(key);
    }

    async expire(key,ttlSeconds){
        await redis.expire(key,ttlSeconds);
    }

    //Email verification OTP
    async storeEmailVerificationOTP(userId,hashedOTP){
        await redis.set(`${EMAIL_VERIFICATION_PREFIX}${userId}`,hashedOTP,"EX",600);
    }

    async getEmailVerificationOTP(userId){
        return await redis.get(`${EMAIL_VERIFICATION_PREFIX}${userId}`);
    }

    async deleteEmailVerificationOTP(userId){
        return await redis.del(`${EMAIL_VERIFICATION_PREFIX}${userId}`);
    }
    // Password Reset OTP
    async storePasswordResetOTP(userId, hashedOTP){
        await redis.set(`${PASSWORD_RESET_PREFIX}${userId}`,hashedOTP,"EX",600);
    }

    async getPasswordResetOTP(userId){
        return await redis.get(`${PASSWORD_RESET_PREFIX}${userId}`);
    }

    async deletePasswordResetOTP(userId){
        await redis.del(`${PASSWORD_RESET_PREFIX}${userId}`);
    }


    // Login Attempts
    async incrementLoginAttempts(email){
        const key = `${LOGIN_ATTEMPTS_PREFIX}${email}`;
        const attempts = await redis.incr(key);
        if(attempts === 1){
            await redis.expire(key,900);
        }
        return attempts;
    }

    async getLoginAttempts(email){
        const attempts = await redis.get(`${LOGIN_ATTEMPTS_PREFIX}${email}`);
        return Number(attempts) || 0;
    }


    // Cache Helpers

    async cache(key,data,ttl = 300){
        await this.set(key,data,ttl);
    }

    async clearCache(key){
        await this.delete(key);
    }
}

module.exports = new RedisService();