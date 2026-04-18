import type {
  Recipe,
  RecipeIngredient,
  RecipeStep,
  BakeSession,
  BakeStep,
  BakeLog,
  StepType,
  SessionStatus,
} from "@prisma/client";

export type { StepType, SessionStatus };

export type RecipeWithRelations = Recipe & {
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  sessions?: BakeSessionWithRelations[];
};

export type BakeSessionWithRelations = BakeSession & {
  recipe: Recipe;
  steps: BakeStep[];
  log: BakeLog | null;
};

export type IngredientFormItem = {
  id: string;
  name: string;
  weightG: number;
  isFlour: boolean;
  sortOrder: number;
};

export type StepFormItem = {
  id: string;
  type: StepType;
  label: string;
  description: string;
  durationMins: number | null;
  tempC: number | null;
  sortOrder: number;
};

export type RecipeFormData = {
  name: string;
  description: string;
  notes: string;
  ingredients: IngredientFormItem[];
  steps: StepFormItem[];
};

export const STEP_TYPE_LABELS: Record<StepType, string> = {
  AUTOLYSE: "Autolyse",
  MIX: "Mix",
  BULK_FERMENT: "Bulk Ferment",
  FOLD: "Fold",
  PRESHAPE: "Preshape",
  BENCH_REST: "Bench Rest",
  SHAPE: "Shape",
  PROOF: "Proof",
  COLD_PROOF: "Cold Proof",
  SCORE: "Score",
  BAKE: "Bake",
  COOL: "Cool",
  CUSTOM: "Custom",
};
