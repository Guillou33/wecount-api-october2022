import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  RelationId,
} from "typeorm";
import { Exclude, Expose } from "class-transformer";

import { Campaign, Content } from "@entity/index";

@Exclude()
@Entity()
export class Indicator {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Campaign)
  campaign: Campaign;

  @Expose()
  @RelationId((indicator: Indicator) => indicator.campaign)
  campaignId: number;

  @Expose()
  @CreateDateColumn()
  createdAt: Date;

  @Expose()
  @DeleteDateColumn()
  softDeletedAt: Date;

  @Expose()
  @Column({ type: "text" })
  name: string;

  @Expose()
  @Column({ type: "text", nullable: true })
  unit: string | null;

  @Expose()
  @Column({ type: "float", nullable: true })
  quantity: number | null;
}
