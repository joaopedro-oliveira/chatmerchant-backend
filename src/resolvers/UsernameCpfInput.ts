import { InputType, Field } from "type-graphql";

@InputType()
export class UsernameCpfInput {
  @Field()
  email: string;
  @Field()
  username: string;
  @Field()
  cpf: string;
}
