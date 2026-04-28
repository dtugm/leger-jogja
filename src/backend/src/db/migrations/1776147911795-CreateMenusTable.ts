import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMenusTable1776147911795 implements MigrationInterface {
  name = 'CreateMenusTable1776147911795';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "public"."menus" (
          "id" uuid PRIMARY KEY,
          "parent_id" uuid,
          "name" varchar NOT NULL,
          "icon" varchar,
          "href" varchar NOT NULL,
          "index" int NOT NULL,
          "roles" varchar[] NOT NULL,
          "created_at" timestamp without time zone NOT NULL DEFAULT now(),
          "updated_at" timestamp without time zone NOT NULL DEFAULT now()
         )
     `);

    await queryRunner.query(`
      ALTER TABLE "public"."menus"
      ADD CONSTRAINT "FK_menus_parent_id"
      FOREIGN KEY ("parent_id")
      REFERENCES "public"."menus" ("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_menus_href"
      ON "public"."menus" ("href")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_menus_root_index"
      ON "public"."menus" ("index")
      WHERE "parent_id" IS NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_menus_parent_index"
      ON "public"."menus" ("parent_id", "index")
      WHERE "parent_id" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "public"."menus"
      DROP CONSTRAINT "FK_menus_parent_id"
    `);
    await queryRunner.query(`DROP INDEX "UQ_menus_href"`);
    await queryRunner.query(`DROP INDEX "UQ_menus_root_index"`);
    await queryRunner.query(`DROP INDEX "UQ_menus_parent_index"`);
    await queryRunner.query(`DROP TABLE "public"."menus" `);
  }
}
