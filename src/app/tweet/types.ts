export const types = `#graphql
    type Tweet {
        id: ID!
        content: String!
        imageURL: String

        author: User
        createdAt: String!
    }

    input createTweetData {
        content: String!
        imageURL: String
    }
`