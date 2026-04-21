import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1744516200001 implements MigrationInterface {
  name = 'CreateUsersTable1744516200001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."role_enum" AS ENUM ('super_admin', 'admin', 'user')
    `);

    await queryRunner.query(`
      CREATE TABLE "public"."users" (
        "id" varchar(36) PRIMARY KEY,
        "email" varchar NOT NULL,
        "username" varchar NOT NULL,
        "fullname" varchar NOT NULL,
        "role" "role_enum" NOT NULL DEFAULT 'user',
        "password" varchar NOT NULL,
        "created_at" timestamp without time zone NOT NULL DEFAULT now(),
        "updated_at" timestamp without time zone NOT NULL DEFAULT now(),
        "deleted_at" timestamp without time zone,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_role" ON "public"."users" ("role")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_users_role"`);
    await queryRunner.query(`DROP TYPE "public"."role_enum"`);
    await queryRunner.query(`DROP TABLE "public"."users"`);
  }
}
