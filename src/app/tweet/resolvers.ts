import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphQLContext } from "../../interfaces";

interface createTweetPayload {
    content: string
    imageURL: string
}

const queries = {
    getAllTweets: () => {
        return prismaClient.tweet.findMany({orderBy: {createdAt: 'desc'}})
    }
}

const mutations = {
    createTweet: async(parent:any, {payload}: {payload: createTweetPayload}, ctx: GraphQLContext) => {
        if (!ctx.user) throw new Error('You are not logged in!')
        
        const tweet = await prismaClient.tweet.create({
            data: {
                content: payload.content,
                imageURL: payload.imageURL,
                author: {connect: {id: ctx.user.id}}
            }
        })

        return tweet
    }
}

const extraResolvers = {
    Tweet: {
        // The resolver for the `author` field in the Tweet type
        author: (parent: Tweet) => {
            return prismaClient.user.findUnique( {where: {id: parent.authorID}} )
        }
    }
}

export const resolvers = {queries, mutations, extraResolvers}