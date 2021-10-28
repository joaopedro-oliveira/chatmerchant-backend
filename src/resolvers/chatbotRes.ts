import { Card, WebhookClient } from "dialogflow-fulfillment";
import { User } from "../entities/User";
import { getConnection } from "typeorm";
import { BrowseCarousel, BrowseCarouselItem } from "actions-on-google";

export const RegisterUser = async (
  agent: WebhookClient
): Promise<any | undefined> => {
  const { username, cpf, email } = agent.parameters;
  try {
    let user;

    const result = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({
        username: username,
        cpf: cpf,
        email: email,
      })
      .returning("*")
      .execute();

    user = result.raw[0];
    return agent.add(JSON.stringify(user));
  } catch (err) {
    if (err.detail.includes("already exists")) {
      return agent.add("Esse username já existe!");
    }
  }
};

export const usuarios = async (
  agent: WebhookClient
): Promise<any | undefined> => {
  const result = await User.find();

  agent.add(JSON.stringify(result));
};
