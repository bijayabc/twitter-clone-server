import { Tweet } from "@prisma/client"
import { prismaClient } from "../clients/db"
import { redisClient } from "../clients/redis"

export interface createTweetPayload {
    content: string
    imageURL?: string
    userId: string
}

class TweetService {
    public static async createTweet(data: createTweetPayload) {
        const rateLimitFlag = await redisClient.get(`RATE_LIMIT:${data.userId}`)
        if (rateLimitFlag) throw new Error("Please wait before creating another tweet!")
            
        const tweet = await prismaClient.tweet.create({
            data: {
                content: data.content,
                imageURL: data.imageURL,
                author: { connect: { id: data.userId } }
            }
        })
        await redisClient.setex(`RATE_LIMIT:${data.userId}`, 10, 1)
        await redisClient.del('ALL_TWEETS')
        return tweet
    }

    public static async deleteTweet(tweetId: string, userId: string) {
        const tweet = await prismaClient.tweet.findUnique({
            where: { id: tweetId },
          });
        
          if (!tweet) throw new Error("Tweet not found");
          if (userId !== tweet.authorID) throw new Error("You can only delete your own tweets.");
        
          await prismaClient.tweet.delete({
            where: { id: tweetId },
          });
        
          await redisClient.del("ALL_TWEETS"); // Invalidate cache
        
          return tweet; // Returning the deleted tweet
    }

    public static async getAllTweets() {
        const cachedTweets = await redisClient.get('ALL_TWEETS')
        if (cachedTweets) return JSON.parse(cachedTweets)

        const tweets = await prismaClient.tweet.findMany({orderBy: {createdAt: 'desc'}})
        await redisClient.set('ALL_TWEETS', JSON.stringify(tweets))
        return tweets

    }
}

export default TweetService