const {GraphQLDateTime } = require('graphql-iso-date');
const mongoose = require("mongoose");
const { v1: uuidv1 } = require('uuid');
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
   scalar Date 
 
  type User {
    id: ID
    name: String!
    mobile: String!
    address: String!
    orders: [Order]
    createdAt: Date!
  }
  type Product {
    id: ID
    name: String
    price: Float
    stock: Int
    type: String
    img: String
    orders: [Order]
    createdAt: Date!
  }
  type ProductOrder {
    id: ID
    productId:String
    name: String
    price: Float
    stock: Int
    type: String
    img: String
  }
    

  type Order {
    id: ID
    user: User
    products: [ProductOrder]
    payying: Int
    createdAt: Date!
    notes:String 
    status:String 
  }
  input InputProduct {
    id:ID
    productId: String
    stock: Int
    price: Float
    name: String
    img: String
    type: String
  }
 type length{
  products:Int! 
  orders:Int! 
  users:Int!
 }
  type Query {
    users: [User]
    user(id: ID!): User
    orders: [Order]
    order(id: ID!): Order
    products: [Product]
    product(id: ID!): Product
    searchUserByMobile(mobile:String!):[User]
    getLength:length
    searchProduct(productName:String!):[Product]
    sortByTypeProuct(type:String!):[Product]
    sortByStockLessThan(stock:Int!):[Product]
    filterOrderToday(daytime:Int!):[Order]
  }
   


  type Mutation {
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
    editOrder(id: ID!, input: [InputProduct]!, payying: Int!): Order
    deleteOrder(id: ID!): Order
  }
`;

const resolvers = {
  Date: GraphQLDateTime,
  
  User: {
    orders: async (parent, args) => {
     
      let orderList = await Order.find({ userId: parent._id }).sort({_id:-1});
   
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
     
      let listOrder = [];
      for (var i = 0; i < order.length; i++) {
        let listProducts = JSON.parse(
          JSON.stringify(order[i].productId).match(pattern).join("")
        );
        for (var j = 0; j < listProducts.length; j++) {
          if (listProducts[j].productId === parent._id.toString()) {
            listOrder.push(order[i]);
          }
        }
      }
      listOrder.sort((a,b)=>b.createdAt - a.createdAt)
      return listOrder;
    },
  },

  Order: {
    user: async (parent, args) => {
      // console.log(parent)
      const user = await User.findById(parent.userId);
      return user;
    },
    products: async (parent, args) => {
    return JSON.parse(JSON.stringify(parent.productId));
    },
  },
   

  Query: {
    filterOrderToday:async(parent,{daytime})=>{
    // console.log(daytime)
     const oneday = new Date(new Date().getTime() - 60*1000*1440*daytime).toISOString()
     return await Order.find({createdAt:{$gte:oneday}}).limit(10).sort({createdAt:-1})
    }, 
    sortByStockLessThan:async (parent, {stock}) => {
    console.log(stock)
    const listProducts = await Product.find({stock:{$lte:stock}}).limit(10).sort({name:1})
    return listProducts
    },
    sortByTypeProuct:async(parent,{type})=>{
     const pattern = new RegExp(type,'i')
     return await Product.find({type:{$regex:pattern}}).limit(15).sort({name:1})
    }, 
   getLength :async(parent,args)=>{
    const lengthProduct = await Product.count()
    const lengthUser= await User.count()
    const lengthOrder = await Order.count()  
    return ({products:lengthProduct,orders:lengthOrder,users:lengthUser}) 
  },
    searchProduct:async(parent,{productName})=>{
      const pattern =new RegExp(productName,'i');
      return await Product.find({name:{$regex:pattern}}).limit(3).sort({name:1})
    },
    searchUserByMobile:async (parent,{mobile})=>{
      // console.log(mobile.slice(0,1))
      const isMobile = mobile.slice(0,1)=="0";
      
      if(isMobile){
       const searchString = mobile ; 
       const pattern =new RegExp(searchString);
       console.log(pattern)
      return await User.find({mobile:{$regex:pattern}}).limit(2).sort({name:1})
      }else{
       const searchString = mobile ; 
       const pattern =new RegExp(searchString,'i');
       console.log(pattern)
      return await User.find({name:{$regex:pattern}}).limit(2).sort({name:1});
      }
     },
    users: async () => {
      return await User.find({}).sort({_id:-1});
    },
    user: async (parent, { id }) => {
      return await User.findById(id);
    },
    orders: async () => {
      return await Order.find({}).sort({_id:-1});
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
      // const products = await Product.findByIdAndUpdate();
      const userId = a.userId;
      const listProductId = a.input;
      for(var i=0; i<listProductId.length;i++){
       
       let productId = listProductId[i].productId 
       let stockOrder = listProductId[i].stock 
       let productDB = await Product.findByIdAndUpdate(productId);
       let stockDB = productDB.stock
        productDB.stock = stockDB -parseInt(stockOrder);
        await productDB.save();
      }
      const payyingInput = parseInt(a.payying);
     const newOrder = await new Order({
       userId: userId,
       productId: listProductId,
       payying: payyingInput,
     });
     
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
