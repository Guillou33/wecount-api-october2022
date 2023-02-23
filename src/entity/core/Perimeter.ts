import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Company, Site, Product, Campaign, EntryTag } from "@root/entity";
import { Exclude } from "class-transformer";
import { UserRoleWithinPerimeter } from "./UserRoleWithinPerimeter";

@Entity()
export class Perimeter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn()
  softDeletedAt: Date;

  @Exclude()
  @ManyToOne(() => Company)
  company: Company;

  @Exclude()
  @OneToMany(() => Site, site => site.perimeter)
  sites: Site[];

  @Exclude()
  @OneToMany(() => Product, product => product.perimeter)
  products: Product[];

  @Exclude()
  @OneToMany(() => EntryTag, entryTag => entryTag.perimeter)
  entryTags: EntryTag[];

  @Exclude()
  @OneToMany(() => Campaign, campaign => campaign.perimeter)
  campaigns: Campaign[];

  @Exclude()
  @OneToMany(() => UserRoleWithinPerimeter, urwp => urwp.perimeter)
  userRoleWithinPerimeters: UserRoleWithinPerimeter[];
}
