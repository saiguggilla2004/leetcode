const { createClient } = require("redis");

const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "redis-11981.c246.us-east-1-4.ec2.redns.redis-cloud.com",
    port: 11981,
  },
});

module.exports = redisClient;
