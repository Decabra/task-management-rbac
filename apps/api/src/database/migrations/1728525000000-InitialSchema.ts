import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1728525000000 implements MigrationInterface {
  name = 'InitialSchema1728525000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "name" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email")
    `);

    // Create organizations table
    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "parent_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_organizations" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_organizations_parent_id" ON "organizations" ("parent_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "organizations"
      ADD CONSTRAINT "FK_organizations_parent"
      FOREIGN KEY ("parent_id")
      REFERENCES "organizations"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);

    // Create permissions table
    await queryRunner.query(`
      CREATE TYPE "permissions_role_enum" AS ENUM ('OWNER', 'ADMIN', 'VIEWER')
    `);

    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "org_id" uuid NOT NULL,
        "role" "permissions_role_enum" NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_permissions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_permissions_user_org" UNIQUE ("user_id", "org_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_permissions_user_id" ON "permissions" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_permissions_org_id" ON "permissions" ("org_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "permissions"
      ADD CONSTRAINT "FK_permissions_user"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "permissions"
      ADD CONSTRAINT "FK_permissions_organization"
      FOREIGN KEY ("org_id")
      REFERENCES "organizations"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    // Create tasks table
    await queryRunner.query(`
      CREATE TYPE "tasks_status_enum" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE')
    `);

    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "org_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "category" character varying NOT NULL,
        "status" "tasks_status_enum" NOT NULL DEFAULT 'TODO',
        "order_index" integer NOT NULL DEFAULT 0,
        "owner_user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tasks" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tasks_org_id" ON "tasks" ("org_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tasks_category" ON "tasks" ("category")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tasks_status" ON "tasks" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tasks_order_index" ON "tasks" ("order_index")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tasks_owner_user_id" ON "tasks" ("owner_user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tasks_created_at" ON "tasks" ("created_at")
    `);

    await queryRunner.query(`
      ALTER TABLE "tasks"
      ADD CONSTRAINT "FK_tasks_organization"
      FOREIGN KEY ("org_id")
      REFERENCES "organizations"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "tasks"
      ADD CONSTRAINT "FK_tasks_owner"
      FOREIGN KEY ("owner_user_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    // Create audit_logs table
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "org_id" uuid NOT NULL,
        "action" character varying NOT NULL,
        "entity" character varying NOT NULL,
        "entity_id" uuid NOT NULL,
        "meta" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_user_id" ON "audit_logs" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_org_id" ON "audit_logs" ("org_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE "tasks_status_enum"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TYPE "permissions_role_enum"`);
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}