module.exports = {
	jwtSecret: process.env.JWT_SECRET || "fart",
	jwtSession: {
		session: false
	}
}