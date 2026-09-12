const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token provided"
        });
    }
    const actualToken = token.startsWith("Bearer ")
  ? token.split(" ")[1]
  : token;
    try {
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = protect;