import { MyContext } from "src/tipos";
import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  Query,
  FieldResolver,
  Root,
  InputType,
} from "type-graphql";
import argon2 from "argon2";
import { User } from "../entities/User";
import { UsernameCpfInput } from "./UsernameCpfInput";
import { validateRegister } from "../utils/validadeRegister";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    //Is user
    if (req.session.userId === user.id) {
      return user.email;
    }
    // Is not user
    return "";
  }

  @Mutation(() => UserResponse)
  async changecpf(
    @Arg("token") token: string,
    @Arg("newcpf") newcpf: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newcpf.length <= 3) {
      return {
        errors: [
          {
            field: "newcpf",
            message: "cpf must be bigger than 3 characters",
          },
        ],
      };
    }
    const key = "forget-cpf:" + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "Token expired.",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "User no longer exists.",
          },
        ],
      };
    }

    await User.update(
      { id: userIdNum },
      {
        cpf: await argon2.hash(newcpf),
      }
    );

    //login in user after new cpf
    await redis.del(key);
    req.session.userId = user.id;
    return { user };
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernameCpfInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const hashedcpf = await argon2.hash(options.cpf);
    let user;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          cpf: hashedcpf,
          email: options.email,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
    } catch (err) {
      if (err.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "username",
              message: "That username already exists",
            },
          ],
        };
      }
    }

    //user cookie. logged in.
    req.session!.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("cpf") cpf: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );

    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "that username doesn't exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.cpf, cpf);
    if (!valid) {
      return {
        errors: [
          {
            field: "cpf",
            message: "Incorrect cpf",
          },
        ],
      };
    }

    req.session!.userId = user.id; // they removed or altered userId in session. MOdification made at types to make this work.
    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie("qid");
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }
}
