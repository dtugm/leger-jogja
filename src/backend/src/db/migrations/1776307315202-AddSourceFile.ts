import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSourceFile1776307315202 implements MigrationInterface {
    name = 'AddSourceFile1776307315202'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "public"."source_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "uploaded_by" character varying(36), "asset_id" uuid, CONSTRAINT "PK_915b191f0c89cdb6995a88549af" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_915b191f0c89cdb6995a88549a" ON "public"."source_files" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e59edddc4b772f25836b339b76" ON "public"."source_files" ("uploaded_by") `);
        await queryRunner.query(`ALTER TABLE "public"."source_files" ADD CONSTRAINT "FK_e59edddc4b772f25836b339b764" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."source_files" ADD CONSTRAINT "FK_ffd70a5740011d090a8cf8d792f" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."source_files" DROP CONSTRAINT "FK_ffd70a5740011d090a8cf8d792f"`);
        await queryRunner.query(`ALTER TABLE "public"."source_files" DROP CONSTRAINT "FK_e59edddc4b772f25836b339b764"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e59edddc4b772f25836b339b76"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_915b191f0c89cdb6995a88549a"`);
        await queryRunner.query(`DROP TABLE "public"."source_files"`);
    }

}
