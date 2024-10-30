
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."customer_status" AS ENUM (
    'new-lead',
    'qualified-lead',
    'disqualified-lead',
    'nurture',
    'open',
    'proposal-sent',
    'negotiation',
    'contract-sent',
    'contract-signed',
    'closed-won',
    'closed-lost',
    'on-hold',
    'renewal',
    'upsell-cross-sell-opportunity',
    'pending',
    'follow-up',
    'research',
    'meeting-scheduled'
);

ALTER TYPE "public"."customer_status" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."account" (
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "provider" "text" NOT NULL,
    "providerAccountId" "text" NOT NULL,
    "refresh_token" "text",
    "access_token" "text",
    "expires_at" integer,
    "token_type" "text",
    "scope" "text",
    "id_token" "text",
    "session_state" "text"
);

ALTER TABLE "public"."account" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."customer" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp without time zone NOT NULL,
    "modified_at" timestamp without time zone NOT NULL,
    "sale_score" integer NOT NULL,
    "savings_rating" integer NOT NULL,
    "status" "public"."customer_status" DEFAULT 'new-lead'::"public"."customer_status" NOT NULL,
    "primary_email" "text" NOT NULL,
    "emails" "jsonb" NOT NULL,
    "primary_phone" "text" NOT NULL,
    "phones" "jsonb" NOT NULL,
    "address" "jsonb" NOT NULL
);

ALTER TABLE "public"."customer" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "email" "text",
    "emailVerified" timestamp without time zone,
    "image" "text"
);

ALTER TABLE "public"."user" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."verificationToken" (
    "identifier" "text" NOT NULL,
    "token" "text" NOT NULL,
    "expires" timestamp without time zone NOT NULL
);

ALTER TABLE "public"."verificationToken" OWNER TO "postgres";

ALTER TABLE ONLY "public"."account"
    ADD CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY ("provider", "providerAccountId");

ALTER TABLE ONLY "public"."customer"
    ADD CONSTRAINT "customer_id_pk" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."verificationToken"
    ADD CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY ("identifier", "token");

CREATE UNIQUE INDEX "unique_address_person" ON "public"."customer" USING "btree" ("address", "user");

CREATE UNIQUE INDEX "user_email_key" ON "public"."user" USING "btree" ("email");

ALTER TABLE ONLY "public"."account"
    ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."customer"
    ADD CONSTRAINT "customer_user_user_id_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("id") ON DELETE CASCADE;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON TABLE "public"."account" TO "anon";
GRANT ALL ON TABLE "public"."account" TO "authenticated";
GRANT ALL ON TABLE "public"."account" TO "service_role";

GRANT ALL ON TABLE "public"."customer" TO "anon";
GRANT ALL ON TABLE "public"."customer" TO "authenticated";
GRANT ALL ON TABLE "public"."customer" TO "service_role";

GRANT ALL ON TABLE "public"."user" TO "anon";
GRANT ALL ON TABLE "public"."user" TO "authenticated";
GRANT ALL ON TABLE "public"."user" TO "service_role";

GRANT ALL ON TABLE "public"."verificationToken" TO "anon";
GRANT ALL ON TABLE "public"."verificationToken" TO "authenticated";
GRANT ALL ON TABLE "public"."verificationToken" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
