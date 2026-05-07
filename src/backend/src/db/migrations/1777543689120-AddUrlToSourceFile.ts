import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUrlToSourceFile1777543689120 implements MigrationInterface {
    name = 'AddUrlToSourceFile1777543689120'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."source_files" ADD "url" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."source_files" DROP COLUMN "url"`);
    }

}
