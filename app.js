var express = require("express");
var graphqlHTTP = require("express-graphql");
var Graphql = require("graphql");
var fetch = require("node-fetch");
const url = 'http://ticket.ap-northeast-2.elasticbeanstalk.com'


const ticketType = new Graphql.GraphQLObjectType({
  name: "Ticket",
  fields: {
    id: { type: Graphql.GraphQLString },
    status: { type: Graphql.GraphQLString },
    amount: { type: Graphql.GraphQLInt },
    totalPrice: { type: Graphql.GraphQLInt },
    productId: { type: Graphql.GraphQLString },
    userId:{type:Graphql.GraphQLString},
    optionId:{type:Graphql.GraphQLString},
    date: { type: Graphql.GraphQLString },
    qrData: { type: Graphql.GraphQLString }
  }
});
const productOptionsType = new Graphql.GraphQLObjectType({
  name: "pOptions",
  fields: {
    id:{type:Graphql.GraphQLString},
    description:{type:Graphql.GraphQLString},
    date:{type:Graphql.GraphQLString},
    amout:{type:Graphql.GraphQLInt}
  }
})
const reviewsType = new Graphql.GraphQLObjectType({
  name:"Review",
  fields:{
    userid:{type:Graphql.GraphQLString},
    title:{type:Graphql.GraphQLString},
    description:{type:Graphql.GraphQLString},
    rate:{type:Graphql.GraphQLInt}
  }
})

const productType = new Graphql.GraphQLObjectType({
  name: "Product",
  fields: {
    id: { type: Graphql.GraphQLString },
    name: { type: Graphql.GraphQLString },
    sellerId: { type: Graphql.GraphQLString },
    image: { type: Graphql.GraphQLString },
    category: { type: Graphql.GraphQLString },
    subCategory: { type: Graphql.GraphQLString },
    info: { type: Graphql.GraphQLString },
    area: { type: Graphql.GraphQLString },
    price: { type: Graphql.GraphQLInt },
    options: { type: Graphql.GraphQLList(productOptionsType) },
    reviews:{type:Graphql.GraphQLList(reviewsType)}
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
    ticket: {
      type: ticketType,
      args: {
        id: { type: Graphql.GraphQLString },
        qrData: { type: Graphql.GraphQLString }
      },
      resolve: async function (_, { qrData, id },key) {

        let { data } = await (await fetch(url+'/api/ticket/' + id,{headers:{"Authorization":"Bearer "+key.headers['authorization'],'Content-Type': 'application/json'}})).json();
        return data;
      }
    },
    allTicket: {
      type: new Graphql.GraphQLList(ticketType),
      resolve: async function (_, _, key) {
        console.log(key.headers);
        
        const { data } = await (await fetch(url+'/api/ticket',{headers:{"Authorization":"Bearer "+key.headers['authorization'],'Content-Type': 'application/json'}})).json();
        return data;
      }
    },
    productById: {
      type: productType,
      args: {
        id: { type: Graphql.GraphQLString }
      },
      resolve: async function (_, { id },key) {
        const { data } = await (await fetch(url+'/api/product/' + id,{headers:{"Authorization":"Bearer "+key.headers['authorization'],'Content-Type': 'application/json'}})).json();
        return data;
      }
    },
    // /api/product/area/{area}/category/{category}
    productByCategory: {
      type: new Graphql.GraphQLList(productType),
      args: {
        area: { type: Graphql.GraphQLString },
        category: { type: Graphql.GraphQLString }
      },
      resolve: async function (_, args,key) {
        const {area, category} = args
        const { data } = await (await fetch(url+'/api/product/area/' + area + '/category/' + category,{headers:{"Authorization":"Bearer "+key.headers['authorization'],'Content-Type': 'application/json'}})).json();
        return data;
      }
    },
    categoryList: {
      type: new Graphql.GraphQLList(Graphql.GraphQLString),
      resolve: async function (_, _,key) {
        // console.log();
        
        const data = await (await fetch(url+'/api/category/',{method:"get",headers:{"Authorization":"Bearer "+key.headers['authorization'],'Content-Type': 'application/json'}})).json();
        return data;
      }
    },
    areaList: {
      type: new Graphql.GraphQLList(Graphql.GraphQLString),
      resolve: async function (post,args,key) {
        // console.log(key,args,post);
        
        // console.log(key.headers['authorization']);
        // console.log(info);
        const data = await (await fetch(url+'/api/area/',{headers:{"Authorization":"Bearer "+key.headers['authorization'],'Content-Type': 'application/json'}})).json();
        
        // console.log("여기옴 지역리스트")
        // console.log(data);
        
        return data;
      }
    },
    product: {
      type: new Graphql.GraphQLList(productType),
      resolve: async function (post,args,key) {
        // console.log("여기옴 프로덕트");
        // console.log(key);
        
        const { data } = await (await fetch(url+'/api/product',{headers:{"Authorization":"Bearer "+key.headers['authorization'],'Content-Type': 'application/json'}})).json();
        console.log(data)
        return data;
      }
    }
  }
});

const mutation = new Graphql.GraphQLObjectType({
  name: 'Mutation',
  fields: {
    makeTicket: {
      type: ticketType,
      args:{
        amount: { type: Graphql.GraphQLInt },
        totalPrice: { type: Graphql.GraphQLInt },
        productId: { type: Graphql.GraphQLString },
        optionId:{type:Graphql.GraphQLString},
      },
      resolve: async function(parentValue, args, key) {
        console.log(args);
        data = await (await fetch(url+'/api/ticket/',{
          headers:{
            "Content-type": "application/json",
            "Authorization": "Bearer "+key.headers['authorization']
          },
          method:'post',
          body:JSON.stringify(args)
        })).json()
        console.log(data);
        return data
      }
    }
  }
})
var schema = new Graphql.GraphQLSchema({ query: queryType, mutation: mutation});

var app = express();

app.use('/', graphqlHTTP((req)=>{
  return {
      schema: schema,
      graphiql: true,
      rootValue: {},
      key: req.headers,
  };
}));
app.listen(4000);
console.log("Running a GraphQL server");