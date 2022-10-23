import jwt from "jsonwebtoken";

export const verifyJWT = (request, response, next) => {
  const authHeader =
    request.headers.authorization || request.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return response.status(401).json({ message: "You are not authorized." });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return response.status(403).json({ message: "Token is not valid." });
    }

    request.user = decoded.userId;
    next();
  });
};
