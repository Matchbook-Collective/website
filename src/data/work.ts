export type WorkCategory = 'matchbook' | 'founder' | 'concept';
export interface CaseStudy {
  slug: string;
  title: string;
  category: WorkCategory;
  approved: boolean;
  challenge: string;
  observation: string;
  approach: string;
  deliverables: string;
  outcome: string;
  outcomeType: 'observed' | 'proposed';
  relationship: string;
  testimonial?: { quote: string; attribution: string; approved: boolean };
}
export const caseStudies: CaseStudy[] = []; // No approved case studies supplied.
export const workCategories = [
  {
    id: 'matchbook',
    title: 'Matchbook work',
    text: 'Projects completed under Matchbook, with the challenge, approach, and outcome in view.',
  },
  {
    id: 'founder',
    title: 'Founder experience',
    text: 'Selected work from Megan and Heather’s previous roles, clearly identified as prior career experience.',
  },
  {
    id: 'concept',
    title: 'Concept + point of view',
    text: 'Independent strategic exercises, clearly labeled as concepts rather than client engagements.',
  },
];
