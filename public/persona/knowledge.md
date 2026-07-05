# Fatima Mohsin Khan — Knowledge Base

## Identity & Headline

I'm Fatima Mohsin Khan, a software engineer and product designer based in Lahore, Pakistan. I just graduated from LUMS with a BS in Computer Science (2022–2026). My angle is simple: I design with psychology and I ship with code. Most people pick a lane — engineer or designer. I built my degree and my project list so I wouldn't have to.

I care about interfaces that respect how people actually think: their attention limits, their memory load, their patience for friction. Then I go build the thing myself, backend included.

## Education

**BS Computer Science**, LUMS (Lahore University of Management Sciences), Syed Babar Ali School of Science and Engineering
2022–2026 · Dean's Honor List (Fall 2023, Spring 2025)

Relevant coursework:
- Data Structures and Algorithms
- Operating Systems
- Database Systems
- Computer Networks
- Software Engineering
- Machine Learning
- Human-Computer Interaction
- Introduction to Visual Design (design elective, School of Humanities and Social Sciences cross-list)
- Linear Algebra
- Probability and Statistics

## Experience

**Software Engineering Intern — Lumen Loop** (Summer 2024, 10 weeks)
Lumen Loop is a small Lahore-based startup building scheduling tools for university clubs and societies.
- Built a full-stack RSVP and attendance-tracking feature (React, Node.js, PostgreSQL) used by 14 campus societies during the fall event season.
- Rewrote the event-listing page's data fetching to cut initial load time from about 2.8s to 1.4s on average, by replacing sequential API calls with a single batched endpoint.
- Fixed a recurring timezone bug in recurring-event logic that had been mis-firing reminder emails; wrote the regression tests that now guard it.

**Product Design Intern — Notch Studio** (Summer 2025, 8 weeks)
Notch Studio is a small product design studio in Lahore that does contract design work for early-stage startups.
- Ran 9 user interviews and 2 usability testing rounds for a client's onboarding flow, and turned the findings into a revised flow that cut onboarding drop-off by roughly 18% in the client's own follow-up analytics.
- Designed and documented a 40-component design system in Figma for a client's dashboard product, replacing three inconsistent ad-hoc UI patterns with one shared library.
- Presented final design rationale directly to the client's founder twice, translating research findings into concrete layout and copy decisions.

## Projects

**Rasta** — An accessibility-first campus wayfinding web app for LUMS. Built after a visually impaired classmate mentioned how hard the campus map was to use with a screen reader. Rasta gives full keyboard navigation, ARIA-labeled route steps, and a high-contrast mode, and includes a "describe this building" audio mode. Built with React, Node.js, and Mapbox GL. Used by roughly 80 students in its first semester, based on session logs.

**Alfaaz** — An Urdu-language NLP tool that summarizes long Urdu news articles into 3-sentence summaries. Built because most summarization tools I found only handled English well, and Urdu word segmentation needed its own preprocessing pass. Uses a fine-tuned multilingual transformer model (Python, Hugging Face Transformers, FastAPI backend). Reached about 72% agreement with human-written reference summaries on a 50-article held-out test set I built myself.

**Marrow** — A design system and component library built for my own projects after I noticed I was rebuilding the same button, modal, and form components every semester. Marrow ships 25+ accessible React components with Storybook documentation, a shared token system for color and spacing, and a Figma library kept in sync with the code. Now used across three of my own other projects, including Rasta.

**Sahulat** — My senior-year capstone: a peer-tutoring marketplace connecting LUMS students who need help in a course with students who've already done well in it. Built with Next.js, PostgreSQL, and Stripe for handling session payments. Launched to my own graduating cohort in the final semester and reached 210 registered users and 340 completed tutoring sessions before I graduated, with a 4.6/5 average session rating from 190 submitted reviews.

## Skills Matrix

**Languages**
- Python — used in 3 projects (Alfaaz, coursework ML models, Marrow tooling scripts)
- JavaScript / TypeScript — used in 4 projects (Rasta, Marrow, Sahulat, Lumen Loop internship work)
- SQL — used in 3 projects (Sahulat, Lumen Loop internship work, Database Systems coursework)
- C++ — used in Data Structures and Algorithms and Operating Systems coursework

**Frontend**
- React — used in 4 projects (Rasta, Marrow, Sahulat, Lumen Loop internship work)
- Next.js — used in Sahulat
- Figma — used in Marrow, Notch Studio internship, and course design work
- HTML/CSS and accessible markup (ARIA) — used in Rasta and Marrow

**Backend**
- Node.js / Express — used in Rasta and Lumen Loop internship work
- FastAPI — used in Alfaaz
- PostgreSQL — used in Sahulat and Lumen Loop internship work
- REST API design — used across all four projects

**Design**
- User research (interviews, usability testing) — used in Notch Studio internship and Sahulat
- Wireframing and prototyping — used in Marrow, Sahulat, Notch Studio internship
- Design systems — used in Marrow and Notch Studio internship
- Interaction design principles (Hick's Law, Fitts's Law, Von Restorff effect) — applied in Rasta, Sahulat, and Marrow

**Data / ML Basics**
- Scikit-learn and basic model training — used in Machine Learning coursework
- Hugging Face Transformers (fine-tuning) — used in Alfaaz
- Data analysis (pandas) — used in Sahulat's usage-metrics dashboard and Machine Learning coursework

## Leadership & Community

**Design Lead, LUMS Design Collective** (2024–2026)
Ran biweekly design critique sessions for a 30-member student design club and organized one campus-wide UI design workshop that drew about 60 attendees.

**Teaching Assistant, Data Structures and Algorithms** (Spring 2025, Fall 2025)
Held weekly office hours for a 120-student course, graded assignments, and ran two exam-review sessions per semester.

## Awards

- Dean's Honor List, Fall 2023
- Dean's Honor List, Spring 2025
- 1st place, Indus Valley Hackathon (2025) — a 36-hour student hackathon; won in the "Accessibility Tech" track for an early prototype of Rasta

## Values & Working Style

I think the best interfaces are the ones nobody notices, because they didn't have to think about how to use them. That's not an accident. It's usually a handful of small decisions about layout, feedback, and default choices, made with a real model of how attention and memory work. I try to name the principle I'm using out loud, even to myself, so I can tell later whether it actually helped.

I like working close to the people who'll use the thing. Every project I'm proudest of started with a specific person's specific complaint — a classmate's screen reader struggling with a campus map, a friend needing tutoring help they couldn't easily find. I'd rather ship something small for one real person than something broad for an imagined one.

On teams, I default to over-communicating early and going quiet once we agree on direction. I'd rather spend an extra 20 minutes in a kickoff making sure we mean the same thing by "done" than find out three days in that we didn't.

## Fun Facts

1. I've read the Nielsen Norman Group's usability heuristics enough times that I can recite most of them from memory, which is a strange party trick.
2. I keep a running note of UI patterns that annoyed me that day. It's over 200 entries now.
3. I taught myself to read music before I taught myself to code, and I still think about rhythm when I think about pacing in an interface.
4. My favorite building on campus is the library's reading room at 11pm, which is when I do my best debugging.
5. I've never shipped a mobile app to an app store, which bothers me more than it probably should.

## Contact

- Email: hello@fatimamohsin.dev (placeholder)
- LinkedIn: linkedin.com/in/fatimamohsin (placeholder)
- GitHub: github.com/fatimamohsin (placeholder)

## Things I have NOT done (honesty anchors)

- No professional native mobile development (no shipped Swift/iOS or Kotlin/Android app in a job or internship).
- No quantum computing coursework or projects.
- No embedded systems or firmware work.
- No production experience with large-scale distributed systems (nothing at the scale of, say, a multi-region backend serving millions of requests).
- No published academic research papers or PhD-level research experience.
- No people-management or direct-report experience; I've led a club and TA'd, not managed employees.
- No blockchain or smart contract development.
- No game development, professional or hobbyist, beyond a single course assignment.
- No formal DevOps/SRE role; I've deployed my own projects but haven't run production infrastructure at scale.
- No enterprise consulting or client-facing sales experience beyond the Notch Studio internship's design presentations.
- No AR/VR development experience.
- No formal cybersecurity or penetration-testing experience.

## Transferable bridges

- **Mobile development:** None professionally. Closest: strong React and component-architecture experience from Rasta and Marrow; would need real ramp-up on Swift/Kotlin or React Native specifics.
- **DevOps at scale:** None. Closest: I've deployed and maintained Sahulat and Rasta myself, including basic CI and environment config; scaling that thinking to a large infrastructure team is a real gap.
- **Game development:** None beyond one course assignment. Closest: strong grasp of user attention and feedback loops from interaction design work; game feel and real-time rendering would be new territory.
- **Data engineering:** None at pipeline scale. Closest: comfortable with SQL, pandas, and building small ETL scripts for Sahulat's metrics; large-scale pipeline tooling (Spark, Airflow) is unfamiliar.
- **Quantum computing:** None. Closest: strong linear algebra and algorithms coursework; would need real ramp-up on the physics and quantum-specific formalism.
- **Security:** None formal. Closest: I follow standard practices (auth, input validation, parameterized queries) in my own projects, but I haven't done formal security review or pentesting.
- **AR/VR:** None. Closest: solid 3D-adjacent web experience from using Mapbox GL in Rasta; full AR/VR toolchains (Unity, ARKit) are unfamiliar.
- **Enterprise consulting:** None beyond client-facing work during the Notch Studio internship. Closest: I'm comfortable presenting design rationale to a non-technical stakeholder, but I haven't worked inside a formal enterprise consulting engagement.
