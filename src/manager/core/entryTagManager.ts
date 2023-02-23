import { In } from "typeorm";
import {
  EntryTag,
  Perimeter,
  ActivityEntry,
  EntryTagMapping,
} from "@entity/index";
import AbstractManagerWithRepository from "@manager/AbstractManagerWithRepository";
import { EntryTagRepository } from "@root/repository/index";

class EntryTagManager extends AbstractManagerWithRepository<
  EntryTag,
  EntryTagRepository
> {
  protected entityClass = EntryTag;
  protected repositoryClass = EntryTagRepository;

  async createNew(
    entryTagInfo: { name: string; perimeter: Perimeter },
    flush: boolean = false
  ): Promise<EntryTag> {
    const entryTag = this.instance();
    entryTag.perimeter = entryTagInfo.perimeter;
    entryTag.name = entryTagInfo.name;

    if (flush) {
      await this.em.save(entryTag);
    }

    return entryTag;
  }

  async update(
    entryTag: EntryTag,
    entryTagInfo: { name: string },
    flush: boolean = false
  ): Promise<EntryTag> {
    this.em.merge(EntryTag, entryTag, {
      ...entryTagInfo,
    });

    if (flush) {
      await this.em.save(entryTag);
    }

    return entryTag;
  }

  async archive(entryTag: EntryTag, flush: boolean = false): Promise<EntryTag> {
    this.em.merge(EntryTag, entryTag, {
      archivedDate: new Date(),
    });

    if (flush) {
      await this.em.save(entryTag);
    }

    return entryTag;
  }

  async unarchive(
    entryTag: EntryTag,
    flush: boolean = false
  ): Promise<EntryTag> {
    this.em.merge(EntryTag, entryTag, {
      archivedDate: null,
    });

    if (flush) {
      await this.em.save(entryTag);
    }

    return entryTag;
  }

  async clearTagsOfActivityEntry(activityEntry: ActivityEntry): Promise<void> {
    const qb = this.em
      .createQueryBuilder()
      .delete()
      .from(EntryTagMapping)
      .where("activity_entry_id = :activityEntryId", {
        activityEntryId: activityEntry.id,
      });
    await qb.execute();
  }

  async assignTagsToActivityEntry(
    activityEntry: ActivityEntry,
    entryTagIds: number[]
  ): Promise<EntryTagMapping[]> {
    await this.clearTagsOfActivityEntry(activityEntry);

    const entryTags = await this.getRepository().find({
      where: {
        id: In(entryTagIds),
      },
    });

    const entryTagMappings = entryTags.map(entryTag =>
      this.em.create(EntryTagMapping, {
        entryTag,
        activityEntry,
      })
    );
    return this.em.save(entryTagMappings);
  }
}

export default new EntryTagManager();
