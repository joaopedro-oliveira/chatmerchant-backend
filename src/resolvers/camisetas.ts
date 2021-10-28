import {
  Resolver,
  Query,
  Mutation,
  Arg,
  InputType,
  Field,
  Int,
  // ObjectType,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Camisetas } from "../entities/Camisetas";

@InputType()
class CamisetaInput {
  @Field()
  Marca!: string;
  @Field()
  Descricao!: string;
  @Field()
  Tamanho!: string;
  @Field()
  precoComDesconto?: number;
  @Field()
  preco!: number;
  @Field()
  Estoque!: number;
}

@Resolver(Camisetas)
export class CamisetasResolver {
  @Query(() => String)
  hello() {
    return "Eae";
  }

  @Query(() => Camisetas, { nullable: true })
  async camisa(
    @Arg("id", () => Int) id: number
  ): Promise<Camisetas | undefined> {
    return Camisetas.findOne({ id });
  }

  @Query(() => [Camisetas])
  async camisas(): Promise<Camisetas[] | undefined> {
    return await Camisetas.find();
  }

  @Mutation(() => Camisetas)
  //   @UseMiddleware(isAuth)
  async inserirDados(@Arg("input") input: CamisetaInput): Promise<Camisetas> {
    return Camisetas.create({ ...input }).save();
  }

  @Mutation(() => Camisetas, { nullable: true })
  // @UseMiddleware(isAuth)
  async updateCamisa(
    @Arg("id", () => Int) id: number,
    @Arg("descricao") Descricao?: string,
    @Arg("estoque") Estoque?: number
    // @Ctx() { req }: MyContext
  ): Promise<Camisetas | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Camisetas)
      .set({ Descricao, Estoque })
      .where("id = :id ", {
        id,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  // @UseMiddleware(isAuth)
  async deleteCamisa(
    @Arg("id", () => Int) id: number
    // @Ctx() { req }: MyContext
  ): Promise<boolean> {
    // Not cascade way
    // const post = await Post.findOne(id);
    // if (!post) {
    //   return false;
    // }
    // if (post.creatorId !== req.session.userId) {
    //   throw new Error("Not authorized");
    // }
    // await Updoot.delete({ postId: id });
    await Camisetas.delete({ id });
    return true;
  }
}
