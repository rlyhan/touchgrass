import type { PortableTextBlock } from "@portabletext/types";
import { Activity } from "@touchgrass/types";

function pt(...paragraphs: string[]): PortableTextBlock[] {
  return paragraphs.map((text, i) => ({
    _type: "block",
    _key: `p${i}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `p${i}s0`, text, marks: [] }],
  }));
}

export const RECOMMENDATIONS: Activity[] = [
  {
    slug: "build-a-guitar-pedalboard",
    title: "Build a Guitar Pedalboard",
    imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "Music",
    estimated_time: "A weekend",
    related_types: ["Creative", "Skill-based", "Strategic", "Expressive"],
    description: pt("Design a personalized guitar pedalboard setup that improves your sound and playing workflow."),
    instructions: [
      { title: "Choose your essential pedals", description: "Start with effects you actually use often." },
      { title: "Plan the signal chain", description: "Experiment with pedal order for different tones." },
      { title: "Manage cables cleanly", description: "Keep wiring organized for reliability and portability." }
    ]
  },
  {
    slug: "join-a-beginner-boxing-class",
    title: "Join a Beginner Boxing Class",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&fit=crop&auto=format",
    type: "Active",
    field: "Martial Arts",
    estimated_time: "1 hour",
    related_types: ["Physical", "Disciplined", "Skill-based", "Mindful"],
    description: pt("Learn the fundamentals of boxing while improving fitness, coordination, and confidence."),
    instructions: [
      { title: "Focus on stance and footwork", description: "Good movement is more important than power at first." },
      { title: "Practice basic punches carefully", description: "Build technique before speed." },
      { title: "Stay relaxed while training", description: "Controlled breathing improves endurance and focus." }
    ]
  },
  {
    slug: "write-a-short-horror-screenplay",
    title: "Write a Short Horror Screenplay",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&fit=crop&auto=format",
    type: "Artistic",
    field: "Writing",
    estimated_time: "A few hours",
    related_types: ["Creative", "Expressive", "Emotional", "Reflective"],
    description: pt("Create a suspenseful short screenplay built around tension, atmosphere, and a memorable twist."),
    instructions: [
      { title: "Choose a strong central fear", description: "Build the story around one unsettling concept." },
      { title: "Outline the main beats", description: "Plan setup, escalation, and climax before writing." },
      { title: "Keep scenes visually focused", description: "Think cinematically rather than descriptively." }
    ]
  },
  {
    slug: "journal-while-listening-to-jazz",
    title: "Journal While Listening to Jazz",
    imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&fit=crop&auto=format",
    type: "Reflective",
    field: "Writing",
    estimated_time: "1 hour",
    related_types: ["Mindful", "Emotional", "Expressive", "Creative"],
    description: pt("Slow down and reflect through freeform journaling while listening to calming jazz music."),
    instructions: [
      { title: "Choose a relaxing playlist", description: "Use music that helps you settle into the moment." },
      { title: "Write without self-editing", description: "Let thoughts flow naturally onto the page." },
      { title: "Reflect on your mood afterward", description: "Notice how music influenced your thoughts." }
    ]
  },
  {
    slug: "study-music-theory-basics",
    title: "Study Music Theory Basics",
    imageUrl: "https://images.unsplash.com/photo-1514119412350-e174d90d280e?w=800&fit=crop&auto=format",
    type: "Educational",
    field: "Music",
    estimated_time: "A week",
    related_types: ["Intellectual", "Analytical", "Disciplined", "Creative"],
    description: pt("Learn foundational music theory concepts that strengthen songwriting and musicianship."),
    instructions: [
      { title: "Learn scales and intervals", description: "Understand how notes relate to each other." },
      { title: "Practice identifying chords", description: "Train your ear and theoretical understanding together." },
      { title: "Apply theory on your instrument", description: "Use concepts practically while playing music." }
    ]
  },
  {
    slug: "compose-a-1-minute-song",
    title: "Compose a 1-Minute Song",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&fit=crop&auto=format",
    type: "Creative",
    field: "Music",
    estimated_time: "A few hours",
    related_types: ["Artistic", "Expressive", "Emotional", "Performative"],
    description: pt("Challenge yourself to write a complete short song with structure, melody, and emotion."),
    instructions: [
      { title: "Start with a simple progression", description: "Keep the musical foundation easy to build on." },
      { title: "Focus on one memorable idea", description: "Prioritize a strong melody or hook." },
      { title: "Keep the arrangement concise", description: "Use simplicity to make the song feel complete." }
    ]
  },
  {
    slug: "host-a-vinyl-listening-night",
    title: "Host a Vinyl Listening Night",
    imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Music",
    estimated_time: "An evening",
    related_types: ["Community-oriented", "Collaborative", "Reflective", "Expressive"],
    description: pt("Bring friends together to intentionally listen to and discuss favorite vinyl records."),
    instructions: [
      { title: "Choose a theme or genre", description: "Create a cohesive listening experience." },
      { title: "Set up a comfortable space", description: "Focus on atmosphere and sound quality." },
      { title: "Encourage conversation between albums", description: "Share thoughts and musical discoveries." }
    ]
  },
  {
    slug: "build-a-home-heavy-bag-stand",
    title: "Build a Home Heavy Bag Stand",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "Martial Arts",
    estimated_time: "A weekend",
    related_types: ["Skill-based", "Strategic", "Disciplined", "Creative"],
    description: pt("Construct a durable heavy bag stand for boxing or kickboxing training at home."),
    instructions: [
      { title: "Measure your available space", description: "Plan for movement and stability around the bag." },
      { title: "Use strong materials", description: "Build with durability and safety in mind." },
      { title: "Test stability thoroughly", description: "Make sure the stand can handle repeated impact." }
    ]
  },
  {
    slug: "learn-tai-chi-basics",
    title: "Learn Tai Chi Basics",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&fit=crop&auto=format",
    type: "Mindful",
    field: "Martial Arts",
    estimated_time: "A week",
    related_types: ["Reflective", "Therapeutic", "Disciplined", "Physical"],
    description: pt("Practice foundational Tai Chi movements that improve balance, relaxation, and focus."),
    instructions: [
      { title: "Move slowly and deliberately", description: "Prioritize control and awareness over speed." },
      { title: "Focus on breathing rhythm", description: "Coordinate breath with movement naturally." },
      { title: "Practice consistently", description: "Short regular sessions build familiarity and calmness." }
    ]
  },
  {
    slug: "read-a-bruce-lee-biography",
    title: "Read a Bruce Lee Biography",
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&fit=crop&auto=format",
    type: "Reflective",
    field: "Martial Arts",
    estimated_time: "A week",
    related_types: ["Mindful", "Educational", "Disciplined", "Emotional"],
    description: pt("Explore Bruce Lee’s philosophy, discipline, and cultural impact through biography and reflection."),
    instructions: [
      { title: "Take notes on key ideas", description: "Highlight lessons that resonate with you personally." },
      { title: "Reflect on his philosophy", description: "Consider how discipline shaped his success." },
      { title: "Research his broader influence", description: "Learn about his impact beyond martial arts." }
    ]
  },
  {
    slug: "plan-a-martial-arts-training-trip",
    title: "Plan a Martial Arts Training Trip",
    imageUrl: "https://images.unsplash.com/photo-1544717684-1243da23b545?w=800&fit=crop&auto=format",
    type: "Adventurous",
    field: "Martial Arts",
    estimated_time: "A weekend",
    related_types: ["Exploratory", "Goal-oriented", "Physical", "Disciplined"],
    description: pt("Research and organize a trip centered around martial arts training, seminars, or cultural experiences."),
    instructions: [
      { title: "Choose a destination", description: "Look for gyms, dojos, or camps that match your interests." },
      { title: "Plan your schedule", description: "Balance training sessions with rest and exploration." },
      { title: "Prepare your equipment", description: "Pack any gear or uniforms you may need." }
    ]
  },
  {
    slug: "start-a-30-day-reading-challenge",
    title: "Start a 30-Day Reading Challenge",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&fit=crop&auto=format",
    type: "Reflective",
    field: "Writing",
    estimated_time: "A month",
    related_types: ["Mindful", "Emotional", "Expressive", "Creative", "Disciplined"],
    description: pt("Build a consistent reading habit by committing to reading every day for a month."),
    instructions: [
      { title: "Pick your reading list", description: "Choose books that genuinely interest you." },
      { title: "Set a daily goal", description: "Aim for a manageable page or time target." },
      { title: "Track your progress", description: "Use notes or a checklist to stay motivated." }
    ]
  },
  {
    slug: "join-a-local-book-club",
    title: "Join a Local Book Club",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Writing",
    estimated_time: "Ongoing",
    related_types: ["Collaborative", "Community-oriented", "Intellectual", "Expressive"],
    description: pt("Meet fellow readers and discuss books in a collaborative and social setting."),
    instructions: [
      { title: "Find a nearby group", description: "Search online or ask local libraries for recommendations." },
      { title: "Read the selected book", description: "Take notes on themes or favorite moments." },
      { title: "Participate in discussion", description: "Share your perspective and listen to others." }
    ]
  },
  {
    slug: "submit-a-story-to-a-literary-magazine",
    title: "Submit a Story to a Literary Magazine",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&fit=crop&auto=format",
    type: "Professional",
    field: "Writing",
    estimated_time: "A weekend",
    related_types: ["Goal-oriented", "Creative", "Disciplined", "Strategic"],
    description: pt("Polish and submit your creative writing to a literary publication for consideration."),
    instructions: [
      { title: "Edit your story carefully", description: "Refine pacing, grammar, and clarity before submitting." },
      { title: "Research suitable magazines", description: "Choose publications that fit your style and genre." },
      { title: "Follow submission guidelines", description: "Double-check formatting and word count requirements." }
    ]
  },
  {
    slug: "analyze-a-classic-novel-chapter-by-chapter",
    title: "Analyze a Classic Novel Chapter by Chapter",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&fit=crop&auto=format",
    type: "Intellectual",
    field: "Writing",
    estimated_time: "A week",
    related_types: ["Analytical", "Educational", "Reflective", "Creative"],
    description: pt("Deeply examine a classic novel by studying themes, characters, and structure chapter by chapter."),
    instructions: [
      { title: "Read slowly and actively", description: "Highlight important passages and recurring ideas." },
      { title: "Take analytical notes", description: "Write observations about symbolism and character development." },
      { title: "Summarize each chapter", description: "Reflect on how the story evolves over time." }
    ]
  },
  {
    slug: "develop-a-personal-cookbook",
    title: "Develop a Personal Cookbook",
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&fit=crop&auto=format",
    type: "Creative",
    field: "Cooking",
    estimated_time: "A month",
    related_types: ["Artistic", "Expressive", "Reflective", "Experimental", "Constructive"],
    description: pt("Compile your favorite recipes, cooking notes, and personal touches into a custom cookbook."),
    instructions: [
      { title: "Collect your best recipes", description: "Choose dishes you genuinely enjoy making." },
      { title: "Organize recipes by category", description: "Group meals, desserts, or cuisines together." },
      { title: "Add personal notes", description: "Include tips, stories, or serving ideas." }
    ]
  },
  {
    slug: "cook-one-regions-cuisine-for-a-week",
    title: "Cook One Region's Cuisine for a Week",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&fit=crop&auto=format",
    type: "Adventurous",
    field: "Cooking",
    estimated_time: "A week",
    related_types: ["Exploratory", "Outdoorsy", "Reflective", "Goal-oriented", "Experimental"],
    description: pt("Immerse yourself in a regional cuisine by cooking dishes from the same culture for an entire week."),
    instructions: [
      { title: "Choose a region", description: "Pick a cuisine you are curious about exploring." },
      { title: "Research traditional dishes", description: "Learn about common ingredients and techniques." },
      { title: "Cook multiple meals", description: "Experiment with a variety of recipes throughout the week." }
    ]
  },
  {
    slug: "pitch-a-pop-up-restaurant-concept",
    title: "Pitch a Pop-Up Restaurant Concept",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&fit=crop&auto=format",
    type: "Professional",
    field: "Cooking",
    estimated_time: "A week",
    related_types: ["Goal-oriented", "Strategic", "Disciplined", "Leadership", "Creative"],
    description: pt("Design and present a creative pop-up restaurant idea with a clear identity and audience."),
    instructions: [
      { title: "Define your concept", description: "Choose a cuisine, atmosphere, and target audience." },
      { title: "Create a sample menu", description: "Develop dishes that support your theme." },
      { title: "Prepare a short pitch", description: "Explain why your concept would stand out." }
    ]
  },
  {
    slug: "shoot-a-golden-hour-walk",
    title: "Shoot a Golden Hour Walk",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&fit=crop&auto=format",
    type: "Reflective",
    field: "Photography",
    estimated_time: "1 hour",
    related_types: ["Mindful", "Artistic", "Outdoorsy", "Emotional"],
    description: pt("Capture warm natural lighting and quiet moments during a walk at golden hour."),
    instructions: [
      { title: "Go out before sunset", description: "Plan your walk when the light is soft and warm." },
      { title: "Experiment with angles", description: "Try silhouettes, reflections, and backlighting." },
      { title: "Focus on atmosphere", description: "Capture mood as much as composition." }
    ]
  },
  {
    slug: "build-a-working-pinhole-camera",
    title: "Build a Working Pinhole Camera",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "Photography",
    estimated_time: "A weekend",
    related_types: ["Experimental", "Skill-based", "Creative", "Analytical"],
    description: pt("Create a simple pinhole camera and explore the fundamentals of analog photography."),
    instructions: [
      { title: "Gather lightproof materials", description: "Use a box or container that blocks external light." },
      { title: "Create a precise pinhole", description: "Small adjustments affect image sharpness." },
      { title: "Test exposure times", description: "Experiment to see how light impacts the final image." }
    ]
  },
  {
    slug: "create-a-12-page-photo-zine",
    title: "Create a 12-Page Photo Zine",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&fit=crop&auto=format",
    type: "Artistic",
    field: "Photography",
    estimated_time: "A weekend",
    related_types: ["Creative", "Expressive", "Reflective", "Experimental"],
    description: pt("Design a small self-published photo zine that tells a visual story or explores a theme."),
    instructions: [
      { title: "Choose a visual theme", description: "Build the zine around a consistent mood or idea." },
      { title: "Select your strongest photos", description: "Focus on quality and visual cohesion." },
      { title: "Arrange pages intentionally", description: "Think about pacing and flow between spreads." }
    ]
  },
  {
    slug: "lead-a-saturday-photowalk",
    title: "Lead a Saturday Photowalk",
    imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Photography",
    estimated_time: "An afternoon",
    related_types: ["Leadership", "Collaborative", "Outdoorsy", "Creative"],
    description: pt("Organize and guide a casual group photography walk through an interesting location."),
    instructions: [
      { title: "Plan a scenic route", description: "Choose areas with good lighting and varied subjects." },
      { title: "Encourage creativity", description: "Suggest prompts or challenges during the walk." },
      { title: "Share photos afterward", description: "Create a space for participants to exchange images." }
    ]
  },
  {
    slug: "capture-wildlife-in-a-state-park",
    title: "Capture Wildlife in a State Park",
    imageUrl: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&fit=crop&auto=format",
    type: "Outdoorsy",
    field: "Photography",
    estimated_time: "An afternoon",
    related_types: ["Adventurous", "Artistic", "Reflective", "Exploratory"],
    description: pt("Photograph wildlife responsibly while exploring the natural beauty of a state park."),
    instructions: [
      { title: "Research the location", description: "Learn which animals are commonly seen there." },
      { title: "Bring the right lens", description: "Use zoom lenses to avoid disturbing wildlife." },
      { title: "Be patient and observant", description: "Wait quietly for natural moments to appear." }
    ]
  },
  {
    slug: "run-a-tabletop-rpg-one-shot",
    title: "Run a Tabletop RPG One-Shot",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Gaming",
    estimated_time: "An afternoon",
    related_types: ["Collaborative", "Leadership", "Creative", "Community-oriented"],
    description: pt("Host a self-contained tabletop RPG adventure for friends in a single session."),
    instructions: [
      { title: "Prepare a simple storyline", description: "Keep the plot focused and easy to follow." },
      { title: "Create memorable encounters", description: "Mix roleplay, puzzles, and combat." },
      { title: "Encourage player creativity", description: "Adapt to unexpected decisions and ideas." }
    ]
  },
  {
    slug: "design-a-board-game-prototype",
    title: "Design a Board Game Prototype",
    imageUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&fit=crop&auto=format",
    type: "Creative",
    field: "Gaming",
    estimated_time: "A weekend",
    related_types: ["Strategic", "Constructive", "Experimental", "Analytical"],
    description: pt("Develop a playable board game prototype with original mechanics and objectives."),
    instructions: [
      { title: "Define the core gameplay loop", description: "Decide what players repeatedly do during the game." },
      { title: "Build a rough prototype", description: "Use simple materials before polishing visuals." },
      { title: "Playtest with others", description: "Observe where rules or pacing need improvement." }
    ]
  },
  {
    slug: "stream-your-first-twitch-session",
    title: "Stream Your First Twitch Session",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&fit=crop&auto=format",
    type: "Professional",
    field: "Gaming",
    estimated_time: "1 hour",
    related_types: ["Performative", "Expressive", "Social", "Goal-oriented"],
    description: pt("Go live for the first time and learn the basics of streaming gameplay or creative content."),
    instructions: [
      { title: "Test your audio and video", description: "Make sure viewers can clearly hear and see you." },
      { title: "Choose a simple stream topic", description: "Start with content you feel comfortable sharing." },
      { title: "Interact with viewers", description: "Respond to messages and build engagement." }
    ]
  },
  {
    slug: "beat-a-notoriously-difficult-rpg",
    title: "Beat a Notoriously Difficult RPG",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&fit=crop&auto=format",
    type: "Adventurous",
    field: "Gaming",
    estimated_time: "A month",
    related_types: ["Competitive", "Goal-oriented", "Strategic", "Disciplined"],
    description: pt("Commit to finishing a famously challenging RPG through patience and persistence."),
    instructions: [
      { title: "Learn the game systems", description: "Understanding mechanics will make progress smoother." },
      { title: "Stay patient during setbacks", description: "Treat failures as learning opportunities." },
      { title: "Celebrate milestones", description: "Recognize progress throughout the journey." }
    ]
  },
  {
    slug: "try-a-30-day-push-up-challenge",
    title: "Try a 30-Day Push-Up Challenge",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&fit=crop&auto=format",
    type: "Active",
    field: "Fitness",
    estimated_time: "A month",
    related_types: ["Physical", "Disciplined", "Goal-oriented", "Competitive"],
    description: pt("Build upper body strength and consistency through a month-long push-up challenge."),
    instructions: [
      { title: "Start with realistic numbers", description: "Choose a daily goal you can maintain." },
      { title: "Focus on proper form", description: "Maintain alignment and full range of motion." },
      { title: "Track daily progress", description: "Record reps to stay motivated." }
    ]
  },
  {
    slug: "build-a-garage-gym-setup",
    title: "Build a Garage Gym Setup",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "Fitness",
    estimated_time: "A weekend",
    related_types: ["Strategic", "Goal-oriented", "Disciplined", "Analytical"],
    description: pt("Design a practical home gym setup tailored to your fitness goals and available space."),
    instructions: [
      { title: "Measure your space", description: "Plan around movement and equipment clearance." },
      { title: "Choose versatile equipment", description: "Prioritize items that support multiple exercises." },
      { title: "Organize for safety", description: "Keep weights and gear stored neatly." }
    ]
  },
  {
    slug: "map-a-park-workout-loop",
    title: "Map a Park Workout Loop",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&fit=crop&auto=format",
    type: "Outdoorsy",
    field: "Fitness",
    estimated_time: "An afternoon",
    related_types: ["Active", "Strategic", "Physical", "Adventurous"],
    description: pt("Create an outdoor workout route that combines movement, cardio, and exercise stations."),
    instructions: [
      { title: "Scout the location", description: "Look for open areas and useful structures." },
      { title: "Plan exercise intervals", description: "Alternate cardio with strength exercises." },
      { title: "Test the route", description: "Adjust timing or difficulty after trying it." }
    ]
  },
  {
    slug: "sign-up-for-your-first-5k",
    title: "Sign Up for Your First 5K",
    imageUrl: "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&fit=crop&auto=format",
    type: "Adventurous",
    field: "Fitness",
    estimated_time: "A month",
    related_types: ["Exploratory", "Outdoorsy", "Reflective", "Goal-oriented", "Physical"],
    description: pt("Train toward completing your first organized 5K race with confidence and preparation."),
    instructions: [
      { title: "Choose a beginner-friendly race", description: "Look for supportive local events." },
      { title: "Follow a simple training plan", description: "Increase running distance gradually." },
      { title: "Prepare for race day", description: "Get enough rest and hydrate properly." }
    ]
  },
  {
    slug: "get-personal-trainer-certified",
    title: "Get Personal Trainer Certified",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&fit=crop&auto=format",
    type: "Professional",
    field: "Fitness",
    estimated_time: "A month",
    related_types: ["Educational", "Disciplined", "Leadership", "Goal-oriented"],
    description: pt("Study exercise science and coaching principles to earn a personal training certification."),
    instructions: [
      { title: "Research certification programs", description: "Compare requirements and reputations." },
      { title: "Create a study schedule", description: "Break anatomy and training concepts into manageable sections." },
      { title: "Practice coaching skills", description: "Apply what you learn with real workouts." }
    ]
  },
  {
    slug: "build-a-personal-site-from-scratch",
    title: "Build a Personal Site From Scratch",
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "Coding",
    estimated_time: "A weekend",
    related_types: ["Creative", "Skill-based", "Analytical", "Strategic"],
    description: pt("Create a custom personal website that showcases your work, interests, or portfolio."),
    instructions: [
      { title: "Plan your site structure", description: "Decide which pages and sections you need." },
      { title: "Build responsive layouts", description: "Make sure the site works across devices." },
      { title: "Deploy the project online", description: "Publish the site so others can access it." }
    ]
  },
  {
    slug: "read-the-pragmatic-programmer",
    title: "Read The Pragmatic Programmer",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&fit=crop&auto=format",
    type: "Intellectual",
    field: "Coding",
    estimated_time: "A week",
    related_types: ["Educational", "Reflective", "Analytical", "Disciplined"],
    description: pt("Study timeless software development principles from a classic programming book."),
    instructions: [
      { title: "Read actively", description: "Take notes on ideas that stand out to you." },
      { title: "Apply lessons to projects", description: "Practice concepts through real coding work." },
      { title: "Reflect on your workflow", description: "Identify habits you want to improve." }
    ]
  },
  {
    slug: "join-a-local-hack-night",
    title: "Join a Local Hack Night",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Coding",
    estimated_time: "1 hour",
    related_types: ["Collaborative", "Community-oriented", "Leadership", "Creative"],
    description: pt("Collaborate with other developers during a casual coding meetup or hack night."),
    instructions: [
      { title: "Introduce yourself to others", description: "Networking is part of the experience." },
      { title: "Contribute to a small project", description: "Focus on learning and collaboration." },
      { title: "Share what you built", description: "Present progress even if unfinished." }
    ]
  },
  {
    slug: "contribute-your-first-open-source-pr",
    title: "Contribute Your First Open Source PR",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&fit=crop&auto=format",
    type: "Professional",
    field: "Coding",
    estimated_time: "A week",
    related_types: ["Collaborative", "Goal-oriented", "Disciplined", "Strategic"],
    description: pt("Make your first contribution to an open-source project through a pull request."),
    instructions: [
      { title: "Find a beginner-friendly issue", description: "Look for projects welcoming new contributors." },
      { title: "Follow contribution guidelines", description: "Read the repository documentation carefully." },
      { title: "Communicate clearly", description: "Explain your changes in the pull request." }
    ]
  },
  {
    slug: "run-a-kitchen-chemistry-experiment",
    title: "Run a Kitchen Chemistry Experiment",
    imageUrl: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "Science",
    estimated_time: "1 hour",
    related_types: ["Skill-based", "Strategic", "Disciplined", "Creative", "Experimental"],
    description: pt("Explore scientific concepts through safe and creative chemistry experiments at home."),
    instructions: [
      { title: "Choose a safe experiment", description: "Use household materials and simple reactions." },
      { title: "Follow instructions carefully", description: "Measure ingredients accurately." },
      { title: "Observe and record results", description: "Take notes on reactions and outcomes." }
    ]
  },
  {
    slug: "read-cosmos-by-carl-sagan",
    title: "Read Cosmos by Carl Sagan",
    imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&fit=crop&auto=format",
    type: "Reflective",
    field: "Science",
    estimated_time: "A week",
    related_types: ["Mindful", "Emotional", "Intellectual", "Expressive", "Educational"],
    description: pt("Explore astronomy, humanity, and science through Carl Sagan’s influential book Cosmos."),
    instructions: [
      { title: "Read a chapter at a time", description: "Take time to absorb the scientific concepts." },
      { title: "Research unfamiliar topics", description: "Look deeper into ideas that interest you." },
      { title: "Reflect on the big-picture themes", description: "Consider humanity’s place in the universe." }
    ]
  },
  {
    slug: "track-a-citizen-science-project",
    title: "Track a Citizen Science Project",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&fit=crop&auto=format",
    type: "Intellectual",
    field: "Science",
    estimated_time: "A month",
    related_types: ["Analytical", "Educational", "Reflective", "Strategic", "Community-oriented"],
    description: pt("Contribute observations or data to a citizen science initiative and support real research."),
    instructions: [
      { title: "Choose a project", description: "Find one related to nature, astronomy, or environmental science." },
      { title: "Collect accurate data", description: "Follow the project guidelines carefully." },
      { title: "Submit findings consistently", description: "Contribute regularly throughout the month." }
    ]
  },
  {
    slug: "hike-to-a-geological-formation",
    title: "Hike to a Geological Formation",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&fit=crop&auto=format",
    type: "Outdoorsy",
    field: "Science",
    estimated_time: "An afternoon",
    related_types: ["Adventurous", "Reflective", "Mindful", "Exploratory", "Educational"],
    description: pt("Explore a unique geological site while learning about natural history and land formation."),
    instructions: [
      { title: "Research the trail", description: "Check terrain, weather, and difficulty beforehand." },
      { title: "Bring essential supplies", description: "Carry water, snacks, and proper footwear." },
      { title: "Observe geological details", description: "Look closely at rock layers and formations." }
    ]
  },
  {
    slug: "apply-to-a-lab-volunteer-program",
    title: "Apply to a Lab Volunteer Program",
    imageUrl: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=800&fit=crop&auto=format",
    type: "Professional",
    field: "Science",
    estimated_time: "A week",
    related_types: ["Goal-oriented", "Strategic", "Disciplined", "Leadership", "Educational"],
    description: pt("Gain hands-on experience in scientific research by volunteering in a laboratory setting."),
    instructions: [
      { title: "Research local opportunities", description: "Look at universities, hospitals, or nonprofits." },
      { title: "Prepare a short application", description: "Highlight your interests and willingness to learn." },
      { title: "Follow up professionally", description: "Send polite emails if you do not hear back." }
    ]
  },
  {
    slug: "start-an-indoor-herb-garden",
    title: "Start an Indoor Herb Garden",
    imageUrl: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "Nature",
    estimated_time: "A few hours",
    related_types: ["Skill-based", "Strategic", "Disciplined", "Creative", "Mindful"],
    description: pt("Grow fresh herbs indoors and create a calming, practical addition to your living space."),
    instructions: [
      { title: "Choose easy starter herbs", description: "Basil, mint, and parsley are beginner-friendly." },
      { title: "Place plants near sunlight", description: "Most herbs need several hours of light daily." },
      { title: "Water consistently", description: "Avoid overwatering while keeping soil lightly moist." }
    ]
  },
  {
    slug: "spend-an-hour-forest-bathing",
    title: "Spend an Hour Forest Bathing",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&fit=crop&auto=format",
    type: "Reflective",
    field: "Nature",
    estimated_time: "1 hour",
    related_types: ["Mindful", "Emotional", "Intellectual", "Expressive", "Therapeutic"],
    description: pt("Slow down and reconnect with nature through a calm, mindful walk in a forest environment."),
    instructions: [
      { title: "Walk without distractions", description: "Avoid checking your phone during the experience." },
      { title: "Focus on sensory details", description: "Notice sounds, textures, and scents around you." },
      { title: "Move slowly and intentionally", description: "Treat the walk as meditation rather than exercise." }
    ]
  },
  {
    slug: "identify-ten-local-plant-species",
    title: "Identify Ten Local Plant Species",
    imageUrl: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&fit=crop&auto=format",
    type: "Intellectual",
    field: "Nature",
    estimated_time: "An afternoon",
    related_types: ["Analytical", "Educational", "Reflective", "Strategic", "Outdoorsy"],
    description: pt("Learn about local biodiversity by identifying plant species in your area."),
    instructions: [
      { title: "Bring a plant identification app", description: "Use tools to help confirm species." },
      { title: "Photograph each plant", description: "Capture leaves, flowers, and surroundings." },
      { title: "Take notes on habitats", description: "Observe where different plants tend to grow." }
    ]
  },
  {
    slug: "volunteer-for-a-trail-cleanup",
    title: "Volunteer for a Trail Cleanup",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Nature",
    estimated_time: "An afternoon",
    related_types: ["Collaborative", "Community-oriented", "Expressive", "Leadership", "Outdoorsy"],
    description: pt("Help preserve local outdoor spaces by participating in a community trail cleanup."),
    instructions: [
      { title: "Bring gloves and supplies", description: "Prepare for collecting litter safely." },
      { title: "Work carefully in groups", description: "Coordinate with volunteers for efficiency." },
      { title: "Leave the area better than you found it", description: "Focus on protecting the environment." }
    ]
  },
  {
    slug: "camp-solo-for-a-single-night",
    title: "Camp Solo for a Single Night",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&fit=crop&auto=format",
    type: "Adventurous",
    field: "Nature",
    estimated_time: "A weekend",
    related_types: ["Exploratory", "Outdoorsy", "Reflective", "Goal-oriented"],
    description: pt("Experience solitude and independence by spending a night camping alone in nature."),
    instructions: [
      { title: "Choose a safe campsite", description: "Pick an accessible and beginner-friendly location." },
      { title: "Pack essentials carefully", description: "Bring shelter, lighting, food, and warm clothing." },
      { title: "Embrace the quiet", description: "Spend time reflecting without distractions." }
    ]
  },
  {
    slug: "watch-a-directors-full-filmography",
    title: "Watch a Director's Full Filmography",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&fit=crop&auto=format",
    type: "Intellectual",
    field: "Film",
    estimated_time: "A month",
    related_types: ["Analytical", "Educational", "Reflective", "Strategic"],
    description: pt("Study a filmmaker’s artistic evolution by watching their films in sequence."),
    instructions: [
      { title: "Choose a director you admire", description: "Pick someone with a distinct creative voice." },
      { title: "Take notes on recurring themes", description: "Observe visual style and storytelling patterns." },
      { title: "Compare early and later work", description: "Track how the director’s approach changes over time." }
    ]
  },
  {
    slug: "host-a-themed-film-night",
    title: "Host a Themed Film Night",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Film",
    estimated_time: "1 hour",
    related_types: ["Collaborative", "Community-oriented", "Expressive", "Leadership"],
    description: pt("Create a memorable movie night experience around a shared genre, director, or theme."),
    instructions: [
      { title: "Choose a strong theme", description: "Pick films that connect visually or narratively." },
      { title: "Prepare snacks and seating", description: "Make the environment comfortable and inviting." },
      { title: "Encourage discussion afterward", description: "Talk about favorite scenes and interpretations." }
    ]
  },
  {
    slug: "pitch-a-tv-pilot-logline",
    title: "Pitch a TV Pilot Logline",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&fit=crop&auto=format",
    type: "Professional",
    field: "Film",
    estimated_time: "A few hours",
    related_types: ["Goal-oriented", "Strategic", "Disciplined", "Leadership", "Creative"],
    description: pt("Develop and pitch a compelling logline for an original television pilot concept."),
    instructions: [
      { title: "Define the core conflict", description: "Clarify what drives the story forward." },
      { title: "Introduce the protagonist clearly", description: "Make the lead character memorable." },
      { title: "Keep the pitch concise", description: "Focus on intrigue and originality." }
    ]
  },
  {
    slug: "reflect-on-your-five-favorite-films",
    title: "Reflect on Your Five Favorite Films",
    imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&fit=crop&auto=format",
    type: "Reflective",
    field: "Film",
    estimated_time: "1 hour",
    related_types: ["Mindful", "Emotional", "Intellectual", "Expressive"],
    description: pt("Think deeply about the films that have shaped your taste, emotions, or worldview."),
    instructions: [
      { title: "List your five favorites", description: "Choose films with lasting personal impact." },
      { title: "Identify recurring themes", description: "Notice patterns in genre or storytelling." },
      { title: "Write short reflections", description: "Describe why each film resonates with you." }
    ]
  },
  {
    slug: "audition-for-community-theater",
    title: "Audition for Community Theater",
    imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&fit=crop&auto=format",
    type: "Active",
    field: "Theater",
    estimated_time: "An afternoon",
    related_types: ["Physical", "Disciplined", "Goal-oriented", "Competitive", "Performative"],
    description: pt("Step onto the stage and audition for a local theater production."),
    instructions: [
      { title: "Prepare a short monologue", description: "Choose material that suits your personality." },
      { title: "Practice projection and confidence", description: "Focus on clarity and stage presence." },
      { title: "Stay open to feedback", description: "Treat the audition as a learning experience." }
    ]
  },
  {
    slug: "build-a-set-piece-for-a-production",
    title: "Build a Set Piece for a Production",
    imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "Theater",
    estimated_time: "A weekend",
    related_types: ["Skill-based", "Strategic", "Disciplined", "Creative", "Collaborative"],
    description: pt("Create a functional and visually engaging set piece for a theater performance."),
    instructions: [
      { title: "Sketch the design first", description: "Plan dimensions and materials before building." },
      { title: "Use lightweight materials", description: "Make the piece easier to transport and adjust." },
      { title: "Test stability and safety", description: "Ensure the structure works reliably on stage." }
    ]
  },
  {
    slug: "write-a-10-minute-play",
    title: "Write a 10-Minute Play",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&fit=crop&auto=format",
    type: "Artistic",
    field: "Theater",
    estimated_time: "A few hours",
    related_types: ["Creative", "Expressive", "Emotional", "Reflective"],
    description: pt("Write a concise stage play with strong characters and a focused dramatic arc."),
    instructions: [
      { title: "Limit the number of characters", description: "Keep the story manageable and focused." },
      { title: "Establish conflict quickly", description: "Introduce tension early in the script." },
      { title: "End with impact", description: "Aim for a memorable final moment or revelation." }
    ]
  },
  {
    slug: "run-an-improv-night-with-friends",
    title: "Run an Improv Night With Friends",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Theater",
    estimated_time: "1 hour",
    related_types: ["Collaborative", "Community-oriented", "Expressive", "Leadership", "Performative"],
    description: pt("Host a fun improvisation session filled with games, creativity, and spontaneous acting."),
    instructions: [
      { title: "Prepare simple improv games", description: "Use activities that encourage participation." },
      { title: "Keep the environment supportive", description: "Focus on fun rather than performance quality." },
      { title: "Encourage quick thinking", description: "Build scenes by reacting naturally to others." }
    ]
  },
  {
    slug: "direct-a-staged-reading",
    title: "Direct a Staged Reading",
    imageUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&fit=crop&auto=format",
    type: "Professional",
    field: "Theater",
    estimated_time: "A weekend",
    related_types: ["Goal-oriented", "Strategic", "Disciplined", "Leadership", "Collaborative"],
    description: pt("Lead actors through a staged reading that highlights storytelling and performance."),
    instructions: [
      { title: "Choose a strong script", description: "Pick material suited for vocal performance." },
      { title: "Guide pacing and tone", description: "Help actors emphasize emotion and clarity." },
      { title: "Keep staging simple", description: "Focus attention on dialogue and character interaction." }
    ]
  },
  {
    slug: "take-a-pottery-wheel-class",
    title: "Take a Pottery Wheel Class",
    imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "Art",
    estimated_time: "1 hour",
    related_types: ["Skill-based", "Strategic", "Disciplined", "Creative", "Artistic"],
    description: pt("Learn the basics of wheel throwing while creating handmade ceramic pieces."),
    instructions: [
      { title: "Center the clay carefully", description: "Balanced clay is essential for shaping pottery." },
      { title: "Keep your hands steady", description: "Use consistent pressure while forming the piece." },
      { title: "Embrace imperfections", description: "Focus on learning rather than perfection." }
    ]
  },
  {
    slug: "sketch-in-a-public-park",
    title: "Sketch in a Public Park",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&fit=crop&auto=format",
    type: "Outdoorsy",
    field: "Art",
    estimated_time: "1 hour",
    related_types: ["Adventurous", "Reflective", "Mindful", "Exploratory", "Artistic"],
    description: pt("Practice observational drawing while enjoying the atmosphere of a public park."),
    instructions: [
      { title: "Find a comfortable location", description: "Choose a spot with interesting scenery or people." },
      { title: "Start with loose outlines", description: "Focus on overall shapes before details." },
      { title: "Observe light and movement", description: "Capture the energy of the environment." }
    ]
  },
  {
    slug: "curate-a-gallery-wall-in-your-home",
    title: "Curate a Gallery Wall in Your Home",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&fit=crop&auto=format",
    type: "Creative",
    field: "Art",
    estimated_time: "An afternoon",
    related_types: ["Artistic", "Expressive", "Reflective", "Experimental"],
    description: pt("Design a visually cohesive gallery wall using art, photos, or collected pieces."),
    instructions: [
      { title: "Choose a visual theme", description: "Keep colors or styles relatively consistent." },
      { title: "Arrange layouts beforehand", description: "Experiment with spacing before hanging anything." },
      { title: "Mix frame sizes thoughtfully", description: "Create variety while maintaining balance." }
    ]
  },
  {
    slug: "sell-a-piece-at-a-local-market",
    title: "Sell a Piece at a Local Market",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&fit=crop&auto=format",
    type: "Professional",
    field: "Art",
    estimated_time: "A weekend",
    related_types: ["Goal-oriented", "Strategic", "Disciplined", "Leadership", "Artistic"],
    description: pt("Share and sell your creative work in a local community market environment."),
    instructions: [
      { title: "Choose your best work", description: "Display pieces that represent your style clearly." },
      { title: "Set up an inviting table", description: "Use signage and presentation to attract attention." },
      { title: "Talk confidently about your work", description: "Engage with visitors and answer questions." }
    ]
  },
  {
    slug: "draft-a-personal-essay",
    title: "Draft a Personal Essay",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&fit=crop&auto=format",
    type: "Reflective",
    field: "Writing",
    estimated_time: "A few hours",
    related_types: ["Mindful", "Emotional", "Expressive", "Creative"],
    description: pt("Write a reflective personal essay centered around a meaningful experience or idea."),
    instructions: [
      { title: "Choose a personal theme", description: "Focus on a story with emotional significance." },
      { title: "Write honestly and specifically", description: "Use concrete details and reflection." },
      { title: "Revise for clarity", description: "Strengthen transitions and narrative flow." }
    ]
  },
  {
    slug: "co-write-a-story-with-a-friend",
    title: "Co-Write a Story With a Friend",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Writing",
    estimated_time: "A few hours",
    related_types: ["Collaborative", "Community-oriented", "Intellectual", "Expressive", "Creative"],
    description: pt("Collaborate on a fictional story by combining ideas, characters, and writing styles."),
    instructions: [
      { title: "Agree on the premise", description: "Start with a shared direction for the story." },
      { title: "Split writing responsibilities", description: "Alternate scenes or character perspectives." },
      { title: "Edit together afterward", description: "Unify tone and pacing collaboratively." }
    ]
  },
  {
    slug: "try-stream-of-consciousness-daily",
    title: "Try Stream-of-Consciousness Daily",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&fit=crop&auto=format",
    type: "Creative",
    field: "Writing",
    estimated_time: "A month",
    related_types: ["Artistic", "Expressive", "Reflective", "Experimental", "Disciplined"],
    description: pt("Develop creativity and self-awareness through unfiltered daily writing sessions."),
    instructions: [
      { title: "Write without stopping", description: "Avoid editing or censoring your thoughts." },
      { title: "Set a timer", description: "Commit to a short daily writing session." },
      { title: "Notice recurring ideas", description: "Reflect on themes that appear often." }
    ]
  },
  {
    slug: "pitch-a-magazine-feature-article",
    title: "Pitch a Magazine Feature Article",
    imageUrl: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&fit=crop&auto=format",
    type: "Professional",
    field: "Writing",
    estimated_time: "A week",
    related_types: ["Goal-oriented", "Creative", "Disciplined", "Strategic"],
    description: pt("Develop and pitch a compelling feature article idea to a publication."),
    instructions: [
      { title: "Research publication style", description: "Understand the magazine’s audience and tone." },
      { title: "Craft a strong angle", description: "Highlight why the story matters now." },
      { title: "Keep the pitch concise", description: "Focus on clarity and originality." }
    ]
  },
  {
    slug: "travel-for-writing-inspiration",
    title: "Travel for Writing Inspiration",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&fit=crop&auto=format",
    type: "Adventurous",
    field: "Writing",
    estimated_time: "A weekend",
    related_types: ["Exploratory", "Outdoorsy", "Reflective", "Goal-oriented"],
    description: pt("Explore a new environment and use the experience as inspiration for creative writing."),
    instructions: [
      { title: "Keep a travel notebook", description: "Record sensory details and observations." },
      { title: "Visit unfamiliar places", description: "Seek experiences outside your routine." },
      { title: "Write reflections each evening", description: "Capture ideas while they feel fresh." }
    ]
  },
  {
    slug: "take-a-beginner-salsa-class",
    title: "Take a Beginner Salsa Class",
    imageUrl: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&fit=crop&auto=format",
    type: "Active",
    field: "Dance",
    estimated_time: "1 hour",
    related_types: ["Physical", "Disciplined", "Goal-oriented", "Competitive", "Skill-based"],
    description: pt("Learn the fundamentals of salsa dancing through beginner-friendly instruction."),
    instructions: [
      { title: "Practice the basic step", description: "Focus on rhythm and timing first." },
      { title: "Relax your movements", description: "Stay loose and responsive while dancing." },
      { title: "Dance with confidence", description: "Focus on enjoying the experience." }
    ]
  },
  {
    slug: "learn-a-tiktok-choreography",
    title: "Learn a TikTok Choreography",
    imageUrl: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&fit=crop&auto=format",
    type: "Performative",
    field: "Dance",
    estimated_time: "1 hour",
    related_types: ["Expressive", "Social", "Creative", "Emotional", "Skill-based"],
    description: pt("Practice and perform a short dance routine inspired by popular TikTok choreography trends."),
    instructions: [
      { title: "Break the routine into sections", description: "Learn a few moves at a time instead of the entire dance at once." },
      { title: "Practice with music slowly", description: "Focus on timing and accuracy before speeding up." },
      { title: "Record yourself dancing", description: "Watch playback to improve confidence and movement quality." }
    ]
  },
  {
    slug: "attend-a-friday-night-dance-social",
    title: "Attend a Friday Night Dance Social",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Dance",
    estimated_time: "An afternoon",
    related_types: ["Collaborative", "Community-oriented", "Expressive", "Leadership", "Active"],
    description: pt("Meet new people and enjoy a lively evening of music, dancing, and social connection."),
    instructions: [
      { title: "Dress comfortably", description: "Wear clothing and shoes suitable for movement." },
      { title: "Be open to dancing with others", description: "Focus on enjoying the social atmosphere." },
      { title: "Try different dance styles", description: "Experiment and learn from other dancers." }
    ]
  },
  {
    slug: "choreograph-a-30-second-routine",
    title: "Choreograph a 30-Second Routine",
    imageUrl: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&fit=crop&auto=format",
    type: "Artistic",
    field: "Dance",
    estimated_time: "A few hours",
    related_types: ["Creative", "Expressive", "Emotional", "Reflective"],
    description: pt("Create a short original dance routine that communicates mood, rhythm, or personality."),
    instructions: [
      { title: "Choose a short music clip", description: "Pick something with a strong rhythm or emotion." },
      { title: "Build around one core movement", description: "Repeat and vary key motions for cohesion." },
      { title: "Practice transitions smoothly", description: "Focus on flow between movements." }
    ]
  },
  {
    slug: "study-the-history-of-modern-dance",
    title: "Study the History of Modern Dance",
    imageUrl: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&fit=crop&auto=format",
    type: "Intellectual",
    field: "Dance",
    estimated_time: "A week",
    related_types: ["Analytical", "Educational", "Reflective", "Strategic"],
    description: pt("Explore influential choreographers, performances, and movements that shaped modern dance."),
    instructions: [
      { title: "Research major pioneers", description: "Learn about dancers and choreographers who transformed the art form." },
      { title: "Watch recorded performances", description: "Observe how movement styles evolved over time." },
      { title: "Take notes on recurring themes", description: "Identify ideas and techniques shared across works." }
    ]
  },
  {
    slug: "ride-a-new-20-mile-loop",
    title: "Ride a New 20-Mile Loop",
    imageUrl: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&fit=crop&auto=format",
    type: "Adventurous",
    field: "Cycling",
    estimated_time: "An afternoon",
    related_types: ["Exploratory", "Outdoorsy", "Reflective", "Goal-oriented", "Physical"],
    description: pt("Challenge yourself with a fresh cycling route that combines endurance and exploration."),
    instructions: [
      { title: "Plan the route ahead", description: "Check elevation, traffic, and road conditions." },
      { title: "Bring water and repair tools", description: "Prepare for longer distances safely." },
      { title: "Pace yourself consistently", description: "Maintain energy throughout the ride." }
    ]
  },
  {
    slug: "build-up-a-used-bike-frame",
    title: "Build Up a Used Bike Frame",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "Cycling",
    estimated_time: "A weekend",
    related_types: ["Skill-based", "Strategic", "Disciplined", "Creative"],
    description: pt("Restore and customize a used bicycle frame into a fully functioning bike."),
    instructions: [
      { title: "Inspect the frame carefully", description: "Check for cracks, rust, or damage before starting." },
      { title: "Choose compatible components", description: "Match wheels, drivetrain, and brakes properly." },
      { title: "Tune the bike thoroughly", description: "Adjust shifting and braking before riding." }
    ]
  },
  {
    slug: "join-a-sunday-group-ride",
    title: "Join a Sunday Group Ride",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Cycling",
    estimated_time: "An afternoon",
    related_types: ["Collaborative", "Community-oriented", "Expressive", "Leadership", "Outdoorsy"],
    description: pt("Ride with a cycling group and enjoy community, endurance, and shared motivation."),
    instructions: [
      { title: "Learn group riding etiquette", description: "Understand signaling and safe spacing." },
      { title: "Bring basic ride supplies", description: "Carry water, snacks, and a spare tube." },
      { title: "Ride at a comfortable pace", description: "Focus on consistency rather than speed." }
    ]
  },
  {
    slug: "race-your-first-local-crit",
    title: "Race Your First Local Crit",
    imageUrl: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&fit=crop&auto=format",
    type: "Active",
    field: "Cycling",
    estimated_time: "1 hour",
    related_types: ["Physical", "Disciplined", "Goal-oriented", "Competitive"],
    description: pt("Experience the intensity and excitement of your first local criterium cycling race."),
    instructions: [
      { title: "Practice cornering skills", description: "Smooth turns are essential in crit racing." },
      { title: "Warm up before the race", description: "Prepare your legs and breathing properly." },
      { title: "Stay alert in the pack", description: "Focus on positioning and awareness." }
    ]
  },
  {
    slug: "cycle-through-a-national-park",
    title: "Cycle Through a National Park",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&fit=crop&auto=format",
    type: "Outdoorsy",
    field: "Cycling",
    estimated_time: "A weekend",
    related_types: ["Adventurous", "Reflective", "Mindful", "Exploratory", "Physical"],
    description: pt("Explore scenic landscapes and natural beauty during a cycling adventure through a national park."),
    instructions: [
      { title: "Research park regulations", description: "Check cycling access and trail rules." },
      { title: "Pack for changing weather", description: "Bring layers, food, and navigation tools." },
      { title: "Take breaks to enjoy the scenery", description: "Balance exercise with exploration." }
    ]
  },
  {
    slug: "hike-a-sunrise-summit",
    title: "Hike a Sunrise Summit",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&fit=crop&auto=format",
    type: "Adventurous",
    field: "Hiking",
    estimated_time: "An afternoon",
    related_types: ["Exploratory", "Outdoorsy", "Reflective", "Goal-oriented", "Physical"],
    description: pt("Reach a mountain summit before sunrise and experience breathtaking early morning views."),
    instructions: [
      { title: "Start hiking before dawn", description: "Allow enough time to reach the summit safely." },
      { title: "Bring a flashlight or headlamp", description: "Prepare for low-light conditions." },
      { title: "Dress for cold temperatures", description: "Early mornings can be much colder at elevation." }
    ]
  },
  {
    slug: "plan-a-three-day-backpacking-trip",
    title: "Plan a Three-Day Backpacking Trip",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&fit=crop&auto=format",
    type: "Outdoorsy",
    field: "Hiking",
    estimated_time: "A weekend",
    related_types: ["Adventurous", "Reflective", "Mindful", "Exploratory", "Strategic"],
    description: pt("Organize a multi-day backpacking adventure focused on preparation, endurance, and exploration."),
    instructions: [
      { title: "Plan campsites and routes", description: "Map daily distances and water sources carefully." },
      { title: "Pack lightweight essentials", description: "Prioritize efficiency and comfort." },
      { title: "Test your gear beforehand", description: "Avoid surprises during the trip." }
    ]
  },
  {
    slug: "lead-a-friend-on-their-first-hike",
    title: "Lead a Friend on Their First Hike",
    imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Hiking",
    estimated_time: "An afternoon",
    related_types: ["Collaborative", "Community-oriented", "Expressive", "Leadership", "Outdoorsy"],
    description: pt("Introduce someone new to hiking through a supportive and enjoyable outdoor experience."),
    instructions: [
      { title: "Choose a beginner-friendly trail", description: "Keep the route manageable and scenic." },
      { title: "Set a comfortable pace", description: "Focus on enjoyment rather than speed." },
      { title: "Encourage breaks and conversation", description: "Make the hike feel welcoming and relaxed." }
    ]
  },
  {
    slug: "photograph-a-trail-in-a-series",
    title: "Photograph a Trail in a Series",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&fit=crop&auto=format",
    type: "Artistic",
    field: "Hiking",
    estimated_time: "An afternoon",
    related_types: ["Creative", "Expressive", "Emotional", "Reflective", "Outdoorsy"],
    description: pt("Document a hiking trail through a connected series of photographs that tell a visual story."),
    instructions: [
      { title: "Choose a visual theme", description: "Focus on textures, colors, or changing landscapes." },
      { title: "Capture wide and close shots", description: "Create variety within the series." },
      { title: "Edit photos consistently", description: "Maintain a cohesive mood and style." }
    ]
  },
  {
    slug: "journal-at-a-mountain-overlook",
    title: "Journal at a Mountain Overlook",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&fit=crop&auto=format",
    type: "Reflective",
    field: "Hiking",
    estimated_time: "1 hour",
    related_types: ["Mindful", "Emotional", "Intellectual", "Expressive", "Outdoorsy"],
    description: pt("Spend quiet time journaling at a scenic overlook while reflecting on your thoughts and surroundings."),
    instructions: [
      { title: "Find a peaceful viewpoint", description: "Choose a location where you can sit comfortably and focus." },
      { title: "Write without rushing", description: "Capture thoughts, observations, and emotions naturally." },
      { title: "Disconnect from distractions", description: "Stay present and enjoy the environment fully." }
    ]
  },
  {
    slug: "plan-a-weekend-solo-trip",
    title: "Plan a Weekend Solo Trip",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&fit=crop&auto=format",
    type: "Adventurous",
    field: "Travel",
    estimated_time: "A weekend",
    related_types: ["Exploratory", "Outdoorsy", "Reflective", "Goal-oriented"],
    description: pt("Organize a short solo getaway focused on independence, exploration, and personal growth."),
    instructions: [
      { title: "Choose a manageable destination", description: "Pick somewhere safe and easy to navigate." },
      { title: "Create a flexible itinerary", description: "Leave room for spontaneity and rest." },
      { title: "Pack light and efficiently", description: "Bring only what you truly need." }
    ]
  },
  {
    slug: "build-a-travel-photo-book",
    title: "Build a Travel Photo Book",
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&fit=crop&auto=format",
    type: "Creative",
    field: "Travel",
    estimated_time: "A weekend",
    related_types: ["Artistic", "Expressive", "Reflective", "Experimental"],
    description: pt("Turn your favorite travel memories into a visually cohesive photo book."),
    instructions: [
      { title: "Select your best images", description: "Choose photos that tell a story together." },
      { title: "Organize photos chronologically", description: "Create a natural sense of progression." },
      { title: "Add captions or notes", description: "Include reflections and memorable details." }
    ]
  },
  {
    slug: "learn-50-words-in-a-new-language",
    title: "Learn 50 Words in a New Language",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&fit=crop&auto=format",
    type: "Intellectual",
    field: "Travel",
    estimated_time: "A week",
    related_types: ["Analytical", "Educational", "Reflective", "Strategic", "Disciplined"],
    description: pt("Build confidence in a new language by learning and practicing 50 essential words."),
    instructions: [
      { title: "Focus on useful vocabulary", description: "Learn greetings, numbers, and travel phrases first." },
      { title: "Practice pronunciation daily", description: "Repeat words aloud consistently." },
      { title: "Review words regularly", description: "Use flashcards or spaced repetition methods." }
    ]
  },
  {
    slug: "host-a-couchsurfer-for-a-weekend",
    title: "Host a Couchsurfer for a Weekend",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Travel",
    estimated_time: "A weekend",
    related_types: ["Collaborative", "Community-oriented", "Expressive", "Leadership", "Exploratory"],
    description: pt("Welcome a traveler into your home and exchange stories, culture, and experiences."),
    instructions: [
      { title: "Communicate expectations clearly", description: "Discuss schedules, boundaries, and accommodations." },
      { title: "Recommend local experiences", description: "Share favorite places and activities nearby." },
      { title: "Be open to cultural exchange", description: "Learn from each other’s backgrounds and perspectives." }
    ]
  },
  {
    slug: "apply-to-be-a-travel-writer",
    title: "Apply to Be a Travel Writer",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&fit=crop&auto=format",
    type: "Professional",
    field: "Travel",
    estimated_time: "A week",
    related_types: ["Goal-oriented", "Strategic", "Disciplined", "Leadership", "Creative"],
    description: pt("Pursue opportunities to write professionally about travel experiences and destinations."),
    instructions: [
      { title: "Build a small writing portfolio", description: "Collect sample articles or blog posts." },
      { title: "Research travel publications", description: "Look for outlets that match your writing style." },
      { title: "Pitch unique story ideas", description: "Focus on fresh angles and personal insights." }
    ]
  },
  {
    slug: "build-a-morning-routine",
    title: "Build a Morning Routine",
    imageUrl: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "Wellness",
    estimated_time: "A month",
    related_types: ["Skill-based", "Strategic", "Disciplined", "Creative", "Mindful"],
    description: pt("Create a consistent morning routine that improves focus, energy, and overall wellbeing."),
    instructions: [
      { title: "Start with a few simple habits", description: "Avoid overcomplicating your routine initially." },
      { title: "Wake up at a consistent time", description: "Build stability through repetition." },
      { title: "Adjust the routine gradually", description: "Refine habits based on what feels sustainable." }
    ]
  },
  {
    slug: "take-a-yin-yoga-class",
    title: "Take a Yin Yoga Class",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&fit=crop&auto=format",
    type: "Active",
    field: "Wellness",
    estimated_time: "1 hour",
    related_types: ["Physical", "Disciplined", "Goal-oriented", "Competitive", "Mindful"],
    description: pt("Slow down and improve flexibility through a calming Yin Yoga practice."),
    instructions: [
      { title: "Focus on deep breathing", description: "Use slow breaths to relax into poses." },
      { title: "Hold stretches patiently", description: "Allow the body to release tension gradually." },
      { title: "Avoid forcing movements", description: "Stay within a comfortable range of motion." }
    ]
  },
  {
    slug: "track-your-sleep-for-two-weeks",
    title: "Track Your Sleep for Two Weeks",
    imageUrl: "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=800&fit=crop&auto=format",
    type: "Intellectual",
    field: "Wellness",
    estimated_time: "A week",
    related_types: ["Analytical", "Educational", "Reflective", "Strategic", "Disciplined"],
    description: pt("Monitor sleep habits and patterns to better understand your rest and recovery."),
    instructions: [
      { title: "Record sleep and wake times", description: "Track consistency throughout the two weeks." },
      { title: "Note energy levels daily", description: "Observe how sleep affects mood and productivity." },
      { title: "Identify recurring habits", description: "Look for behaviors that impact sleep quality." }
    ]
  },
  {
    slug: "become-a-certified-yoga-teacher",
    title: "Become a Certified Yoga Teacher",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&fit=crop&auto=format",
    type: "Professional",
    field: "Wellness",
    estimated_time: "A month",
    related_types: ["Goal-oriented", "Strategic", "Disciplined", "Leadership", "Educational"],
    description: pt("Train toward becoming a certified yoga instructor while deepening your practice and teaching ability."),
    instructions: [
      { title: "Research certification programs", description: "Compare teaching styles and requirements." },
      { title: "Practice consistently", description: "Develop confidence in both movement and instruction." },
      { title: "Study anatomy and philosophy", description: "Build a deeper understanding of yoga principles." }
    ]
  },
  {
    slug: "build-a-backyard-telescope-mount",
    title: "Build a Backyard Telescope Mount",
    imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "Astronomy",
    estimated_time: "A weekend",
    related_types: ["Skill-based", "Strategic", "Disciplined", "Creative", "Experimental"],
    description: pt("Construct a stable telescope mount for backyard astronomy and night sky observation."),
    instructions: [
      { title: "Choose sturdy materials", description: "Stability is essential for clear viewing." },
      { title: "Balance the telescope properly", description: "Reduce shaking and improve tracking." },
      { title: "Test movement and alignment", description: "Adjust positioning for smoother observation." }
    ]
  },
  {
    slug: "reflect-on-the-cosmos-under-the-night-sky",
    title: "Reflect on the Cosmos Under the Night Sky",
    imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&fit=crop&auto=format",
    type: "Reflective",
    field: "Astronomy",
    estimated_time: "1 hour",
    related_types: ["Mindful", "Emotional", "Intellectual", "Expressive", "Outdoorsy"],
    description: pt("Spend quiet time beneath the stars contemplating the scale and beauty of the universe."),
    instructions: [
      { title: "Find a dark viewing location", description: "Reduce light pollution for a clearer experience." },
      { title: "Spend time observing silently", description: "Allow yourself to slow down and reflect." },
      { title: "Write down your thoughts afterward", description: "Capture ideas or emotions inspired by the night sky." }
    ]
  },
  {
    slug: "photograph-the-milky-way",
    title: "Photograph the Milky Way",
    imageUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&fit=crop&auto=format",
    type: "Artistic",
    field: "Astronomy",
    estimated_time: "An afternoon",
    related_types: ["Creative", "Expressive", "Emotional", "Reflective", "Outdoorsy"],
    description: pt("Capture detailed night sky photographs of the Milky Way using long-exposure techniques."),
    instructions: [
      { title: "Find a dark sky location", description: "Avoid city lights for the clearest visibility." },
      { title: "Use a tripod and long exposure", description: "Keep the camera stable for sharp night photos." },
      { title: "Experiment with composition", description: "Include landscapes or silhouettes for atmosphere." }
    ]
  },
  {
    slug: "follow-a-tech-deep-dive-channel-for-a-month",
    title: "Follow a Tech Deep-Dive Channel for a Month",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&fit=crop&auto=format",
    type: "Educational",
    field: "Technology",
    estimated_time: "A month",
    related_types: ["Intellectual", "Reflective", "Disciplined", "Goal-oriented"],
    description: pt("Expand your technical knowledge by consistently watching in-depth technology content for a month."),
    instructions: [
      { title: "Choose a trusted creator", description: "Look for channels with thoughtful analysis and explanations." },
      { title: "Take notes on interesting topics", description: "Record ideas or technologies you want to explore further." },
      { title: "Apply what you learn", description: "Experiment with concepts through small projects or research." }
    ]
  },
  {
    slug: "3d-print-a-custom-phone-stand",
    title: "3D Print a Custom Phone Stand",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "Engineering",
    estimated_time: "A weekend",
    related_types: ["Skill-based", "Strategic", "Disciplined", "Creative"],
    description: pt("Design and print a personalized phone stand using 3D modeling and printing techniques."),
    instructions: [
      { title: "Sketch the design first", description: "Think about viewing angle and stability." },
      { title: "Prepare the print settings", description: "Adjust supports and layer height appropriately." },
      { title: "Test and refine the prototype", description: "Improve comfort and durability after printing." }
    ]
  },
  {
    slug: "build-a-simple-arduino-robot",
    title: "Build a Simple Arduino Robot",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&fit=crop&auto=format",
    type: "Experimental",
    field: "Engineering",
    estimated_time: "A weekend",
    related_types: ["Creative", "Analytical", "Exploratory", "Constructive"],
    description: pt("Assemble a beginner-friendly Arduino robot while learning basic electronics and programming."),
    instructions: [
      { title: "Gather beginner components", description: "Use simple motors, sensors, and an Arduino board." },
      { title: "Follow wiring diagrams carefully", description: "Double-check connections before powering on." },
      { title: "Test movement step by step", description: "Troubleshoot individual functions gradually." }
    ]
  },
  {
    slug: "detail-your-car-to-showroom-standard",
    title: "Detail Your Car to Showroom Standard",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "Cars",
    estimated_time: "An afternoon",
    related_types: ["Skill-based", "Strategic", "Disciplined", "Creative"],
    description: pt("Restore your vehicle’s appearance with a deep clean and professional-level detailing techniques."),
    instructions: [
      { title: "Wash the exterior thoroughly", description: "Remove dirt carefully before polishing." },
      { title: "Clean interior surfaces methodically", description: "Vacuum and wipe all areas in detail." },
      { title: "Apply protective finishing products", description: "Use wax or sealants for a polished look." }
    ]
  },
  {
    slug: "attend-a-weekend-track-day",
    title: "Attend a Weekend Track Day",
    imageUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&fit=crop&auto=format",
    type: "Active",
    field: "Cars",
    estimated_time: "A weekend",
    related_types: ["Physical", "Disciplined", "Goal-oriented", "Competitive", "Adventurous"],
    description: pt("Experience performance driving in a controlled environment during a weekend track event."),
    instructions: [
      { title: "Inspect your vehicle beforehand", description: "Check tires, brakes, and fluid levels." },
      { title: "Attend safety briefings", description: "Understand track rules and driving etiquette." },
      { title: "Focus on smooth driving", description: "Prioritize control over raw speed." }
    ]
  },
  {
    slug: "get-your-motorcycle-license",
    title: "Get Your Motorcycle License",
    imageUrl: "https://images.unsplash.com/photo-1517846693594-1567da72af75?w=800&fit=crop&auto=format",
    type: "Active",
    field: "Motorcycles",
    estimated_time: "A month",
    related_types: ["Physical", "Disciplined", "Goal-oriented", "Competitive", "Skill-based"],
    description: pt("Learn riding fundamentals and prepare for the tests required to earn a motorcycle license."),
    instructions: [
      { title: "Study local road rules", description: "Learn motorcycle-specific safety regulations." },
      { title: "Practice low-speed control", description: "Build confidence through basic maneuvering drills." },
      { title: "Wear proper protective gear", description: "Prioritize safety during all practice sessions." }
    ]
  },
  {
    slug: "plan-a-coastal-motorcycle-road-trip",
    title: "Plan a Coastal Motorcycle Road Trip",
    imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&fit=crop&auto=format",
    type: "Adventurous",
    field: "Motorcycles",
    estimated_time: "A weekend",
    related_types: ["Exploratory", "Outdoorsy", "Reflective", "Goal-oriented"],
    description: pt("Organize a scenic motorcycle journey along coastal roads and destinations."),
    instructions: [
      { title: "Map scenic routes", description: "Look for roads with great views and safe riding conditions." },
      { title: "Pack light but efficiently", description: "Bring weather gear, tools, and essentials." },
      { title: "Plan regular rest stops", description: "Stay alert and avoid fatigue during long rides." }
    ]
  },
  {
    slug: "take-an-intro-flight-lesson",
    title: "Take an Intro Flight Lesson",
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&fit=crop&auto=format",
    type: "Active",
    field: "Aviation",
    estimated_time: "1 hour",
    related_types: ["Physical", "Disciplined", "Goal-oriented", "Competitive", "Skill-based"],
    description: pt("Experience the basics of flying with an introductory aviation lesson."),
    instructions: [
      { title: "Learn basic flight controls", description: "Understand how the aircraft responds to inputs." },
      { title: "Listen carefully to the instructor", description: "Focus on safety and communication." },
      { title: "Enjoy the experience", description: "Take in the perspective and excitement of flying." }
    ]
  },
  {
    slug: "build-a-remote-control-plane",
    title: "Build a Remote-Control Plane",
    imageUrl: "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "Aviation",
    estimated_time: "A weekend",
    related_types: ["Skill-based", "Strategic", "Disciplined", "Creative", "Experimental"],
    description: pt("Assemble and test a remote-control airplane while learning basic aerodynamics and engineering."),
    instructions: [
      { title: "Follow the assembly guide carefully", description: "Pay attention to balance and alignment." },
      { title: "Test electronics before flying", description: "Ensure servos and controls work properly." },
      { title: "Practice in an open area", description: "Choose a safe space for first flights." }
    ]
  },
  {
    slug: "join-a-recreational-soccer-league",
    title: "Join a Recreational Soccer League",
    imageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Sports",
    estimated_time: "Ongoing",
    related_types: ["Collaborative", "Community-oriented", "Expressive", "Leadership", "Active"],
    description: pt("Stay active and meet new people by playing in a recreational soccer league."),
    instructions: [
      { title: "Find a beginner-friendly league", description: "Choose a level that matches your experience." },
      { title: "Practice basic fitness and ball control", description: "Improve confidence before matches." },
      { title: "Focus on teamwork", description: "Communication and cooperation matter more than skill alone." }
    ]
  },
  {
    slug: "attend-a-live-sporting-event",
    title: "Attend a Live Sporting Event",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c643e7485?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Sports",
    estimated_time: "An afternoon",
    related_types: ["Collaborative", "Community-oriented", "Expressive", "Leadership", "Exploratory"],
    description: pt("Experience the atmosphere and excitement of watching sports live in person."),
    instructions: [
      { title: "Arrive early", description: "Take time to enjoy the venue and pre-game energy." },
      { title: "Engage with the crowd", description: "Enjoy the communal experience of live sports." },
      { title: "Capture memorable moments", description: "Take photos while staying present in the event." }
    ]
  },
  {
    slug: "join-a-local-running-club",
    title: "Join a Local Running Club",
    imageUrl: "https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Running",
    estimated_time: "Ongoing",
    related_types: ["Collaborative", "Community-oriented", "Expressive", "Leadership", "Active"],
    description: pt("Build consistency and motivation by running regularly with a local group."),
    instructions: [
      { title: "Find a pace group that suits you", description: "Choose a level that feels comfortable and sustainable." },
      { title: "Show up consistently", description: "Regular participation helps build community." },
      { title: "Support other runners", description: "Encourage and learn from the group." }
    ]
  },
  {
    slug: "try-an-indoor-bouldering-gym",
    title: "Try an Indoor Bouldering Gym",
    imageUrl: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&fit=crop&auto=format",
    type: "Active",
    field: "Climbing",
    estimated_time: "1 hour",
    related_types: ["Physical", "Disciplined", "Goal-oriented", "Competitive", "Skill-based"],
    description: pt("Challenge yourself physically and mentally through beginner-friendly indoor bouldering."),
    instructions: [
      { title: "Warm up properly", description: "Prepare fingers, shoulders, and legs before climbing." },
      { title: "Start with easy routes", description: "Focus on technique before difficulty." },
      { title: "Learn how to fall safely", description: "Practice controlled landings on padded mats." }
    ]
  },
  {
    slug: "take-an-outdoor-rock-climbing-course",
    title: "Take an Outdoor Rock Climbing Course",
    imageUrl: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&fit=crop&auto=format",
    type: "Adventurous",
    field: "Climbing",
    estimated_time: "A weekend",
    related_types: ["Exploratory", "Outdoorsy", "Reflective", "Goal-oriented", "Skill-based"],
    description: pt("Learn the fundamentals of outdoor climbing safety, movement, and rope systems."),
    instructions: [
      { title: "Listen carefully to instructors", description: "Safety knowledge is the foundation of climbing." },
      { title: "Practice basic knot tying", description: "Learn essential climbing knots and checks." },
      { title: "Focus on foot placement", description: "Efficient movement saves energy while climbing." }
    ]
  },
  {
    slug: "host-a-monthly-board-game-night",
    title: "Host a Monthly Board Game Night",
    imageUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Board Games",
    estimated_time: "An afternoon",
    related_types: ["Collaborative", "Community-oriented", "Expressive", "Leadership"],
    description: pt("Bring friends together regularly for strategy, laughter, and social connection through board games."),
    instructions: [
      { title: "Choose accessible games", description: "Pick games that suit the group’s experience level." },
      { title: "Prepare snacks and seating", description: "Create a relaxed and welcoming atmosphere." },
      { title: "Rotate game choices monthly", description: "Keep the experience fresh and engaging." }
    ]
  },
  {
    slug: "solo-through-a-complex-strategy-game",
    title: "Solo Through a Complex Strategy Game",
    imageUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&fit=crop&auto=format",
    type: "Intellectual",
    field: "Board Games",
    estimated_time: "An afternoon",
    related_types: ["Analytical", "Educational", "Reflective", "Strategic"],
    description: pt("Challenge yourself mentally by learning and mastering a deep solo strategy game."),
    instructions: [
      { title: "Read the rules carefully", description: "Understanding systems is essential before playing." },
      { title: "Take your time planning turns", description: "Think through long-term consequences." },
      { title: "Reflect on mistakes afterward", description: "Learn from failed strategies and experiments." }
    ]
  },
  {
    slug: "visit-five-local-independent-cafes",
    title: "Visit Five Local Independent Cafes",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&fit=crop&auto=format",
    type: "Exploratory",
    field: "Coffee",
    estimated_time: "A month",
    related_types: ["Adventurous", "Experimental", "Reflective", "Creative", "Social"],
    description: pt("Explore local coffee culture by visiting independently owned cafes around your area."),
    instructions: [
      { title: "Try a different drink each visit", description: "Expand your coffee preferences gradually." },
      { title: "Observe each cafe’s atmosphere", description: "Notice design, music, and customer experience." },
      { title: "Support local businesses", description: "Learn the stories behind the cafes you visit." }
    ]
  },
  {
    slug: "curate-a-capsule-wardrobe",
    title: "Curate a Capsule Wardrobe",
    imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&fit=crop&auto=format",
    type: "Creative",
    field: "Fashion",
    estimated_time: "An afternoon",
    related_types: ["Artistic", "Expressive", "Reflective", "Experimental", "Strategic"],
    description: pt("Simplify your clothing choices by building a versatile and intentional wardrobe."),
    instructions: [
      { title: "Choose a consistent color palette", description: "Focus on pieces that combine easily together." },
      { title: "Keep only versatile clothing", description: "Prioritize items you wear regularly." },
      { title: "Build around your lifestyle", description: "Make practicality the main focus." }
    ]
  },
  {
    slug: "thrift-a-full-outfit-under-20",
    title: "Thrift a Full Outfit Under $20",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&fit=crop&auto=format",
    type: "Adventurous",
    field: "Fashion",
    estimated_time: "An afternoon",
    related_types: ["Exploratory", "Outdoorsy", "Reflective", "Goal-oriented", "Creative"],
    description: pt("Challenge yourself to create a stylish thrifted outfit on a small budget."),
    instructions: [
      { title: "Browse patiently", description: "Finding great pieces takes time and experimentation." },
      { title: "Look for quality fabrics", description: "Focus on durability and fit over branding." },
      { title: "Mix unexpected combinations", description: "Use creativity to build a unique outfit." }
    ]
  },
  {
    slug: "car-camp-at-a-state-park",
    title: "Car Camp at a State Park",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&fit=crop&auto=format",
    type: "Outdoorsy",
    field: "Camping",
    estimated_time: "A weekend",
    related_types: ["Adventurous", "Reflective", "Mindful", "Exploratory"],
    description: pt("Enjoy a low-pressure outdoor camping experience using your car as a basecamp."),
    instructions: [
      { title: "Reserve a campsite early", description: "Popular parks can fill up quickly." },
      { title: "Pack comfortable essentials", description: "Bring sleeping gear, food, and lighting." },
      { title: "Spend time outside intentionally", description: "Disconnect from routine and enjoy nature." }
    ]
  },
  {
    slug: "master-three-essential-wilderness-skills",
    title: "Master Three Essential Wilderness Skills",
    imageUrl: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&fit=crop&auto=format",
    type: "Skill-based",
    field: "Camping",
    estimated_time: "A weekend",
    related_types: ["Disciplined", "Constructive", "Goal-oriented", "Creative", "Outdoorsy"],
    description: pt("Develop practical outdoor survival and wilderness skills through focused practice."),
    instructions: [
      { title: "Choose three core skills", description: "Examples include fire starting or navigation." },
      { title: "Practice repeatedly", description: "Consistency matters more than speed." },
      { title: "Test skills outdoors", description: "Apply what you learn in realistic conditions." }
    ]
  },
  {
    slug: "read-thinking-fast-and-slow",
    title: "Read Thinking, Fast and Slow",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&fit=crop&auto=format",
    type: "Intellectual",
    field: "Psychology",
    estimated_time: "A week",
    related_types: ["Analytical", "Educational", "Reflective", "Strategic"],
    description: pt("Explore cognitive biases and decision-making through a foundational psychology book."),
    instructions: [
      { title: "Read actively and slowly", description: "Pause to think about each concept carefully." },
      { title: "Relate ideas to real life", description: "Notice cognitive patterns in everyday situations." },
      { title: "Take notes on key biases", description: "Summarize important psychological concepts." }
    ]
  },
  {
    slug: "try-cognitive-behavioral-journaling",
    title: "Try Cognitive Behavioral Journaling",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&fit=crop&auto=format",
    type: "Reflective",
    field: "Psychology",
    estimated_time: "A month",
    related_types: ["Mindful", "Emotional", "Intellectual", "Expressive", "Therapeutic"],
    description: pt("Use structured journaling techniques to better understand thoughts, emotions, and behaviors."),
    instructions: [
      { title: "Write down recurring thoughts", description: "Identify emotional triggers and patterns." },
      { title: "Challenge negative assumptions", description: "Look for alternative interpretations." },
      { title: "Track emotional changes over time", description: "Notice progress and recurring themes." }
    ]
  },
  {
    slug: "work-through-platos-republic",
    title: "Work Through Plato's Republic",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&fit=crop&auto=format",
    type: "Intellectual",
    field: "Philosophy",
    estimated_time: "A week",
    related_types: ["Analytical", "Educational", "Reflective", "Strategic"],
    description: pt("Study Plato’s Republic while exploring justice, politics, and philosophical thought."),
    instructions: [
      { title: "Read one section at a time", description: "Focus on understanding key arguments clearly." },
      { title: "Take notes on philosophical ideas", description: "Reflect on concepts that challenge your thinking." },
      { title: "Discuss ideas with others", description: "Conversation can deepen understanding." }
    ]
  },
  {
    slug: "join-an-online-philosophy-discussion-group",
    title: "Join an Online Philosophy Discussion Group",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Philosophy",
    estimated_time: "Ongoing",
    related_types: ["Collaborative", "Community-oriented", "Expressive", "Leadership", "Intellectual"],
    description: pt("Engage in thoughtful philosophical conversations with people from different perspectives."),
    instructions: [
      { title: "Choose a respectful community", description: "Look for groups focused on constructive discussion." },
      { title: "Share ideas thoughtfully", description: "Support arguments with reasoning and examples." },
      { title: "Stay open to disagreement", description: "Treat debate as an opportunity to learn." }
    ]
  },
  {
    slug: "visit-a-local-historical-museum",
    title: "Visit a Local Historical Museum",
    imageUrl: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&fit=crop&auto=format",
    type: "Educational",
    field: "History",
    estimated_time: "An afternoon",
    related_types: ["Intellectual", "Reflective", "Disciplined", "Goal-oriented", "Exploratory"],
    description: pt("Learn about local history and culture through exhibits, artifacts, and storytelling."),
    instructions: [
      { title: "Take your time with exhibits", description: "Read descriptions and historical context carefully." },
      { title: "Focus on one area of interest", description: "Explore a topic that genuinely captures your attention." },
      { title: "Reflect on historical connections", description: "Think about how the past shapes the present." }
    ]
  },
  {
    slug: "research-your-family-genealogy",
    title: "Research Your Family Genealogy",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&fit=crop&auto=format",
    type: "Intellectual",
    field: "History",
    estimated_time: "A week",
    related_types: ["Analytical", "Educational", "Reflective", "Strategic"],
    description: pt("Trace family roots and historical connections through genealogy research."),
    instructions: [
      { title: "Start with known relatives", description: "Record names, locations, and important dates." },
      { title: "Use online genealogy resources", description: "Search public records and archives." },
      { title: "Document discoveries carefully", description: "Keep organized notes and family trees." }
    ]
  },
  {
    slug: "start-a-30-day-duolingo-streak",
    title: "Start a 30-Day Duolingo Streak",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&fit=crop&auto=format",
    type: "Disciplined",
    field: "Language",
    estimated_time: "A month",
    related_types: ["Goal-oriented", "Strategic", "Professional", "Skill-based", "Educational"],
    description: pt("Build consistency in language learning through a daily 30-day Duolingo streak."),
    instructions: [
      { title: "Set a realistic daily goal", description: "Choose a pace you can maintain consistently." },
      { title: "Practice at the same time daily", description: "Build the habit through routine." },
      { title: "Review mistakes regularly", description: "Focus on improving weak areas over time." }
    ]
  },
  {
    slug: "find-a-language-exchange-partner",
    title: "Find a Language Exchange Partner",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Language",
    estimated_time: "Ongoing",
    related_types: ["Collaborative", "Community-oriented", "Expressive", "Leadership", "Educational"],
    description: pt("Practice speaking with a language exchange partner while helping each other improve."),
    instructions: [
      { title: "Choose a reliable platform", description: "Use language exchange communities or apps." },
      { title: "Set clear expectations", description: "Agree on schedules and conversation goals." },
      { title: "Practice both languages fairly", description: "Balance speaking and listening time equally." }
    ]
  },
  {
    slug: "write-a-one-page-business-plan",
    title: "Write a One-Page Business Plan",
    imageUrl: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800&fit=crop&auto=format",
    type: "Professional",
    field: "Business",
    estimated_time: "A few hours",
    related_types: ["Goal-oriented", "Strategic", "Disciplined", "Leadership"],
    description: pt("Outline a concise business concept including goals, audience, and strategy on a single page."),
    instructions: [
      { title: "Define the core idea", description: "Clarify the product, service, or problem being solved." },
      { title: "Identify your audience", description: "Describe who the business is intended for." },
      { title: "Keep the plan concise", description: "Focus on clarity and actionable points." }
    ]
  },
  {
    slug: "attend-a-local-entrepreneur-meetup",
    title: "Attend a Local Entrepreneur Meetup",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Business",
    estimated_time: "1 hour",
    related_types: ["Collaborative", "Community-oriented", "Expressive", "Leadership", "Professional"],
    description: pt("Meet entrepreneurs, exchange ideas, and learn from people building businesses locally."),
    instructions: [
      { title: "Introduce yourself confidently", description: "Prepare a short explanation of your interests or projects." },
      { title: "Ask thoughtful questions", description: "Show curiosity about other people’s experiences." },
      { title: "Follow up afterward", description: "Maintain useful connections after the meetup." }
    ]
  },
  {
    slug: "build-a-personal-budget-spreadsheet",
    title: "Build a Personal Budget Spreadsheet",
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&fit=crop&auto=format",
    type: "Analytical",
    field: "Finance",
    estimated_time: "A few hours",
    related_types: ["Intellectual", "Strategic", "Disciplined", "Reflective"],
    description: pt("Create a budgeting spreadsheet to better track spending, savings, and financial goals."),
    instructions: [
      { title: "List all income and expenses", description: "Start with an accurate overview of your finances." },
      { title: "Categorize spending clearly", description: "Separate essentials, savings, and discretionary costs." },
      { title: "Review the budget regularly", description: "Adjust categories as your habits change." }
    ]
  },
  {
    slug: "read-the-psychology-of-money",
    title: "Read The Psychology of Money",
    imageUrl: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800&fit=crop&auto=format",
    type: "Intellectual",
    field: "Finance",
    estimated_time: "A week",
    related_types: ["Analytical", "Educational", "Reflective", "Strategic"],
    description: pt("Explore how behavior and mindset influence financial decisions and long-term wealth."),
    instructions: [
      { title: "Read with reflection", description: "Think about how the ideas apply to your own habits." },
      { title: "Take notes on key lessons", description: "Record insights about risk, saving, and decision-making." },
      { title: "Discuss ideas with others", description: "Compare different financial perspectives and experiences." }
    ]
  },
  {
    slug: "volunteer-to-lead-a-community-project",
    title: "Volunteer to Lead a Community Project",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&fit=crop&auto=format",
    type: "Leadership",
    field: "Leadership",
    estimated_time: "A month",
    related_types: ["Social", "Strategic", "Professional", "Collaborative", "Community-oriented"],
    description: pt("Develop leadership skills by organizing and guiding a meaningful community initiative."),
    instructions: [
      { title: "Choose a realistic project", description: "Focus on a goal that benefits the local community." },
      { title: "Delegate responsibilities clearly", description: "Work collaboratively instead of doing everything alone." },
      { title: "Communicate consistently", description: "Keep volunteers informed and motivated." }
    ]
  },
  {
    slug: "read-extreme-ownership",
    title: "Read Extreme Ownership",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&fit=crop&auto=format",
    type: "Intellectual",
    field: "Leadership",
    estimated_time: "A week",
    related_types: ["Analytical", "Educational", "Reflective", "Strategic", "Professional"],
    description: pt("Study leadership principles focused on accountability, discipline, and decision-making."),
    instructions: [
      { title: "Take notes on key principles", description: "Identify lessons that apply to your own leadership style." },
      { title: "Reflect on personal responsibility", description: "Think about areas where you can improve accountability." },
      { title: "Apply ideas in real situations", description: "Practice leadership through small everyday actions." }
    ]
  },
  {
    slug: "complete-a-10-day-vipassana-course",
    title: "Complete a 10-Day Vipassana Course",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&fit=crop&auto=format",
    type: "Reflective",
    field: "Meditation",
    estimated_time: "A week",
    related_types: ["Mindful", "Emotional", "Intellectual", "Expressive", "Disciplined"],
    description: pt("Immerse yourself in a silent meditation retreat focused on mindfulness and self-awareness."),
    instructions: [
      { title: "Prepare mentally beforehand", description: "Understand the structure and expectations of the retreat." },
      { title: "Commit fully to the process", description: "Approach the experience with patience and openness." },
      { title: "Reflect after completing the course", description: "Consider how the retreat affected your mindset." }
    ]
  },
  {
    slug: "set-up-a-daily-5-minute-breath-practice",
    title: "Set Up a Daily 5-Minute Breath Practice",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&fit=crop&auto=format",
    type: "Mindful",
    field: "Meditation",
    estimated_time: "A month",
    related_types: ["Reflective", "Therapeutic", "Emotional", "Disciplined"],
    description: pt("Build calmness and awareness through a simple daily breathing practice."),
    instructions: [
      { title: "Choose a quiet environment", description: "Reduce distractions during the practice." },
      { title: "Focus on slow breathing", description: "Use steady inhales and exhales to relax." },
      { title: "Practice consistently each day", description: "Small habits become more effective over time." }
    ]
  },
  {
    slug: "enroll-in-a-free-online-course",
    title: "Enroll in a Free Online Course",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&fit=crop&auto=format",
    type: "Educational",
    field: "Education",
    estimated_time: "A month",
    related_types: ["Intellectual", "Reflective", "Disciplined", "Goal-oriented"],
    description: pt("Expand your knowledge and skills by completing a free online course in a topic that interests you."),
    instructions: [
      { title: "Choose a topic intentionally", description: "Pick something genuinely useful or exciting to you." },
      { title: "Schedule regular study sessions", description: "Treat the course like a real commitment." },
      { title: "Apply what you learn", description: "Practice concepts through exercises or projects." }
    ]
  },
  {
    slug: "teach-a-skill-to-someone-you-know",
    title: "Teach a Skill to Someone You Know",
    imageUrl: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Education",
    estimated_time: "A few hours",
    related_types: ["Collaborative", "Community-oriented", "Expressive", "Leadership", "Educational"],
    description: pt("Share your knowledge by teaching someone a practical or creative skill you enjoy."),
    instructions: [
      { title: "Break the skill into steps", description: "Teach concepts in a simple and approachable way." },
      { title: "Encourage hands-on practice", description: "Learning improves through doing rather than observing." },
      { title: "Be patient and supportive", description: "Focus on building confidence while teaching." }
    ]
  },
  {
    slug: "attend-a-neighborhood-association-meeting",
    title: "Attend a Neighborhood Association Meeting",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&fit=crop&auto=format",
    type: "Community-oriented",
    field: "Community",
    estimated_time: "1 hour",
    related_types: ["Social", "Collaborative", "Leadership", "Therapeutic"],
    description: pt("Get involved in local issues and meet neighbors by attending a community association meeting."),
    instructions: [
      { title: "Listen to current concerns", description: "Learn about topics affecting the neighborhood." },
      { title: "Introduce yourself respectfully", description: "Build connections within the community." },
      { title: "Volunteer for small tasks", description: "Participate actively where you can help." }
    ]
  },
  {
    slug: "organize-a-block-party",
    title: "Organize a Block Party",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&fit=crop&auto=format",
    type: "Social",
    field: "Community",
    estimated_time: "A weekend",
    related_types: ["Collaborative", "Community-oriented", "Expressive", "Leadership"],
    description: pt("Bring neighbors together through a fun and welcoming community block party."),
    instructions: [
      { title: "Coordinate permits and logistics", description: "Check local requirements for public gatherings." },
      { title: "Plan food and activities", description: "Create a relaxed environment for all ages." },
      { title: "Encourage community involvement", description: "Invite neighbors to contribute ideas or supplies." }
    ]
  },
  {
    slug: "sign-up-with-a-local-food-bank",
    title: "Sign Up With a Local Food Bank",
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&fit=crop&auto=format",
    type: "Community-oriented",
    field: "Volunteering",
    estimated_time: "Ongoing",
    related_types: ["Social", "Collaborative", "Leadership", "Therapeutic"],
    description: pt("Support your community by volunteering with a local food bank and helping distribute essential supplies."),
    instructions: [
      { title: "Research nearby organizations", description: "Look for food banks that match your availability and interests." },
      { title: "Attend orientation if required", description: "Learn safety procedures and volunteer expectations." },
      { title: "Commit to regular participation", description: "Consistency helps organizations plan effectively." }
    ]
  },
  {
    slug: "mentor-a-high-school-student",
    title: "Mentor a High School Student",
    imageUrl: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&fit=crop&auto=format",
    type: "Educational",
    field: "Volunteering",
    estimated_time: "Ongoing",
    related_types: ["Intellectual", "Reflective", "Disciplined", "Goal-oriented", "Leadership"],
    description: pt("Support and encourage a student through mentorship, guidance, and positive conversation."),
    instructions: [
      { title: "Build trust gradually", description: "Focus on listening and consistency over giving advice immediately." },
      { title: "Encourage realistic goals", description: "Help the student break larger ambitions into smaller steps." },
      { title: "Celebrate progress", description: "Recognize achievements and growth over time." }
    ]
  },
  {
    slug: "build-a-wooden-bookshelf-from-scratch",
    title: "Build a Wooden Bookshelf From Scratch",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "DIY",
    estimated_time: "A weekend",
    related_types: ["Skill-based", "Strategic", "Disciplined", "Creative"],
    description: pt("Create a custom wooden bookshelf while learning practical woodworking skills."),
    instructions: [
      { title: "Measure your space carefully", description: "Plan dimensions before cutting materials." },
      { title: "Use sturdy wood and supports", description: "Prioritize stability and durability." },
      { title: "Sand and finish the surface", description: "Smooth edges and apply protective coating." }
    ]
  },
  {
    slug: "rewire-a-vintage-lamp",
    title: "Rewire a Vintage Lamp",
    imageUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&fit=crop&auto=format",
    type: "Constructive",
    field: "DIY",
    estimated_time: "An afternoon",
    related_types: ["Skill-based", "Strategic", "Disciplined", "Creative", "Experimental"],
    description: pt("Restore a vintage lamp by replacing outdated wiring and improving functionality safely."),
    instructions: [
      { title: "Inspect the lamp carefully", description: "Check for damaged components before starting." },
      { title: "Use proper electrical tools", description: "Follow safety precautions throughout the process." },
      { title: "Test the lamp safely", description: "Confirm all connections work correctly before regular use." }
    ]
  },
  {
    slug: "redesign-a-room-with-no-new-purchases",
    title: "Redesign a Room With No New Purchases",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&fit=crop&auto=format",
    type: "Creative",
    field: "Home Design",
    estimated_time: "An afternoon",
    related_types: ["Artistic", "Expressive", "Reflective", "Experimental", "Constructive"],
    description: pt("Refresh a room creatively by rearranging and repurposing items you already own."),
    instructions: [
      { title: "Remove unnecessary clutter", description: "Simplify the room before redesigning." },
      { title: "Experiment with furniture layout", description: "Try multiple arrangements to improve flow." },
      { title: "Repurpose decorative items", description: "Use existing objects in new creative ways." }
    ]
  },
  {
    slug: "learn-the-basics-of-interior-design",
    title: "Learn the Basics of Interior Design",
    imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&fit=crop&auto=format",
    type: "Educational",
    field: "Home Design",
    estimated_time: "A week",
    related_types: ["Intellectual", "Reflective", "Disciplined", "Goal-oriented", "Creative"],
    description: pt("Study foundational interior design concepts including layout, lighting, and visual balance."),
    instructions: [
      { title: "Research design principles", description: "Learn about color, spacing, and composition." },
      { title: "Analyze inspiring spaces", description: "Observe what makes certain rooms feel cohesive." },
      { title: "Apply ideas to your own space", description: "Experiment with small design improvements." }
    ]
  },
  {
    slug: "start-a-vinyl-record-collection",
    title: "Start a Vinyl Record Collection",
    imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&fit=crop&auto=format",
    type: "Reflective",
    field: "Collecting",
    estimated_time: "Ongoing",
    related_types: ["Mindful", "Emotional", "Intellectual", "Expressive", "Creative"],
    description: pt("Begin collecting vinyl records and explore music through a more intentional listening experience."),
    instructions: [
      { title: "Choose albums you genuinely love", description: "Focus on personal enjoyment rather than rarity." },
      { title: "Learn how to store records properly", description: "Protect vinyl from dust and heat damage." },
      { title: "Explore local record stores", description: "Discover music and build connections with collectors." }
    ]
  },
  {
    slug: "spend-a-month-visiting-antique-markets",
    title: "Spend a Month Visiting Antique Markets",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&fit=crop&auto=format",
    type: "Exploratory",
    field: "Collecting",
    estimated_time: "A month",
    related_types: ["Adventurous", "Experimental", "Reflective", "Creative", "Social"],
    description: pt("Explore antique markets regularly and discover unique objects, history, and craftsmanship."),
    instructions: [
      { title: "Visit different markets regularly", description: "Compare styles, vendors, and item quality." },
      { title: "Talk with collectors and sellers", description: "Learn the stories behind interesting objects." },
      { title: "Document favorite discoveries", description: "Keep photos or notes of memorable finds." }
    ]
  },
]
