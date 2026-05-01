// Curated mock opportunity dataset for FuturePath AI
export type OpportunityType = "scholarship" | "internship" | "job" | "course";

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  organization: string;
  location: string;
  deadline?: string;
  amount?: string;
  duration?: string;
  level?: string;
  fields: string[];
  skills: string[];
  description: string;
  url: string;
  remote?: boolean;
}

export const OPPORTUNITIES: Opportunity[] = [
  // Scholarships
  { id: "sch-1", type: "scholarship", title: "Chevening Scholarship", organization: "UK Government", location: "United Kingdom", deadline: "2026-11-05", amount: "Full tuition + stipend", level: "Master's", fields: ["Any"], skills: ["Leadership"], description: "Fully-funded master's degree in any UK university for emerging leaders.", url: "https://www.chevening.org" },
  { id: "sch-2", type: "scholarship", title: "DAAD Scholarship Germany", organization: "DAAD", location: "Germany", deadline: "2026-10-31", amount: "€934/month", level: "Master's & PhD", fields: ["Engineering", "Sciences", "Computer Science"], skills: [], description: "Scholarships for international graduates studying in Germany.", url: "https://www.daad.de" },
  { id: "sch-3", type: "scholarship", title: "Mastercard Foundation Scholars", organization: "Mastercard Foundation", location: "Africa / Global", deadline: "2026-09-15", amount: "Full ride", level: "Undergrad & Master's", fields: ["Any"], skills: [], description: "Comprehensive scholarship for African students with leadership potential.", url: "https://mastercardfdn.org" },
  { id: "sch-4", type: "scholarship", title: "MIT Presidential Fellowship", organization: "MIT", location: "United States", deadline: "2026-12-15", amount: "$45,000/year", level: "PhD", fields: ["Computer Science", "Engineering"], skills: ["Research"], description: "Top-tier funding for incoming MIT doctoral students.", url: "https://oge.mit.edu" },
  { id: "sch-5", type: "scholarship", title: "Erasmus Mundus Joint Master", organization: "European Union", location: "Europe (multi-country)", deadline: "2027-01-15", amount: "€1,400/month", level: "Master's", fields: ["Any"], skills: [], description: "Study across multiple European universities with full funding.", url: "https://erasmus-plus.ec.europa.eu" },

  // Internships
  { id: "int-1", type: "internship", title: "Software Engineering Intern", organization: "Google", location: "Mountain View, CA", duration: "12 weeks", deadline: "2026-08-30", fields: ["Computer Science", "Engineering"], skills: ["Python", "Algorithms", "C++"], description: "Build production systems on Google products with mentorship.", url: "https://careers.google.com", remote: false },
  { id: "int-2", type: "internship", title: "Product Design Intern", organization: "Figma", location: "Remote", duration: "10 weeks", deadline: "2026-09-12", fields: ["Design", "Product"], skills: ["Figma", "UX"], description: "Ship features used by millions of designers worldwide.", url: "https://figma.com/careers", remote: true },
  { id: "int-3", type: "internship", title: "AI Research Intern", organization: "DeepMind", location: "London, UK", duration: "6 months", deadline: "2026-10-01", fields: ["AI", "Machine Learning"], skills: ["PyTorch", "Math", "Research"], description: "Work alongside leading researchers on frontier AI.", url: "https://deepmind.google/careers", remote: false },
  { id: "int-4", type: "internship", title: "Data Science Intern", organization: "Stripe", location: "Remote", duration: "12 weeks", fields: ["Data Science", "Finance"], skills: ["SQL", "Python", "Statistics"], description: "Drive data-informed decisions for global payments.", url: "https://stripe.com/jobs", remote: true },
  { id: "int-5", type: "internship", title: "Marketing Intern", organization: "Spotify", location: "Stockholm / Remote", duration: "6 months", fields: ["Marketing", "Business"], skills: ["Content", "Analytics"], description: "Shape music marketing campaigns for global audiences.", url: "https://lifeatspotify.com", remote: true },

  // Jobs
  { id: "job-1", type: "job", title: "Junior Frontend Engineer", organization: "Vercel", location: "Remote", level: "Entry-level", fields: ["Computer Science", "Web"], skills: ["React", "TypeScript", "Next.js"], description: "Build the platform millions of developers deploy to daily.", url: "https://vercel.com/careers", remote: true },
  { id: "job-2", type: "job", title: "ML Engineer", organization: "Anthropic", location: "San Francisco, CA", level: "Mid-level", fields: ["AI", "Machine Learning"], skills: ["Python", "PyTorch", "LLMs"], description: "Help build safer, more capable AI systems.", url: "https://anthropic.com/careers", remote: false },
  { id: "job-3", type: "job", title: "Associate Product Manager", organization: "Notion", location: "New York / Remote", level: "Entry-level", fields: ["Product", "Business"], skills: ["Strategy", "Communication"], description: "Drive product decisions for the all-in-one workspace.", url: "https://notion.so/careers", remote: true },
  { id: "job-4", type: "job", title: "UX Designer", organization: "Airbnb", location: "Remote", level: "Mid-level", fields: ["Design"], skills: ["Figma", "Research", "Prototyping"], description: "Design experiences for a global travel community.", url: "https://careers.airbnb.com", remote: true },
  { id: "job-5", type: "job", title: "Data Analyst", organization: "Shopify", location: "Remote (Worldwide)", level: "Entry-level", fields: ["Data Science", "Business"], skills: ["SQL", "Python", "Tableau"], description: "Turn merchant data into commerce insights.", url: "https://shopify.com/careers", remote: true },

  // Courses
  { id: "crs-1", type: "course", title: "Machine Learning Specialization", organization: "Coursera · Stanford", location: "Online", duration: "3 months", fields: ["AI", "Machine Learning"], skills: ["Python", "Math"], description: "Andrew Ng's foundational ML series. Industry standard.", url: "https://www.coursera.org/specializations/machine-learning-introduction" },
  { id: "crs-2", type: "course", title: "CS50: Introduction to Computer Science", organization: "Harvard / edX", location: "Online", duration: "12 weeks", fields: ["Computer Science"], skills: [], description: "The most popular CS intro course in the world. Free.", url: "https://cs50.harvard.edu" },
  { id: "crs-3", type: "course", title: "Google UX Design Certificate", organization: "Google · Coursera", location: "Online", duration: "6 months", fields: ["Design"], skills: ["Figma", "UX"], description: "Career-ready UX design credential, no degree required.", url: "https://grow.google/certificates/ux-design" },
  { id: "crs-4", type: "course", title: "Full-Stack Web Development", organization: "The Odin Project", location: "Online", duration: "Self-paced", fields: ["Web", "Computer Science"], skills: ["JavaScript", "React", "Node"], description: "Free, project-based path to becoming a full-stack dev.", url: "https://www.theodinproject.com" },
  { id: "crs-5", type: "course", title: "Financial Markets", organization: "Yale · Coursera", location: "Online", duration: "7 weeks", fields: ["Finance", "Business"], skills: [], description: "Robert Shiller's overview of the ideas powering finance.", url: "https://www.coursera.org/learn/financial-markets-global" },
];

export interface ProfileLike {
  field_of_interest?: string | null;
  skills?: string[] | null;
  career_goal?: string | null;
}

export function scoreOpportunity(o: Opportunity, profile: ProfileLike): number {
  let s = 0;
  const field = (profile.field_of_interest ?? "").toLowerCase();
  if (field) {
    if (o.fields.some((f) => f.toLowerCase().includes(field) || field.includes(f.toLowerCase()))) s += 50;
    if (o.title.toLowerCase().includes(field)) s += 20;
    if (o.description.toLowerCase().includes(field)) s += 10;
  }
  const skills = (profile.skills ?? []).map((x) => x.toLowerCase());
  for (const sk of skills) {
    if (o.skills.some((os) => os.toLowerCase().includes(sk) || sk.includes(os.toLowerCase()))) s += 12;
  }
  if (o.fields.includes("Any")) s += 5;
  return s;
}

export function recommendOpportunities(profile: ProfileLike, limit = 6): Opportunity[] {
  return [...OPPORTUNITIES]
    .map((o) => ({ o, s: scoreOpportunity(o, profile) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ o }) => o);
}
