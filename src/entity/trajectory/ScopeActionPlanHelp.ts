import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SCOPE } from "@entity/enum/Scope";
import { Exclude, Expose } from "class-transformer";
import { Content } from "..";

@Exclude()
@Entity()
export class ScopeActionPlanHelp {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({ type: "enum", enum: SCOPE })
  scope: SCOPE;

  // Translated help, to inject with Repo
  helpTranslated: Content | null;
  @Column({type: "varchar", nullable: true})
  helpContentCode: string | null;
  @Expose({ name: "help" })
  getNameTranslated(): string | null {
    return this.helpTranslated?.text ?? this.helpContentCode;
  }
}
