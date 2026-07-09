export interface Course {
  id: string;
  category: string;
  title: string;
  description: string;
  detailedDescription: string;
  tools: string[];
  duration: string;
  level: string;
  price: string;
  whatYouWillLearn: string[];
  whoIsThisFor: { title: string; description: string }[];
  curriculum: { module: string; title: string }[];
  skillsYouWillLearn: string[];
  highlights: { title: string; description: string }[];
}

export const courses: Course[] = [
  {
    id: "mern-stack",
    category: "Full Stack Development",
    title: "MERN Stack Development",
    description:
      "Master MongoDB, Express.js, React, and Node.js to build modern web applications",
    detailedDescription:
      "Become a full-stack developer with our comprehensive MERN Stack course. Learn to build scalable, production-ready web applications using MongoDB, Express.js, React, and Node.js. This hands-on program covers everything from frontend development with React to backend APIs with Node.js and database management with MongoDB.",
    tools: ["React", "Node.js", "MongoDB", "Express", "Redux", "Git"],
    duration: "6 months",
    level: "Beginner to Advanced",
    price: "NPR 45,000",
    whatYouWillLearn: [
      "Build responsive user interfaces with React and modern JavaScript",
      "Create RESTful APIs using Node.js and Express.js",
      "Design and manage databases with MongoDB",
      "Implement authentication and authorization systems",
      "Deploy full-stack applications to cloud platforms",
    ],
    whoIsThisFor: [
      {
        title: "Students & Graduates",
        description:
          "Perfect for those looking to start a career in web development with in-demand skills",
      },
      {
        title: "Career Switchers",
        description:
          "Ideal for professionals wanting to transition into tech with a lucrative development role",
      },
      {
        title: "Entrepreneurs",
        description:
          "Build your own web applications and MVPs without relying on external developers",
      },
      {
        title: "Freelancers",
        description:
          "Expand your service offerings with full-stack development capabilities",
      },
    ],
    curriculum: [
      { module: "01", title: "Introduction to Web Development & JavaScript Fundamentals" },
      { module: "02", title: "Advanced JavaScript & ES6+ Features" },
      { module: "03", title: "React Fundamentals & Component Architecture" },
      { module: "04", title: "State Management with Redux & Context API" },
      { module: "05", title: "Node.js & Express.js Backend Development" },
      { module: "06", title: "MongoDB Database Design & Operations" },
      { module: "07", title: "RESTful API Development & Best Practices" },
      { module: "08", title: "Authentication & Authorization (JWT, OAuth)" },
      { module: "09", title: "File Upload & Cloud Storage Integration" },
      { module: "10", title: "Real-time Features with Socket.io" },
      { module: "11", title: "Testing, Debugging & Performance Optimization" },
      { module: "12", title: "Deployment & DevOps Fundamentals" },
      { module: "13", title: "Full-Stack Project Development" },
      { module: "14", title: "Capstone Project & Portfolio Building" },
    ],
    skillsYouWillLearn: [
      "React & Modern Frontend Development",
      "Node.js Backend Development",
      "MongoDB Database Management",
      "RESTful API Design",
      "Authentication Systems",
      "Cloud Deployment",
      "Git Version Control",
      "Agile Development",
      "Problem Solving",
      "Code Review",
      "Testing & Debugging",
      "Performance Optimization",
    ],
    highlights: [
      { title: "Hands-on Projects", description: "Build 5+ real-world projects to showcase in your portfolio" },
      { title: "Industry Practices", description: "Learn professional coding standards and best practices" },
      { title: "Flexible Schedule", description: "Weekend and evening batches available for working professionals" },
      { title: "Beginner Friendly", description: "No prior programming experience required" },
    ],
  },
  {
    id: "python-django",
    category: "Programming",
    title: "Python & Django",
    description: "Learn Python programming and Django framework for web development",
    detailedDescription:
      "Master Python programming and Django web framework to build powerful, scalable web applications. This comprehensive course covers Python fundamentals, Django framework, database management, and deployment strategies used by companies like Instagram and Spotify.",
    tools: ["Python", "Django", "PostgreSQL", "REST API", "Git", "Docker"],
    duration: "5 months",
    level: "Beginner to Advanced",
    price: "NPR 40,000",
    whatYouWillLearn: [
      "Master Python programming from basics to advanced concepts",
      "Build web applications using Django framework",
      "Design database schemas and work with ORMs",
      "Create RESTful APIs with Django REST Framework",
      "Deploy Python applications to production servers",
    ],
    whoIsThisFor: [
      { title: "Aspiring Developers", description: "Start your programming journey with Python, the most beginner-friendly language" },
      { title: "Data Enthusiasts", description: "Perfect foundation for those planning to move into data science or AI" },
      { title: "Web Developers", description: "Add Python and Django to your tech stack for backend development" },
      { title: "Automation Seekers", description: "Learn to automate tasks and build efficient workflows" },
    ],
    curriculum: [
      { module: "01", title: "Python Fundamentals & Syntax" },
      { module: "02", title: "Data Structures & Algorithms in Python" },
      { module: "03", title: "Object-Oriented Programming" },
      { module: "04", title: "File Handling & Exception Management" },
      { module: "05", title: "Introduction to Django Framework" },
      { module: "06", title: "Django Models & Database Design" },
      { module: "07", title: "Django Views & URL Routing" },
      { module: "08", title: "Templates & Frontend Integration" },
      { module: "09", title: "Django Forms & User Input Validation" },
      { module: "10", title: "Django REST Framework & API Development" },
      { module: "11", title: "Authentication & User Management" },
      { module: "12", title: "Testing & Debugging Django Applications" },
      { module: "13", title: "Deployment & Server Configuration" },
      { module: "14", title: "Capstone Project: Full Django Application" },
    ],
    skillsYouWillLearn: [
      "Python Programming", "Django Web Framework", "Database Design", "API Development",
      "ORM & SQL", "Authentication", "Testing & TDD", "Version Control", "Linux Basics",
      "Deployment", "Problem Solving", "Code Optimization",
    ],
    highlights: [
      { title: "Project-Based Learning", description: "Build multiple web applications from scratch" },
      { title: "Industry Expert Mentors", description: "Learn from developers working in top tech companies" },
      { title: "Career Support", description: "Resume building, interview prep, and job referrals" },
      { title: "Lifetime Access", description: "Access to course materials and community forever" },
    ],
  },
  {
    id: "ui-ux-design",
    category: "Design",
    title: "UI/UX Design",
    description: "Create beautiful and user-friendly digital experiences",
    detailedDescription:
      "Become a UI/UX designer and create exceptional digital experiences. Learn user research, wireframing, prototyping, and visual design using industry-standard tools like Figma and Adobe XD. This course prepares you for a career in product design, focusing on user-centered design principles.",
    tools: ["Figma", "Adobe XD", "Photoshop", "Illustrator", "Miro", "InVision"],
    duration: "4 months",
    level: "Beginner Friendly",
    price: "NPR 35,000",
    whatYouWillLearn: [
      "Conduct user research and create user personas",
      "Design wireframes and interactive prototypes",
      "Master visual design principles and color theory",
      "Create design systems and component libraries",
      "Present and communicate design decisions effectively",
    ],
    whoIsThisFor: [
      { title: "Creative Individuals", description: "Perfect for those with an eye for design wanting to enter tech" },
      { title: "Developers", description: "Developers looking to understand design and improve their UI skills" },
      { title: "Product Managers", description: "Enhance your product skills with design thinking and UX knowledge" },
      { title: "Business Owners", description: "Create better digital products for your customers" },
    ],
    curriculum: [
      { module: "01", title: "Introduction to UI/UX Design" },
      { module: "02", title: "Design Thinking & User-Centered Design" },
      { module: "03", title: "User Research Methods & Techniques" },
      { module: "04", title: "Information Architecture & User Flows" },
      { module: "05", title: "Wireframing & Low-Fidelity Prototyping" },
      { module: "06", title: "Visual Design Principles & Color Theory" },
      { module: "07", title: "Typography & Layout Design" },
      { module: "08", title: "Designing for Mobile & Responsive Design" },
      { module: "09", title: "High-Fidelity Prototyping in Figma" },
      { module: "10", title: "Design Systems & Component Libraries" },
      { module: "11", title: "Usability Testing & Iteration" },
      { module: "12", title: "Accessibility & Inclusive Design" },
      { module: "13", title: "Portfolio Development" },
      { module: "14", title: "Capstone: Complete Product Design Project" },
    ],
    skillsYouWillLearn: [
      "User Research", "Wireframing", "Prototyping", "Visual Design", "Figma Mastery",
      "Design Systems", "Usability Testing", "Interaction Design", "Design Thinking",
      "Presentation Skills", "Accessibility", "Portfolio Building",
    ],
    highlights: [
      { title: "Industry Tools", description: "Master Figma, Adobe XD, and other professional design tools" },
      { title: "Real Projects", description: "Work on actual client projects and case studies" },
      { title: "Portfolio Building", description: "Create a professional portfolio to showcase your work" },
      { title: "No Design Background Needed", description: "Start from scratch with beginner-friendly curriculum" },
    ],
  },
  {
    id: "flutter-development",
    category: "Mobile Development",
    title: "Flutter Development",
    description: "Build cross-platform mobile applications with Flutter and Dart",
    detailedDescription:
      "Master Flutter and Dart to build beautiful, high-performance mobile applications for iOS and Android. Learn to create native experiences with a single codebase, integrate APIs, manage state, and publish apps to app stores.",
    tools: ["Flutter", "Dart", "Firebase", "REST API", "Git", "Android Studio"],
    duration: "5 months",
    level: "Beginner to Advanced",
    price: "NPR 42,000",
    whatYouWillLearn: [
      "Master Dart programming language and Flutter framework",
      "Build responsive UIs for iOS and Android with single codebase",
      "Integrate Firebase for backend services and real-time data",
      "Implement state management solutions (Provider, Bloc, Riverpod)",
      "Publish apps to Google Play Store and Apple App Store",
    ],
    whoIsThisFor: [
      { title: "Mobile App Developers", description: "Build iOS and Android apps efficiently with one framework" },
      { title: "Web Developers", description: "Transition to mobile development with familiar concepts" },
      { title: "Startup Founders", description: "Build your app MVP quickly and cost-effectively" },
      { title: "Students", description: "Enter the high-demand mobile development job market" },
    ],
    curriculum: [
      { module: "01", title: "Introduction to Flutter & Dart" },
      { module: "02", title: "Dart Programming Fundamentals" },
      { module: "03", title: "Flutter Widgets & Layouts" },
      { module: "04", title: "Navigation & Routing" },
      { module: "05", title: "State Management Fundamentals" },
      { module: "06", title: "Advanced State Management (Provider, Bloc)" },
      { module: "07", title: "Working with APIs & HTTP Requests" },
      { module: "08", title: "Local Storage & Data Persistence" },
      { module: "09", title: "Firebase Integration & Authentication" },
      { module: "10", title: "Push Notifications & Cloud Messaging" },
      { module: "11", title: "Animations & Custom Widgets" },
      { module: "12", title: "Testing & Debugging Flutter Apps" },
      { module: "13", title: "App Store Deployment & Publishing" },
      { module: "14", title: "Capstone: Complete Mobile App Project" },
    ],
    skillsYouWillLearn: [
      "Flutter Framework", "Dart Programming", "Mobile UI Design", "State Management",
      "Firebase Services", "API Integration", "App Publishing", "Version Control",
      "Debugging", "Performance Optimization", "Cross-platform Development", "Material Design",
    ],
    highlights: [
      { title: "Cross-Platform", description: "Build for iOS and Android with single codebase" },
      { title: "Hot Reload", description: "Fast development with instant UI updates" },
      { title: "App Store Publishing", description: "Learn to publish apps to both app stores" },
      { title: "Real Projects", description: "Build 3+ complete mobile applications" },
    ],
  },
  {
    id: "digital-marketing",
    category: "Marketing",
    title: "Digital Marketing",
    description: "Master SEO, social media marketing, and digital advertising strategies",
    detailedDescription:
      "Become a digital marketing expert with our comprehensive course covering SEO, social media marketing, content marketing, email marketing, and paid advertising. Learn to create data-driven marketing campaigns that drive results for businesses.",
    tools: ["Google Ads", "Facebook Ads", "SEO Tools", "Analytics", "Mailchimp", "Canva"],
    duration: "3 months",
    level: "Beginner Friendly",
    price: "NPR 30,000",
    whatYouWillLearn: [
      "Master SEO techniques to rank websites on Google",
      "Create effective social media marketing campaigns",
      "Run profitable Facebook and Google Ads campaigns",
      "Analyze marketing data and optimize performance",
      "Build comprehensive digital marketing strategies",
    ],
    whoIsThisFor: [
      { title: "Business Owners", description: "Grow your business online and reach more customers" },
      { title: "Marketing Professionals", description: "Upgrade skills with digital marketing expertise" },
      { title: "Freelancers", description: "Offer digital marketing services to clients" },
      { title: "Career Starters", description: "Enter the growing field of digital marketing" },
    ],
    curriculum: [
      { module: "01", title: "Introduction to Digital Marketing" },
      { module: "02", title: "Search Engine Optimization (SEO) Fundamentals" },
      { module: "03", title: "Advanced SEO & Technical SEO" },
      { module: "04", title: "Content Marketing & Copywriting" },
      { module: "05", title: "Social Media Marketing Strategy" },
      { module: "06", title: "Facebook & Instagram Marketing" },
      { module: "07", title: "Google Ads & PPC Campaigns" },
      { module: "08", title: "Facebook Ads & Retargeting" },
      { module: "09", title: "Email Marketing & Automation" },
      { module: "10", title: "Google Analytics & Data Analysis" },
      { module: "11", title: "Conversion Rate Optimization" },
      { module: "12", title: "Marketing Strategy & Planning" },
    ],
    skillsYouWillLearn: [
      "SEO & SEM", "Social Media Marketing", "Google Ads", "Facebook Ads",
      "Content Marketing", "Email Marketing", "Analytics", "Copywriting",
      "Campaign Management", "ROI Optimization", "Marketing Strategy", "Brand Building",
    ],
    highlights: [
      { title: "Practical Training", description: "Run real ad campaigns with hands-on practice" },
      { title: "Industry Certifications", description: "Prepare for Google and Facebook certifications" },
      { title: "Job Ready", description: "Build portfolio of campaigns and case studies" },
      { title: "Fast Track", description: "Complete course in just 3 months" },
    ],
  },
  {
    id: "data-science-ai",
    category: "Data Science",
    title: "Data Science & AI",
    description: "Learn data analysis, machine learning, and artificial intelligence",
    detailedDescription:
      "Dive into the world of Data Science and Artificial Intelligence. Learn Python programming, data analysis, machine learning algorithms, and deep learning. Work with real datasets and build AI models that solve real-world problems.",
    tools: ["Python", "TensorFlow", "Pandas", "NumPy", "Scikit-learn", "Jupyter"],
    duration: "6 months",
    level: "Intermediate",
    price: "NPR 50,000",
    whatYouWillLearn: [
      "Master Python for data science and machine learning",
      "Analyze and visualize data using pandas and matplotlib",
      "Build machine learning models for prediction and classification",
      "Implement deep learning with TensorFlow and Keras",
      "Deploy AI models to production environments",
    ],
    whoIsThisFor: [
      { title: "Tech Professionals", description: "Developers wanting to specialize in AI and ML" },
      { title: "Data Analysts", description: "Upgrade from basic analytics to advanced ML" },
      { title: "Researchers", description: "Apply AI techniques to research problems" },
      { title: "Engineers", description: "Add AI capabilities to engineering solutions" },
    ],
    curriculum: [
      { module: "01", title: "Python for Data Science" },
      { module: "02", title: "Statistics & Probability Fundamentals" },
      { module: "03", title: "Data Analysis with Pandas & NumPy" },
      { module: "04", title: "Data Visualization with Matplotlib & Seaborn" },
      { module: "05", title: "Introduction to Machine Learning" },
      { module: "06", title: "Supervised Learning Algorithms" },
      { module: "07", title: "Unsupervised Learning & Clustering" },
      { module: "08", title: "Model Evaluation & Optimization" },
      { module: "09", title: "Deep Learning Fundamentals" },
      { module: "10", title: "Neural Networks with TensorFlow" },
      { module: "11", title: "Computer Vision & Image Processing" },
      { module: "12", title: "Natural Language Processing (NLP)" },
      { module: "13", title: "Model Deployment & MLOps" },
      { module: "14", title: "Capstone: AI Project Development" },
    ],
    skillsYouWillLearn: [
      "Python Programming", "Data Analysis", "Machine Learning", "Deep Learning",
      "TensorFlow", "Data Visualization", "Statistics", "Model Deployment",
      "Computer Vision", "NLP", "Problem Solving", "Research Skills",
    ],
    highlights: [
      { title: "Real Datasets", description: "Work with industry datasets and Kaggle competitions" },
      { title: "GPU Access", description: "Train models on cloud GPUs for deep learning" },
      { title: "Expert Mentors", description: "Learn from data scientists at top companies" },
      { title: "Math Prerequisites Covered", description: "Statistics and math concepts explained clearly" },
    ],
  },
];

export const courseNavItems = courses.map((c) => ({ id: c.id, name: c.title }));

export function getCourseById(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}
