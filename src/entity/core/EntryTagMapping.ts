import { Entity, PrimaryGeneratedColumn, ManyToOne, RelationId } from "typeorm";
import { EntryTag, ActivityEntry } from "@entity/index";

@Entity()
export class EntryTagMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ActivityEntry)
  activityEntry: ActivityEntry;

  @ManyToOne(() => EntryTag)
  entryTag: EntryTag;

  @RelationId("entryTag")
  entryTagId: number;
}
