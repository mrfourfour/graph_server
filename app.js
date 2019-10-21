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
// const categoryType = new Graphql.GraphQLObjectType({
//   name:"category",
//   fields:{
//     cate = {type:Graphql.GraphQLString}
//   }
// })

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
        
        let {data} = await (await fetch('http://54.180.170.213/api/ticket/'+id)).json();
        return data;
      }
    },
    allTicket:{
      type: new Graphql.GraphQLList(ticketType),
      resolve: async function(_,_,_,_) {
        const {data} = await (await fetch('http://54.180.170.213/api/ticket')).json();
        return  data;
      }
    },
    productById:{
      type: productType,
      args:{
        id : {type:Graphql.GraphQLString}
      },
      resolve: async function(_,{id}){
        const {data} = await (await fetch('http://54.180.170.213/api/product/'+id)).json();
        return data;
      }
    },
    // /api/product/area/{area}/category/{category}
    productByCategory:{
      type: new Graphql.GraphQLList(productType),
      args:{
        area : {type:Graphql.GraphQLString},
        category : {type:Graphql.GraphQLString}
      },
      resolve: async function(_,{area, category}){
        const {data} = await (await fetch('http://54.180.170.213/api/product/area/'+area+'/category/'+category)).json();
        return data;
      }
    },
    categoryList:{
      type : new Graphql.GraphQLList(Graphql.GraphQLString),
      resolve: async function(_,_){
        const data = await (await fetch('http://54.180.170.213/api/category/')).json();
        console.log(data)
        return data;
      }
    },
    areaList:{
      type : new Graphql.GraphQLList(Graphql.GraphQLString),
      resolve: async function(_,_){
        const data = await (await fetch('http://54.180.170.213/api/area/')).json();
        console.log(data)
        return data;
      }
    },
    // productByCategory:{
    //   type: new Graphql.GraphQLList(productType),
    //   args:{
    //     category : {type:Graphql.GraphQLString}
    //   },
    //   resolve: async function(_,{category}){
    //     const {data} = await (await fetch('http://54.180.170.213/api/product/category/'+category)).json();
    //     return data;
    //   }
    // },
    product:{
      type: new Graphql.GraphQLList(productType),
      resolve: async function(_,_,_){
        const {data} = await (await fetch('http://54.180.170.213/api/product')).json();
        return data;
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