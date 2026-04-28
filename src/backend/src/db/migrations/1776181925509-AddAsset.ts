import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAsset1776181925509 implements MigrationInterface {
    name = 'AddAsset1776181925509'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_users_role"`);
        await queryRunner.query(`CREATE TABLE "public"."assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "location" geometry(Point,4326), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_da96729a8b113377cfb6a62439c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_da96729a8b113377cfb6a62439" ON "public"."assets" ("id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_da96729a8b113377cfb6a62439"`);
        await queryRunner.query(`DROP TABLE "public"."assets"`);
        await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "public"."users" ("role") `);
    }

}
