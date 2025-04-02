import { Tweet } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { prismaClient } from "../../clients/db";
import { GraphQLContext } from "../../interfaces";
import UserService from "../../services/user";
import TweetService, { createTweetPayload } from "../../services/tweet";

const s3Client = new S3Client({
    region: process.env.AWS_DEFAULT_REGION
})

const queries = {
    getAllTweets: () => {
        return TweetService.getAllTweets()
    },
    
    getPresignedURLForTweet: async (parent: any, { imageName, imageType }: { imageName: string, imageType: string }, ctx: GraphQLContext) => {
        if (!ctx.user || !ctx.user.id) throw new Error("Not authenticated")

        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        if (!allowedImageTypes.includes(imageType)) throw new Error("Unsupported Image Type")


        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now()}.${imageType.split('/')[1]}`
        })

        const signedURL = await getSignedUrl(s3Client, putObjectCommand)

        return signedURL

    }

}

const mutations = {
    createTweet: async (parent: any, { payload }: { payload: createTweetPayload }, ctx: GraphQLContext) => {
        if (!ctx.user) throw new Error('You are not logged in!')

        const tweet = await TweetService.createTweet({...payload, userId: ctx.user.id})

        return tweet
    }
}

const extraResolvers = {
    Tweet: {
        // The resolver for the `author` field in the Tweet type
        author: (parent: Tweet) => {
            return UserService.getUserById(parent.authorID)
        }
    }
}

export const resolvers = { queries, mutations, extraResolvers }