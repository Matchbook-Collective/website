export interface Founder {
  name: string;
  role: string;
  surname: string | null;
  bio: string | null;
  portrait: string | null;
  careerHighlights: string[];
  personalDetail: string | null;
}
// Launch-note assignments are internal. Only names and cofounder status are established.
export const founders: Founder[] = [
  {
    name: 'Megan',
    role: 'Co-founder',
    bio: null,
    surname: null,
    portrait: null,
    careerHighlights: [],
    personalDetail: null,
  },
  {
    name: 'Heather',
    role: 'Co-founder',
    bio: null,
    surname: null,
    portrait: null,
    careerHighlights: [],
    personalDetail: null,
  },
];
export const originStory: string | null = null; // Awaiting founder-approved story.
