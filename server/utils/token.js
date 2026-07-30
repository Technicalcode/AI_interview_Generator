const jwt = require("jsonwebtoken");

const genToken = async (userId) => {
   try {
      const jwtSecret = process.env.JWT_SECRET || process.env.SECRET_KEY;

      if (!jwtSecret) {
         throw new Error("Missing JWT secret. Set JWT_SECRET in server/.env.");
      }

      const token = jwt.sign({ userId }, jwtSecret, {
         expiresIn: "7d"
      });
      return token;
   } catch (error) {
      console.log("Token Generation Error : ", error);
      throw error;
   }
};

module.exports = genToken; // ✅ export default hata ke ye lagao
