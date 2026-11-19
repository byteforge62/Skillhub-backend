const Redis = require("ioredis");
const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
});

redis.on("connect", () => {
    console.log("✅ Redis Connected");
});

redis.on("ready", () => {
    console.log("🚀 Redis Ready");
});

redis.on("error", (err) => {
    console.error("❌ Redis Error:", err);
});

module.exports = redis;