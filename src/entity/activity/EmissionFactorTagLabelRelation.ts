import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { EmissionFactorTagLabel } from "@entity/index";
import { Exclude, Expose } from "class-transformer";

@Exclude()
@Entity()
export class EmissionFactorTagLabelRelation {
  @ManyToOne(() => EmissionFactorTagLabel, undefined, { nullable: false })
  parentTag: EmissionFactorTagLabel;

  @Expose()
  @ManyToOne(() => EmissionFactorTagLabel, undefined, { nullable: false })
  childTag: EmissionFactorTagLabel;

  @PrimaryGeneratedColumn()
  id: number;
}
