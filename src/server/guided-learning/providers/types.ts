export type VerifiedLearningProvider = "google" | "microsoft" | "aws";
export type VerifiedResourceKind = "COURSE" | "MODULE" | "LEARNING_PATH" | "LEARNING_TOOL" | "CATALOG";

export interface VerifiedLearningResource {
  id: string;
  provider: VerifiedLearningProvider;
  title: string;
  description: string;
  url: string;
  kind: VerifiedResourceKind;
  topics: string[];
  levels: Array<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">;
  locales: string[];
  freeAccess: boolean;
  verification: {
    source: "official-provider";
    verifiedAt: string;
  };
}
