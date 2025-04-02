import { User } from "@prisma/client"
import JWT from "jsonwebtoken"
import { JWTUser } from "../interfaces"

const JWT_SECRET = "$uper@1234."


class JWTService {
    // Generate token for user
    public static generateTokenForUser(user: User): string {
        const payload: JWTUser = {
            id: user.id,
            email: user.email,
        };

        const token = JWT.sign(payload, JWT_SECRET);

        return token;
    }

    // Decode the token and return user data or null if invalid
    public static decodeToken(token: string) {
        try {
            const user = JWT.verify(token, JWT_SECRET)
            console.log("Token successfully decoded. User:", user);
            return user as JWTUser;

        } catch (error) {
            // Log error and return null if token doesn't exist or if decoding fails
            console.error("Token decoding failed:", error);
            return null;
        }
    }
}

export default JWTService;