module.exports = {
    jwtSecret: process.env.JWT_SECRET || "MyS3cr3tK3Y",
    jwtSession: {
      session: false
    }
  };