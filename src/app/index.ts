import express from "express"
import cors from 'cors'
import bodyParser from "body-parser"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { User } from "./user"
import { Tweet } from "./tweet"
import JWTService from "../services/jwt"
import { GraphQLContext } from "../interfaces"

// Define schema
const typeDefs = `#graphql
    ${User.types}
    ${Tweet.types}

    type Query {
        ${User.queries}
        ${Tweet.queries}
        }
    
    type Mutation {
        ${Tweet.mutations}
    }
`;

// Define resolvers
const resolvers = {
    Query: {
        ...User.resolvers.queries,
        ...Tweet.resolvers.queries
    },
    Mutation: {
        ...Tweet.resolvers.mutations,
    },
    ...User.resolvers.extraResolvers,
    ...Tweet.resolvers.extraResolvers
};

export async function initServer() {
    const app = express()
    app.use(bodyParser.json())
    app.use(cors())

    const graphqlServer = new ApolloServer<GraphQLContext>({typeDefs, resolvers})

    // Start Apollo Server
    await graphqlServer.start()

    // Use Apollo Server middleware with Express
    app.use("/graphql", expressMiddleware(graphqlServer, {
        context: async ({req, res}) => {
            return {
                user: req.headers.authorization
                ? JWTService.decodeToken(req.headers.authorization.split('Bearer ')[1]) 
                : ""
            }
        }
    }))

    return app

}


// , {
//     context: async({req, res}) => {
//         console.log("Context token: ", req.headers.authorization)
        
//         return {
//             user: 
//             req.headers.authorization ? 
//             JWTService.decodeToken(req.headers.authorization.split("Bearer ")[1]) : 
//             undefined
//         }
//     }}