CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"birthdate" date NOT NULL,
	"height_cm" integer NOT NULL,
	"gender" text,
	"build" text,
	"location" text NOT NULL,
	"employment" text,
	"interests" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"personality" jsonb NOT NULL,
	"motivations" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
