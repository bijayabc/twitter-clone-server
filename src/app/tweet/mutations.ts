export const mutations = `#graphql
    createTweet(payload: createTweetData!): Tweet
    deleteTweet(tweetId: ID!): Tweet
`