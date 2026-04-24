import { MigrationInterface, QueryRunner } from "typeorm";

export class Add3dTiles1776917952487 implements MigrationInterface {
    name = 'Add3dTiles1776917952487'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."password_reset_tokens" DROP CONSTRAINT "FK_password_reset_tokens_user_id"`);
        await queryRunner.query(`ALTER TABLE "public"."menus" DROP CONSTRAINT "FK_menus_parent_id"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_menus_href"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_menus_root_index"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_menus_parent_index"`);
        await queryRunner.query(`CREATE TABLE "public"."tiles_3d" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "properties" jsonb, "url" character varying NOT NULL, "geometry" geography(Polygon,4326), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8c52daa8d7d6d7d8b5a11739983" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a8410f7cceb94cd6ca5b40091d" ON "public"."tiles_3d" USING GiST ("geometry") `);
        await queryRunner.query(`ALTER TABLE "public"."password_reset_tokens" ADD CONSTRAINT "FK_52ac39dd8a28730c63aeb428c9c" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."password_reset_tokens" DROP CONSTRAINT "FK_52ac39dd8a28730c63aeb428c9c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a8410f7cceb94cd6ca5b40091d"`);
        await queryRunner.query(`DROP TABLE "public"."tiles_3d"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_menus_parent_index" ON "public"."menus" ("index", "parent_id") WHERE (parent_id IS NOT NULL)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_menus_root_index" ON "public"."menus" ("index") WHERE (parent_id IS NULL)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_menus_href" ON "public"."menus" ("href") `);
        await queryRunner.query(`ALTER TABLE "public"."menus" ADD CONSTRAINT "FK_menus_parent_id" FOREIGN KEY ("parent_id") REFERENCES "public"."menus"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."password_reset_tokens" ADD CONSTRAINT "FK_password_reset_tokens_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY IMMEDIATE`);
    }

}
