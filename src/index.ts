import "reflect-metadata";
import {
  ApolloServer,
  toApolloError,
  UserInputError,
} from "apollo-server-express";
import express from "express";
import { buildSchema, Mutation } from "type-graphql";
import connectRedis from "connect-redis";
import Redis from "ioredis";
import session from "express-session";
import cors from "cors";
import { COOKIE_NAME } from "./constantes";
import { createConnection } from "typeorm";
import path from "path";
import { Casos } from "./entities/Casos";
import { UserResolver } from "./resolvers/user";
import { User } from "./entities/User";
import { Card, WebhookClient } from "dialogflow-fulfillment";
import { getConnection } from "typeorm";
import bodyParser from "body-parser";
import { Agent } from "node:http";
import { RegisterUser, usuarios } from "./resolvers/chatbotRes";
import { CamisetasResolver } from "./resolvers/camisetas";
import { Camisetas } from "./entities/Camisetas";

const main = async () => {
  
  const conn = await createConnection({
    type: "postgres",
    database: "ChatBot",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Camisetas],
  });
  const _path = "/";

  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, CamisetasResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  function HELLO(agent: WebhookClient): any {
    agent.add("Oi! Boa tarde!");
  }

  function fallback(agent: WebhookClient) {
    agent.add(`Eu não entendi`);
    agent.add(`Me desulpe, pode tentar de nov? 😊`);
  }

  async function Demo(agent: WebhookClient) {
    await agent.add(
      new Card({
        title: `Title: this is a card title`,
        text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
        buttonText: "This is a button",
        buttonUrl: "https://assistant.google.com/",
      })
    );
  }

  async function WebhookProcessing(req: any, res: any) {
    try {
      const agent = new WebhookClient({ request: req, response: res });
      console.info(`Agente setado!`);

      console.log(JSON.stringify(req.headers));
      console.log("Resultado: " + JSON.stringify(req.body.queryResult));
      console.log("Resultado: " + req.body.responseId);

      let intentMap = new Map();
      intentMap.set("Oi", HELLO);
      intentMap.set("Users", usuarios);
      intentMap.set("testdemo", Demo);
      intentMap.set("RegisterUser", RegisterUser);
      intentMap.set("Default Fallback Intent", fallback);
      // intentMap.set('<INTENT_NAME_HERE>', yourFunctionHandler);
      return agent.handleRequest(intentMap);
    } catch (error) {
      console.log(error);
    }
  }

  app.post("https://chatbot-loja.herokuapp.com/", express.json(), function (req, res) {
    console.info(`\n\n>>>>>>> S E R V E R   A T I N G I D O <<<<<<<`);
    WebhookProcessing(req, res);
  });

  apolloServer.applyMiddleware({ app, cors: false, path: "/graphql" });

  app.listen(4000, () => {
    console.log("O server começou na porta 4000.");
  });
};

main().catch((err) => {
  console.error(err);
});
