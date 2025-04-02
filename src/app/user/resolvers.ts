import axios from 'axios'
import { prismaClient } from '../../clients/db';
import JWTService from '../../services/jwt';
import { GraphQLContext } from '../../interfaces';
import { User } from '@prisma/client';
import UserService from '../../services/user';
import { redisClient } from '../../clients/redis';


const queries = {
    verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
        const resultToken = UserService.verifyGoogleAuthToken(token)
        return resultToken
    },

    getCurrentUser: async (parent: any, args: any, ctx: GraphQLContext) => {

        const id = ctx.user?.id
        if (!id) return null

        const user = await UserService.getUserById(id)

        return user
    },

    getUserById: async (parent: any, { id }: { id: string }, ctx: GraphQLContext) => UserService.getUserById(id)
}

const mutations = {
    followUser: async (parent: any, { to }: { to: string }, ctx: GraphQLContext) => {
        if (!ctx.user || !ctx.user.id) throw new Error("Not Authenticated!")
        await UserService.followUser(ctx.user?.id, to)
        await redisClient.del(`Recommended_Users:${ctx.user?.id}`)
        return true
    },

    unfollowUser: async (parent: any, { to }: { to: string }, ctx: GraphQLContext) => {
        if (!ctx.user || !ctx.user.id) throw new Error("Not Authenticated!")
        await UserService.unfollowUser(ctx.user?.id, to)
        await redisClient.del(`Recommended_Users:${ctx.user?.id}`)
        return true
    }
}

const extraResolvers = {
    User: {
        // The resolver for the `tweets` field in the User type
        tweets: (parent: User) => {
            // Fetches tweets by the author's id using Prisma's relation filtering
            // The nested author: { id: parent.id } suggests that author has a relation to another model
            return prismaClient.tweet.findMany({
                where: {
                    author: { id: parent.id }
                },
                orderBy: { createdAt: 'desc' }
            })
        },

        followers: async (parent: User) => {
            // Finds all "Follow" records where the current user (parent.id) is being followed
            // Includes the full user details of the follower
            const result = await prismaClient.follow.findMany({
                where: { followingId: parent.id }, // Finds users who follow this user
                include: { follower: true } // Fetch full follower user details
            });

            // Returns only the user objects of the followers
            return result.map(item => item.follower);
        },

        following: async (parent: User) => {
            // Finds all "Follow" records where the current user (parent.id) is following others
            // Includes the full user details of the following users
            const result = await prismaClient.follow.findMany({
                where: { followerId: parent.id }, // Finds users this user follows
                include: { following: true } // Fetch full following user details
            });

            // Returns only the user objects of the users this user is following
            return result.map(item => item.following);
        },

        recommendedUsers: async (parent: User, _: any, ctx: GraphQLContext) => {
            if (!ctx.user) return []

            const cachedValue = await redisClient.get(`Recommended_Users:${ctx.user?.id}`)
            if (cachedValue) return JSON.parse(cachedValue)

            // Fetch the list of users the authenticated user follows
            const myFollowings = await prismaClient.follow.findMany({
                where: { follower: { id: ctx.user?.id } }, // Find follow table entries where the authenticated user is the follower
                include: { 
                    following: { // // The user being followed
                        include: { 
                            followers: { // Users who follow the user that the authenticated user follows
                                include: {following: true}} } // Users that those followers follow (potential recommendations)
                } }
            })
            
            const recommendedUsers: User[] = [];
            const followingSet = new Set(myFollowings.map(entry => entry.followingId)); // Store followed user IDs for quick lookups

            // Iterate through each followed user
            for (const followedUserEntry of myFollowings) {
                // Iterate through followers of the followed user
                for (const followerEntry of followedUserEntry.following.followers) {
                    const recommendedUser = followerEntry.following; // User to potentially recommend

                    // Ensure we don't recommend the authenticated user or already-followed users
                    if (!followingSet.has(recommendedUser.id) && recommendedUser.id !== ctx.user?.id) {
                        recommendedUsers.push(recommendedUser);
                        followingSet.add(recommendedUser.id); // Avoid duplicates
                    }
                }
            }

            await redisClient.set(`Recommended_Users:${ctx.user?.id}`, JSON.stringify(recommendedUsers))

            return recommendedUsers;
        }
    }
}

export const resolvers = { queries, extraResolvers, mutations }