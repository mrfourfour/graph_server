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
        console.log(qrData);
        console.log(id);
        
        let res = await (await fetch('http://ticket.ap-northeast-2.elasticbeanstalk.com/api/ticket/'+id)).json();
        // const data = Object.keys(res).filter(element => {
        //   console.log(qrData);
          
        //   // console.log(res)
        //   if (res[element].qrData == qrData) {
            
        //     return element;
        //   }
        // });
        return res.data;
      }
    },
    allTicket:{
      type: new Graphql.GraphQLList(ticketType),
      resolve: async function(_,_,_,_) {
        const res = await (await fetch('http://ticket.ap-northeast-2.elasticbeanstalk.com/api/ticket')).json();
        // console.log(res)
        return  res.data;
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