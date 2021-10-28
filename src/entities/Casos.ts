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
export class Casos extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Int)
  @Column()
  NumCasos!: number;

  @Field(() => Int)
  @Column()
  NumMortes!: number;

  @Field(() => Int)
  @Column()
  IndiceSP!: number;

  @Field(() => Int)
  @Column()
  IndiceCapital!: number;

  @Field(() => Int)
  @Column()
  PrimeiraDose!: number;

  @Field(() => Int)
  @Column()
  SegundaDose!: number;

  // @Field()
  // @Column({ type: "int", default: 0 })
  // totalRecuperados!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
