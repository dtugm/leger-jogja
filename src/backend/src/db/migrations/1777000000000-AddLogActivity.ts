import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLogActivity1777000000000 implements MigrationInterface {
  name = 'AddLogActivity1777000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "public"."log_activities" (
        "id" bigserial NOT NULL,
        "user_id" character varying(36),
        "action" character varying(50) NOT NULL,
        "resource" character varying(100) NOT NULL,
        "resource_id" character varying(255),
        "method" character varying(10) NOT NULL,
        "endpoint" character varying(500) NOT NULL,
        "status_code" integer,
        "ip_address" character varying(45),
        "user_agent" text,
        "payload" jsonb,
        "response_time" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_log_activities" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_log_activities_user_id" ON "public"."log_activities" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_log_activities_resource" ON "public"."log_activities" ("resource")`);
    await queryRunner.query(`CREATE INDEX "IDX_log_activities_action" ON "public"."log_activities" ("action")`);
    await queryRunner.query(`CREATE INDEX "IDX_log_activities_created_at" ON "public"."log_activities" ("created_at")`);

    await queryRunner.query(`
      ALTER TABLE "public"."log_activities"
        ADD CONSTRAINT "FK_log_activities_user_id"
        FOREIGN KEY ("user_id")
        REFERENCES "public"."users"("id")
        ON DELETE SET NULL
        ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."log_activities" DROP CONSTRAINT "FK_log_activities_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_log_activities_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_log_activities_action"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_log_activities_resource"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_log_activities_user_id"`);
    await queryRunner.query(`DROP TABLE "public"."log_activities"`);
  }
}
