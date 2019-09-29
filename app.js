var express = require("express");
var graphqlHTTP = require("express-graphql");
var Graphql = require("graphql");
var fetch = require("node-fetch");

const ticketType = new Graphql.GraphQLObjectType({
  name:"Ticket",
  fields:{
    id : {type:Graphql.GraphQLString},
    status : {type:Graphql.GraphQLString},
    amount : {type:Graphql.GraphQLInt},
    totalPrice: {type:Graphql.GraphQLInt},
    productId:{type:Graphql.GraphQLString},
    date:{type:Graphql.GraphQLString},
    qrData:{type:Graphql.GraphQLString}
  }
});
const productType = new Graphql.GraphQLObjectType({
  name:"Product",
  fields:{
    id : {type:Graphql.GraphQLString},
    name:{type:Graphql.GraphQLString},
    sellerId:{type:Graphql.GraphQLString},
    image:{type:Graphql.GraphQLString},
    category:{type:Graphql.GraphQLString},
    subCategory:{type:Graphql.GraphQLString},
    info:{type:Graphql.GraphQLString},
    area:{type:Graphql.GraphQLString},
    price:{type:Graphql.GraphQLInt},
    option:{type:Graphql.GraphQLString}

  }
})

var queryType = new Graphql.GraphQLObjectType({
  name: "Query",
  fields: {
    ticket:{
      type: ticketType,
      args:{
        id:{type: Graphql.GraphQLString},
        qrData:{type: Graphql.GraphQLString}
      },
      resolve: async function(_,{ qrData,id }){
        
        let res = await (await fetch('http://54.180.170.213/api/ticket/'+id)).json();
        return res.data;
      }
    },
    allTicket:{
      type: new Graphql.GraphQLList(ticketType),
      resolve: async function(_,_,_,_) {
        const res = await (await fetch('http://54.180.170.213/api/ticket')).json(); 
        return  res.data;
      }
    },
    productById:{
      type: productType,
      args:{
        id : {type:Graphql.GraphQLString}
      },
      resolve: async function(_,{id}){
        const res = await (await fetch('http://54.180.170.213/api/product/'+id)).json();
        return res.data;
      }
    },
    productByCategory:{
      type: productType,
      args:{
        category:{type:Graphql.GraphQLString}
      },
      resolve: async function({category}){
        const res = await (await fetch('http://54.180.170.213/api/product/category/'+category)).json();
        return res.data;
      }
    },
    product:{
      type: new Graphql.GraphQLList(productType),
      resolve: async function(_,_,_){
        const res = await (await fetch('http://54.180.170.213/api/product')).json();

        return res.data;
      }
    }
  }
});

var schema = new Graphql.GraphQLSchema({ query: queryType });

var app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true
  })
);
app.listen(4000);
console.log("Running a GraphQL server");