export interface Founder {
  name: string;
  role: string;
  surname: string | null;
  bio: string | null;
  portrait: string | null;
  careerHighlights: string[];
  personalDetail: string | null;
}
// Founder biographies use approved copy.
export const founders: Founder[] = [
  {
    name: 'Megan',
    role: 'Co-founder',
    bio: `I’m Megan, co-founder of Matchbook Collective. I uncover opportunities in your business that you may not know are already there.

That might be a new revenue stream, a partnership you haven’t considered, or a different approach to your marketing, advertising or sales. I’m an exceptional relationship builder, and I love figuring out how the right connection or idea can open up something new for a business.

What makes my experience different? Range.

I’ve spent 15 years working across creative agencies, corporate broadcast and digital media, with experience spanning healthcare, automotive, legal, major retailers and Fortune 500 companies. I’ve built sales infrastructure from the ground up, managed millions of dollars in advertising spend, and worked with brands including Carter’s, Shutterfly, HelloFresh, DoorDash, Rent the Runway, Enfamil and Similac.

That work has included opening a new channel for Foot Locker—finding a revenue opportunity beyond what was already in place. I bring that same curiosity and experience to finding opportunities in your business.

My experience gives me a lot of places to look when we’re figuring out your next move. I can dig into your sales process, look at how your operations shape the customer experience, and connect that with your branding, marketing and advertising. That means thinking about how you acquire new customers, keep existing clients, build loyalty and create an experience people want to come back to.

Maybe business has been stagnant and you need new clients. Maybe your brand no longer reflects what you’ve built. Maybe you have a big event coming up and need people to know about it. If you’re thinking about growth, there’s a good chance I can help you find a direction—and figure out what to do next.

I love that people can have a vision for their business and their future, dream big, and take a chance on themselves. Those are the people I want to work with: big dreamers who are willing to look at things differently. I want to hear what you’re building, understand where you want it to go, and uncover the opportunities that can help you get there.`,
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
