export type WorkoutKey = "terca" | "quarta" | "quinta" | "sexta";
export type FitnessTab = WorkoutKey | "nutricao" | "conquistas";

export interface FitnessExercise {
  slotKey: string;
  name: string;
  sets: number;
  reps: string;
  videoQuery: string;
  category: string;
  isCustom?: boolean;
  sortOrder: number;
}

export interface WorkoutDefinition {
  key: WorkoutKey;
  shortLabel: string;
  title: string;
  focus: string;
  calories: number;
  exercises: FitnessExercise[];
}

export const EXERCISE_LIBRARY: Record<string, Omit<FitnessExercise, "slotKey" | "sortOrder">[]> = {
  peito: [
    { name: "Svend Press em pé", sets: 4, reps: "10 a 12 repetições", videoQuery: "svend press com anilha halter", category: "peito" },
    { name: "Flexão de braço (parede ou joelho)", sets: 3, reps: "Até a falha", videoQuery: "flexão de braço para iniciantes", category: "peito" },
    { name: "Supino reto com halteres no chão", sets: 4, reps: "10 a 12 repetições", videoQuery: "floor press com halteres", category: "peito" },
  ],
  ombro: [
    { name: "Desenvolvimento em pé", sets: 4, reps: "10 repetições", videoQuery: "desenvolvimento com halter em pé", category: "ombro" },
    { name: "Elevação lateral", sets: 3, reps: "12 a 15 repetições", videoQuery: "elevação lateral halteres", category: "ombro" },
    { name: "Elevação frontal", sets: 3, reps: "12 repetições", videoQuery: "elevação frontal com halteres", category: "ombro" },
    { name: "Crucifixo invertido com halteres", sets: 3, reps: "12 repetições", videoQuery: "crucifixo invertido com halteres", category: "ombro" },
  ],
  triceps: [
    { name: "Tríceps francês em pé", sets: 3, reps: "12 repetições", videoQuery: "tríceps francês com halter", category: "triceps" },
    { name: "Tríceps coice com halter", sets: 3, reps: "12 a 15 repetições", videoQuery: "tríceps coice com halter", category: "triceps" },
    { name: "Mergulho no banco ou cadeira", sets: 3, reps: "Até a falha", videoQuery: "tríceps mergulho cadeira", category: "triceps" },
  ],
  pernas: [
    { name: "Agachamento livre com halteres", sets: 4, reps: "12 repetições", videoQuery: "agachamento goblet", category: "pernas" },
    { name: "Agachamento búlgaro", sets: 3, reps: "10 por perna", videoQuery: "agachamento búlgaro", category: "pernas" },
    { name: "Stiff com halter ou barra", sets: 4, reps: "10 repetições", videoQuery: "stiff com halter", category: "pernas" },
    { name: "Good morning com barra", sets: 3, reps: "12 repetições", videoQuery: "good morning exercício", category: "pernas" },
    { name: "Avanço ou passada", sets: 3, reps: "10 passos", videoQuery: "passada com halter", category: "pernas" },
    { name: "Afundo no lugar", sets: 3, reps: "10 por perna", videoQuery: "afundo com halter", category: "pernas" },
    { name: "Elevação pélvica", sets: 4, reps: "12 repetições", videoQuery: "elevação pélvica", category: "pernas" },
    { name: "Gêmeos em pé com halteres", sets: 4, reps: "15 a 20 repetições", videoQuery: "panturrilha em pé com halteres", category: "pernas" },
  ],
  costas: [
    { name: "Remada curvada", sets: 4, reps: "10 repetições", videoQuery: "remada curvada com barra", category: "costas" },
    { name: "Remada unilateral (serrote)", sets: 3, reps: "12 repetições", videoQuery: "remada unilateral serrote", category: "costas" },
    { name: "Remada alta", sets: 3, reps: "12 repetições", videoQuery: "remada alta com barra", category: "costas" },
  ],
  biceps: [
    { name: "Rosca direta com barra ou halteres", sets: 4, reps: "12 repetições", videoQuery: "rosca direta com barra", category: "biceps" },
    { name: "Rosca martelo com halteres", sets: 3, reps: "12 repetições", videoQuery: "rosca martelo com halteres", category: "biceps" },
    { name: "Rosca concentrada", sets: 3, reps: "10 repetições", videoQuery: "rosca concentrada", category: "biceps" },
  ],
  core_full: [
    { name: "Lenhador (woodchopper) em pé", sets: 3, reps: "15 por lado", videoQuery: "woodchopper com halter", category: "core_full" },
    { name: "Abdominal clássico no chão", sets: 4, reps: "15 repetições", videoQuery: "abdominal supra", category: "core_full" },
    { name: "Levantamento terra", sets: 4, reps: "8 repetições", videoQuery: "levantamento terra barra", category: "core_full" },
    { name: "Thrusters", sets: 3, reps: "10 repetições", videoQuery: "thruster com halter", category: "core_full" },
    { name: "Caminhada do fazendeiro", sets: 3, reps: "45 segundos", videoQuery: "farmers walk halteres", category: "core_full" },
    { name: "Swing com halter", sets: 3, reps: "15 repetições", videoQuery: "kettlebell swing com halter", category: "core_full" },
    { name: "Clean and press", sets: 3, reps: "10 repetições", videoQuery: "clean and press com halteres", category: "core_full" },
  ],
};

const exercise = (
  slotKey: string,
  name: string,
  sets: number,
  reps: string,
  videoQuery: string,
  category: string,
  sortOrder: number,
): FitnessExercise => ({ slotKey, name, sets, reps, videoQuery, category, sortOrder });

export const WORKOUTS: WorkoutDefinition[] = [
  {
    key: "terca", shortLabel: "Terça", title: "Treino de terça", focus: "Peito, ombro, tríceps e costas", calories: 300,
    exercises: [
      exercise("t1", "Svend Press em pé com anilha ou halter", 4, "10 a 12 repetições", "svend press com anilha halter", "peito", 1),
      exercise("t2", "Desenvolvimento de ombros em pé", 4, "10 repetições", "desenvolvimento com halter em pé", "ombro", 2),
      exercise("t3", "Elevação lateral", 3, "12 a 15 repetições", "elevação lateral halteres", "ombro", 3),
      exercise("t4", "Tríceps francês em pé com halter", 3, "12 repetições", "tríceps francês com halter", "triceps", 4),
      exercise("t5", "Tríceps coice com halter", 3, "12 a 15 repetições", "tríceps coice com halter", "triceps", 5),
      exercise("t6", "Crucifixo invertido com halteres", 3, "12 repetições", "crucifixo invertido com halteres", "ombro", 6),
    ],
  },
  {
    key: "quarta", shortLabel: "Quarta", title: "Treino de quarta", focus: "Pernas e glúteos", calories: 400,
    exercises: [
      exercise("q1", "Agachamento livre com halteres (goblet)", 4, "12 repetições", "agachamento goblet", "pernas", 1),
      exercise("q2", "Agachamento búlgaro com taça", 3, "10 por perna", "agachamento búlgaro", "pernas", 2),
      exercise("q3", "Stiff com halter ou barra", 4, "10 repetições", "stiff com halter", "pernas", 3),
      exercise("q4", "Gêmeos em pé com halteres", 4, "15 a 20 repetições", "panturrilha em pé com halteres", "pernas", 4),
      exercise("q5", "Good morning com barra", 3, "12 repetições", "good morning exercício", "pernas", 5),
    ],
  },
  {
    key: "quinta", shortLabel: "Quinta", title: "Treino de quinta", focus: "Costas e bíceps", calories: 300,
    exercises: [
      exercise("qui1", "Remada curvada", 4, "10 repetições", "remada curvada com barra", "costas", 1),
      exercise("qui2", "Remada unilateral (serrote)", 3, "12 repetições", "remada unilateral serrote", "costas", 2),
      exercise("qui3", "Crucifixo invertido com halteres", 3, "12 repetições", "crucifixo invertido com halteres", "ombro", 3),
      exercise("qui4", "Rosca direta com barra ou halteres", 4, "12 repetições", "rosca direta com barra", "biceps", 4),
      exercise("qui5", "Rosca martelo com halteres", 3, "12 repetições", "rosca martelo com halteres", "biceps", 5),
      exercise("qui6", "Lenhador (woodchopper) em pé", 3, "15 por lado", "woodchopper com halter", "core_full", 6),
    ],
  },
  {
    key: "sexta", shortLabel: "Sexta", title: "Treino de sexta", focus: "Full body e condicionamento", calories: 450,
    exercises: [
      exercise("s1", "Levantamento terra", 4, "8 repetições", "levantamento terra barra", "core_full", 1),
      exercise("s2", "Thrusters", 3, "10 repetições", "thruster com halter", "core_full", 2),
      exercise("s3", "Caminhada do fazendeiro", 3, "45 segundos", "farmers walk halteres", "core_full", 3),
      exercise("s4", "Swing com halter", 3, "15 repetições", "kettlebell swing com halter", "core_full", 4),
      exercise("s5", "Clean and press com halteres", 3, "10 repetições", "clean and press com halteres", "core_full", 5),
    ],
  },
];

export const WORKOUT_BY_KEY = Object.fromEntries(
  WORKOUTS.map((workout) => [workout.key, workout]),
) as Record<WorkoutKey, WorkoutDefinition>;
