export interface Definition {
  id: string;
  term: string;
  definition: string;
  example: string;
  topic: string;
  difficulty: 1 | 2 | 3;
}

export interface Topic {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

export const TOPICS: Topic[] = [
  { id: "wahrnehmung", name: "Wahrnehmung", emoji: "👁️", description: "Reiz, Empfindung, Gestaltgesetze", color: "purple" },
  { id: "lernen", name: "Lernen", emoji: "🧠", description: "Konditionierung, Verstärkung, Modelllernen", color: "blue" },
  { id: "gedaechtnis", name: "Gedächtnis", emoji: "💭", description: "Kurz- und Langzeitgedächtnis, Vergessen", color: "green" },
  { id: "persoenlichkeit", name: "Persönlichkeit", emoji: "🪞", description: "Big Five, Freud, Humanismus", color: "pink" },
  { id: "entwicklung", name: "Entwicklung", emoji: "🌱", description: "Piaget, Erikson, Kohlberg", color: "yellow" },
  { id: "sozialpsychologie", name: "Sozialpsychologie", emoji: "👥", description: "Attribution, Konformität, Vorurteile", color: "orange" },
  { id: "stress", name: "Stress & Coping", emoji: "😤", description: "Lazarus, Bewältigungsstrategien", color: "red" },
  { id: "kommunikation", name: "Kommunikation", emoji: "💬", description: "Watzlawick, Schulz von Thun", color: "teal" },
  { id: "stoerungen", name: "Psych. Störungen", emoji: "🧩", description: "Depression, Angst, Schizophrenie", color: "indigo" },
  { id: "motivation", name: "Motivation", emoji: "🎯", description: "Maslow, intrinsisch/extrinsisch", color: "cyan" },
];
