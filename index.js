// const { ApolloServer, gql } = require('apollo-server');
const mongoose = require("mongoose");
const Book = require("./Model/Book");
const Author = require("./Model/Author");
const Order = require("./Model/Order");
const Product = require("./Model/Product");
const User = require("./Model/User");

const { ApolloServer, gql } = require("apollo-server");
require("dotenv").config();
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
// const DATA_URL ="mongodb+srv://hoangthach1402:hoangthach123@cluster0.mmtet.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATA_URL, {
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

connectDB();

const typeDefs = gql`
  type Author {
    id: ID
    name: String
    age: Int
    books: [Book]
  }
  type Book {
    id: ID
    name: String
    genre: String
    author: Author
  }
  type User {
    id: ID
    name: String!
    mobile: String!
    address: String!
    orders: [Order]
  }
  type Product {
    id: ID
    name: String
    price: Float
    stock: Int
    type: String
    img: String
    orders: [Order]
  }
  type Order {
    id: ID
    user: User
    products: [Product]
    payying: Int
  }
  input InputProduct {
    id: ID
    name: String
    img: String
    stock: Int
    price: Float
    type: String
  }

  type Query {
    book(id: ID!): Book
    author(id: ID!): Author
    books: [Book]
    authors: [Author]

    users: [User]
    user(id: ID!): User

    orders: [Order]
    order(id: ID!): Order
    products: [Product]
    product(id: ID!): Product
  }
  type Mutation {
    createBook(name: String!, genre: String!, authorId: String!): Book
    createAuthor(name: String!, age: Int!): Author
    editAuthor(id: ID!, name: String, age: Int): Author
    editBook(id: ID!, name: String!, genre: String!, authorId: String!): Book
    deleteBook(id: ID!): Book
    deleteAuthor(id: ID!): Author
    createUser(name: String!, mobile: String!, address: String!): User
    editUser(id: ID!, name: String!, mobile: String!, address: String!): User
    deleteUser(id: ID!): User
    createProduct(
      name: String!
      stock: Int!
      type: String!
      img: String!
      price: Float!
    ): Product
    editProduct(
      id: ID!
      name: String!
      stock: Int!
      type: String!
      img: String!
      price: Float!
    ): Product
    deleteProduct(id: ID!): Product
    #  createOrder(userId:ID!,productId:String!,payying:Int!):Order
    createOrder(userId: ID!, input: [InputProduct]!, payying: Int!): Order
    editOrder(id: ID!, productId: String!, payying: Int!): Order
    deleteOrder(id: ID!): Order
  }
`;

const resolvers = {
  User: {
    orders: async (parent, args) => {
      //   let listOrder =[]
      console.log(parent);
      let orderList = await Order.find({ userId: parent._id });
      //   console.log(orderList);
      return orderList;
    },
  },
  Product: {
    orders: async (parent, args) => {
      let productId = parent._id;
      const order = await Order.find();

      let pattern = /[^']/g;

      let parseOrderProduct = order.map((o) => {
        return JSON.parse(JSON.stringify(o.productId).match(pattern).join(""));
      });
      
      let listOrder =[]
      for(var i=0 ; i<order.length;i++){
      let listProducts=  JSON.parse(JSON.stringify(order[i].productId).match(pattern).join(""));
      for(var j=0; j<listProducts.length;j++){
        if(listProducts[j].id === (parent._id).toString()){
          listOrder.push(order[i])
        }
      }
      }

      return listOrder
      // console.log(order)
      // let listOrder = [];
      // for (var i = 0; i < order.length; i++) {
      //   let listOrderProduct = order[i].productId.split(",");
      //   for (var j = 0; j < listOrderProduct.length; j++) {
      //     if (listOrderProduct[j] == productId) {
      //       listOrder.push(order[i]);
      //     }
      //   }
      // }

      // return listOrder;
      // console.log(parent);
    },
  },
  //tim san pham nam trong order nao ?
  //     [{order:1,}]
  Book: {
    author: async ({ authorId }, args) => {
      //  console.log(authorId)
      const result = await Author.findById(authorId);
      return result;
    },
  },
  Author: {
    books: async ({ _id }, args) => {
      // console.log(_id);
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
    products: async ({ productId }, args) => {
      // return
      return productId;
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
    user: async (parent, { id }) => {
      return await User.findById(id);
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
    editUser: async (parent, args) => {
      const user = await User.findById(args.id);
      user.name = args.name;
      user.mobile = args.mobile;
      user.address = args.address;
      return await user.save();
    },
    deleteUser: async (parent, args) => {
      return await User.findByIdAndDelete(args.id);
    },
    createProduct: async (parent, args) => {
      const newProduct = await new Product(args);
      return await newProduct.save();
    },
    editProduct: async (parent, args) => {
      const product = await Product.findById(args.id);
      product.name = args.name;
      product.type = args.type;
      product.img = args.img;
      product.stock = parseInt(args.stock);
      product.price = parseInt(args.price);
      return await product.save();
    },
    deleteProduct: async (parent, args) => {
      return await Product.findByIdAndDelete(args.id);
    },

    createOrder: async (parent, args) => {
      const a = JSON.parse(JSON.stringify(args));
      // console.log(a);
      const newOrder = await new Order({ ...a, productId: a.input });
      return await newOrder.save();
    },

    editOrder: async (parent, args) => {
      const order = await Order.findById(args.id);
      order.productId = args.productId;
      return await order.save();
    },
    deleteOrder: async (parent, args) => {
      return await Order.findByIdAndDelete(args.id);
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
  cors: {
    origin: "*", // <- allow request from all domains
    credentials: true,
  },

  typeDefs,
  resolvers,
  Introspection: true,
});

// PORT=4000

// const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen(process.env.PORT || 4000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
