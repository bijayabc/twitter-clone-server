export const queries = `#graphql
    getAllTweets: [Tweet]
    getPresignedURLForTweet(imageName: String!, imageType: String!): String 
`