import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPmtiles1778059826000 implements MigrationInterface {
  name = 'AddPmtiles1778059826000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "public"."pmtiles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" text,
                "epoch" integer NOT NULL,
                "project_usages" character varying NOT NULL,
                "filename" character varying NOT NULL,
                "url" character varying,
                "file_size" integer,
                "bucket_name" character varying NOT NULL,
                "updated_by" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_pmtiles_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "public"."pmtiles"
            ADD CONSTRAINT "FK_pmtiles_updated_by"
            FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id")
        `);
    await queryRunner.query(
      `CREATE INDEX "IDX_pmtiles_updated_by" ON "public"."pmtiles" ("updated_by")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."pmtiles" DROP CONSTRAINT "FK_pmtiles_updated_by"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_pmtiles_updated_by"`);
    await queryRunner.query(`DROP TABLE "public"."pmtiles"`);
  }
}
