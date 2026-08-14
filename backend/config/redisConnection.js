const redisConnection = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      tls: {
          rejectUnauthorized: false
      },
      maxRetriesPerRequest: null
  }

  export default redisConnection
