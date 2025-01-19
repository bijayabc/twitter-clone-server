import axios from 'axios'
import { prismaClient } from '../../clients/db';
import JWTService from '../../services/jwt';
import { GraphQLContext } from '../../interfaces';

interface GoogleTokenResult {
    iss?: string;
    nbf?: string;
    aud?: string;
    sub?: string;
    email?: string;
    email_verified?: string;
    azp?: string;
    name?: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
    iat?: string;
    exp?: string;
    jti?: string;
    alg?: string;
    kid?: string;
    typ?: string;
}

const queries = {
    verifyGoogleToken: async(parent:any, {token}: {token: string}) => {
        const googleToken = token
        
        try {
            const googleOauthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
            googleOauthURL.searchParams.set("id_token", googleToken);

            // Verify token with Google
            const { data } = await axios.get<GoogleTokenResult>(googleOauthURL.toString(), {
                responseType: 'json',
            });

            if (!data.email) {
                throw new Error('Google token verification failed: Email is undefined.');
            }

            // Check if user exists
            const user = await prismaClient.user.findUnique({
                where: { email: data.email },
            });

            // Create user if not found
            if (!user) {
                await prismaClient.user.create({
                    data: {
                        email: data.email,
                        firstName: data.given_name || '',
                        lastName: data.family_name,
                        profileImageURL: data.picture,
                    },
                });
            }

            // create a new object to pass into generateTokenForUser
            // the user object created above cannot be used because it could be undefined when user doesn't exist
            // userInDb will reference user as it is executed after creation
            const userInDb = await prismaClient.user.findUnique({
                where: {email: data.email}
            })

            if(!userInDb) throw new Error("User with email not found")

            const userToken = JWTService.generateTokenForUser(userInDb)
            
            return userToken;
            
        } catch (error) {
            console.error('Error verifying Google token:', error);
            throw new Error('Failed to verify Google token.');
        }
    },

    getCurrentUser: async(parent: any, args: any, ctx: GraphQLContext) => {

        const id = ctx.user?.id
        if (!id) return null

        const user = await prismaClient.user.findUnique( {where: {id}})
        
        return user
    }
}

export const resolvers = { queries}