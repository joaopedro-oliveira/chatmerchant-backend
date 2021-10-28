import { ObjectType, Field, Int } from "type-graphql";
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType()
@Entity()
export class Camisetas extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ type: "text" })
  Marca!: String;

  @Field()
  @Column({ type: "text" })
  Descricao!: String;

  @Field()
  @Column({ type: "text" })
  Tamanho!: String;

  @Field(() => Int)
  @Column()
  precoComDesconto?: number;

  @Field(() => Int)
  @Column()
  preco!: number;

  @Field(() => Int)
  @Column()
  Estoque!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
