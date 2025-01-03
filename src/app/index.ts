import express from "express"
import cors from 'cors'
import bodyParser from "body-parser"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { User } from "./user"

// Define schema
const typeDefs = `#graphql
    ${User.types}
    type Query {
        ${User.queries}
        }
`;

// Define resolvers
const resolvers = {
    Query: {
        ...User.resolvers.queries
    },
};

export async function initServer() {
    const app = express()
    app.use(bodyParser.json())
    app.use(cors())
    
    const graphqlServer = new ApolloServer({typeDefs, resolvers})

    // Start Apollo Server
    await graphqlServer.start()

    // Use Apollo Server middleware with Express
    app.use("/graphql", expressMiddleware(graphqlServer))

    return app

}
