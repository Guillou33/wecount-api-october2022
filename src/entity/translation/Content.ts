import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  Unique,
  Index,
} from "typeorm";

import { Exclude, Expose } from "class-transformer";
import { LOCALE } from "../enum/Locale";

@Exclude()
@Entity()
@Unique("UniqueCodeLocale", ["code", "locale"])
export class Content {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  
  @Index()
  @Column()
  code: string;

  @Column({ type: "enum", enum: LOCALE })
  locale: LOCALE;

  @Expose()
  @Column({ type: "text" })
  text: string;

  @Column({ type: "boolean", default: false })
  translationMissing: boolean;
}
