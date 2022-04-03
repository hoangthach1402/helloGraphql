// const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose'); 
const Book = require('./Model/Book')

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
type Author{
    id:ID
    name :String 
    age:Int 
    books:[Book]
}
type Book {
    id:ID 
    name: String
    genre: String
    author: Author
}
type User {
   id:ID
   name:String 
   email:String 
   mobile:String 
   password:String 
   orders:[Order]
} 
type Product{
  id:ID
  name:String 
  price:Float
  stock:Int 
  type:String 
  img:String
  orders:[Order]   
}
type Order {
  id:ID 
  user:User
  products:[Product]
} 
type Query {
    book(id:ID!):Book 
    author(id:ID!):Author 
    books:[Book]
    authors:[Author] 
        
  users:[User] 
  user(id: ID!): User 
  
  orders:[Order] 
  order(id:ID!):Order 
  products:[Product]
  product(id: ID!):Product
}
type Mutation {
 
    createBook(name:String!, genre:String! ,authorId:String!):Book 
    createAuthor(name:String!,age:Int!):Author 
    editAuthor(id:ID!,name:String,age:Int):Author 
    editBook(id:ID!,name:String!,genre:String!,authorId:String!):Book 
    deleteBook(id:ID!) :Book 
    deleteAuthor(id:ID!):Author 
   createUser(name:String!, email:String!, mobile:String!, password:String!):User 
   createProduct(name:String!,stock:Int!,type:String!,img:String!,price:Float!):Product 
   createOrder(userId:ID!,productId:ID!):Order 
}   
 `;


const resolvers = {
  User:{
  orders:async(parent,args)=>{
//   let listOrder =[] 
console.log(parent);
  let orderList = await Order.find({userId:parent._id}) 
//   console.log(orderList);
 return orderList
}
   
  
  },
  Product: {
    orders: async (parent, args) => {
      let productId = parent._id;
      const order = await Order.find();
      let listOrder = [];
      for (var i = 0; i < order.length; i++) {
        let listOrderProduct = order[i].productId.split(",");
        for (var j = 0; j < listOrderProduct.length; j++) {
          if (listOrderProduct[j] == productId) {
            listOrder.push(order[i]);
          }
        }
      }

      return listOrder;
    },
  },
  Book: {
    author: async ({ authorId }, args) => {
      const result = await Author.findById(authorId);
      return result;
    },
  },
  Author: {
    books: async ({ _id }, args) => {
      const result = await Book.find({ authorId: _id });
      return result;
    },
  },
  Order: {
    user: async (parent, args) => {
      // console.log(parent)
      const user = await User.findById(parent.userId);
      return user;
    },
    products: async (parent, args) => {
      let listProducts = parent.productId.split(",");
      let newListProduct = [];
      for (var i = 0; i < listProducts.length; i++) {
        var item = await Product.findById(listProducts[i]);
        newListProduct.push(item);
      }
      return newListProduct;
    },
  },

  Query: {
    books: async () => {
      return await Book.find();
    },
    book: async (parent, { id }) => {
      return await Book.findById(id);
    },
    authors: async () => {
      return await Author.find();
    },
    author: async (parent, { id }) => {
      return await Author.findById(id);
    },
    users: async () => {
      return await User.find({});
    },
    user:async(parent,{id})=>{
    return await User.findById(id)
    },
    orders: async () => {
      return await Order.find({});
    },

    order: async (parent, { id }) => {
      return await Order.findById(id);
    },
    product: async (parent, { id }) => {
      return await Product.findById(id);
    },
    products: async () => {
      return await Product.find({});
    },
  },
  Mutation: {
    createUser: async (parent, args) => {
      const newUser = await new User(args);
      return await newUser.save();
    },
    createProduct: async (parent, args) => {
      const newProduct = await new Product(args);
      return await newProduct.save();
    },
    createOrder: async (parent, args) => {
      const newOrder = await new Order(args);
      return await newOrder.save();
    },
    createAuthor: async (parent, args) => {
      const newOrder = await new Author(args);
      return await newOrder.save();
    },
    createBook: async (parent, args) => {
      const newOrder = await new Book(args);
      return await newOrder.save();
    },
    editAuthor: async (parent, args) => {
      //  console.log(args);
      let editAuthor = await Author.findByIdAndUpdate(args.id);
      editAuthor.name = args.name;
      editAuthor.age = args.age;
      editAuthor.save();
      return editAuthor;
    },
    editBook: async (parent, args) => {
      let editBook = await Book.findByIdAndUpdate(args.id);
      (editBook.name = args.name),
        (editBook.genre = args.genre),
        (editBook.authorId = args.authorId);
      await editBook.save();
      return editBook;
    },
    deleteAuthor: async (parent, args) => {
      return await Author.findByIdAndDelete(args.id);
    },
    deleteBook: async (parent, args) => {
      return await Book.findByIdAndDelete(args.id);
    },
  },
};
const server = new ApolloServer({ 
  typeDefs, 
  resolvers
});


// PORT=4000 


const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen(process.env.PORT||4000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});