// const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose'); 
const Book = require('./Model/Book')
const
// const express = require('express')
// const { ApolloServer,gql } = require('apollo-server-express')
//  const cors = require('cors')
const { ApolloServer, gql } = require('apollo-server')
 require('dotenv').config()
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
// const DATA_URL ="mongodb+srv://hoangthach1402:hoangthach123@cluster0.mmtet.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

const connectDB = async () => {

	try {
		await mongoose.connect(process.env.DATA_URL, {
		
			useUnifiedTopology: true,
		
		})

		console.log('MongoDB connected')
	} catch (error) {
		console.log(error.message)
		process.exit(1)
	}
}

connectDB()

const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    id:ID 
    name: String
    genre: String
   
}

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
  }
`;
const books = [
    {
      title: 'The Awakening',
      author: 'Kate Chopin',
    },
    {
      title: 'City of Glass',
      author: 'Paul Auster',
    },
  ];

const resolvers = {
  Query: {
    books: async () => {
        return await Book.find();
      },
  },
};


const server = new ApolloServer({
	typeDefs,
	resolvers,
	
})
// const PORT=4000 


const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen(process.env.PORT||4000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});