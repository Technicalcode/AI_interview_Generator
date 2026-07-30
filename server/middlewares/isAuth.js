const jwt = require("jsonwebtoken")


const isAuth = async (req, res, next) => {
    try {
        let { token } = req.cookies
        if (!token) {
            return res.status(401).json({ message: "Not authenticated" })
        }
        const jwtSecret = process.env.JWT_SECRET || process.env.SECRET_KEY;

        if (!jwtSecret) {
            return res.status(500).json({ message: "JWT secret is not configured" })
        }

        const verifyToken = jwt.verify(token, jwtSecret)

        if (!verifyToken) {
            return res.status(401).json({ message: "Invalid token" })
        }
        req.userId = verifyToken.userId

        next();
    } catch (error) {
        return res.status(500).json({ message: `isAuth error ${error}` })
    }
}

module.exports = isAuth;
