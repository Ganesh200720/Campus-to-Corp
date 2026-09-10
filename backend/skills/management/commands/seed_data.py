import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User, StudentProfile, IndustryProfile, FacultyProfile, InstitutionProfile
from skills.models import Skill, AssessmentQuestion, StudentSkill
from opportunities.models import Internship, Job, LearningProgram, Application
from portfolio.models import Project, Certification, Achievement
from interviews.models import InterviewQuestion
from skills.services import CORE_SKILL_LIST


DEMO_PASSWORD = "SkillBridge@2026"


class Command(BaseCommand):
    help = "Seed SkillBridge with realistic demo data"

    def handle(self, *args, **options):
        with transaction.atomic():
            self.stdout.write("Clearing old data...")
            self._clear()
            self.stdout.write("Creating skills...")
            skills = self._create_skills()
            self.stdout.write("Creating assessment questions...")
            self._create_assessment_questions(skills)
            self.stdout.write("Creating demo accounts...")
            demo = self._create_demo_accounts()
            self.stdout.write("Creating extra students...")
            students = self._create_students(skills) + [demo['student']]
            self.stdout.write("Creating companies + opportunities...")
            companies = self._create_companies() + [demo['industry']]
            internships = self._create_internships(companies, skills)
            jobs = self._create_jobs(companies, skills)
            self.stdout.write("Creating learning programs...")
            self._create_learning_programs(skills)
            self.stdout.write("Creating portfolios (projects/certs/achievements)...")
            self._create_portfolios(students, skills)
            self.stdout.write("Creating applications...")
            self._create_applications(students, internships, jobs)
            self.stdout.write("Creating interview question bank...")
            self._create_interview_questions()
            self.stdout.write("Boosting demo student (Rahul) for a strong demo story...")
            self._boost_demo_student(demo['student'], skills)

        self.stdout.write(self.style.SUCCESS("Seed complete."))
        self.stdout.write(self.style.SUCCESS(f"Demo password for all demo accounts: {DEMO_PASSWORD}"))

    # ------------------------------------------------------------------
    def _clear(self):
        Application.objects.all().delete()
        Project.objects.all().delete()
        Certification.objects.all().delete()
        Achievement.objects.all().delete()
        Internship.objects.all().delete()
        Job.objects.all().delete()
        LearningProgram.objects.all().delete()
        InterviewQuestion.objects.all().delete()
        AssessmentQuestion.objects.all().delete()
        StudentSkill.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()
        Skill.objects.all().delete()

    def _create_skills(self):
        skills = {}
        for name, category in CORE_SKILL_LIST:
            skills[name] = Skill.objects.create(name=name, category=category)
        return skills

    # ------------------------------------------------------------------
    ASSESSMENT_QUESTIONS = [
        ("Python", "Which data structure in Python maintains insertion order and allows duplicate values?",
         "Set", "List", "Dictionary (pre-3.7)", "Frozenset", "b", "easy"),
        ("Python", "What does the 'self' keyword refer to inside a Python class method?",
         "The class itself", "The instance calling the method", "A global variable", "The parent class", "b", "easy"),
        ("Python", "Which of these correctly creates a list comprehension for squares of 0-4?",
         "[x*x in range(5)]", "[x*x for x in range(5)]", "for x in range(5): x*x", "list(x*x, range(5))", "b", "medium"),
        ("Python", "What is the time complexity of dictionary lookup in an average case?",
         "O(n)", "O(log n)", "O(1)", "O(n log n)", "c", "medium"),
        ("JavaScript", "Which keyword declares a block-scoped variable in modern JavaScript?",
         "var", "let", "global", "static", "b", "easy"),
        ("JavaScript", "What does 'this' refer to inside a regular JS function called as a method of an object?",
         "The global object always", "The object the method belongs to", "undefined always", "The function itself", "b", "medium"),
        ("JavaScript", "Which method converts a JSON string into a JavaScript object?",
         "JSON.stringify()", "JSON.parse()", "Object.toJSON()", "JSON.toObject()", "b", "easy"),
        ("React", "What hook is used to manage local state in a functional React component?",
         "useEffect", "useState", "useMemo", "useRef", "b", "easy"),
        ("React", "What is the primary purpose of React's virtual DOM?",
         "To store user data", "To efficiently update the real DOM via diffing", "To replace CSS", "To manage API calls", "b", "medium"),
        ("React", "When does the useEffect hook with an empty dependency array run?",
         "On every render", "Only once after the initial render", "Never", "Only on unmount", "b", "medium"),
        ("HTML/CSS", "Which CSS property is used to create space between an element's border and its content?",
         "margin", "padding", "spacing", "border-gap", "b", "easy"),
        ("HTML/CSS", "Which HTML5 tag is most appropriate for the main navigation menu of a site?",
         "<div>", "<nav>", "<section>", "<menu-bar>", "b", "easy"),
        ("SQL", "Which SQL clause is used to filter rows before grouping?",
         "HAVING", "WHERE", "GROUP BY", "ORDER BY", "b", "easy"),
        ("SQL", "Which SQL JOIN returns all rows from both tables, matching where possible?",
         "INNER JOIN", "LEFT JOIN", "FULL OUTER JOIN", "CROSS JOIN", "c", "medium"),
        ("SQL", "What does the SQL 'GROUP BY' clause do?",
         "Sorts rows", "Groups rows sharing a value to allow aggregate functions", "Filters duplicate rows only", "Joins two tables", "b", "medium"),
        ("Database", "What is the main purpose of database normalization?",
         "Increase redundancy", "Reduce data redundancy and improve integrity", "Speed up all queries automatically", "Encrypt data", "b", "medium"),
        ("Database", "What is a primary key?",
         "Any column in a table", "A column that uniquely identifies each row", "A foreign table reference", "An index on text columns", "b", "easy"),
        ("Data Structures", "What is the time complexity of binary search on a sorted array?",
         "O(n)", "O(n^2)", "O(log n)", "O(1)", "c", "medium"),
        ("Data Structures", "Which data structure uses LIFO (Last In First Out) ordering?",
         "Queue", "Stack", "Linked List", "Tree", "b", "easy"),
        ("Data Structures", "Which data structure is most efficient for implementing a priority queue?",
         "Array", "Heap", "Stack", "Linked List", "b", "hard"),
        ("Machine Learning", "What is 'overfitting' in a machine learning model?",
         "The model performs well on both training and unseen data", "The model memorizes training data but performs poorly on new data", "The model is too simple", "The model has no parameters", "b", "medium"),
        ("Machine Learning", "Which algorithm is commonly used for classification tasks?",
         "Linear Regression only", "Logistic Regression", "K-Means only", "PCA", "b", "medium"),
        ("Machine Learning", "What does 'supervised learning' require?",
         "Only unlabeled data", "Labeled input-output pairs", "No data at all", "Random data generation", "b", "easy"),
        ("Statistics", "What does a p-value less than 0.05 typically suggest in hypothesis testing?",
         "The null hypothesis is definitely true", "Statistically significant evidence against the null hypothesis", "The sample size is too small", "The data is normally distributed", "b", "hard"),
        ("Statistics", "What does 'standard deviation' measure?",
         "The average of a dataset", "The spread/dispersion of data around the mean", "The median value", "The mode of the dataset", "b", "medium"),
        ("Cloud Computing", "What does 'IaaS' stand for in cloud computing?",
         "Internet as a Service", "Infrastructure as a Service", "Interface as a Service", "Integration as a Service", "b", "easy"),
        ("AWS", "Which AWS service is primarily used for scalable object storage?",
         "EC2", "S3", "RDS", "Lambda", "b", "easy"),
        ("AWS", "Which AWS service lets you run code without provisioning servers?",
         "EC2", "S3", "Lambda", "VPC", "c", "medium"),
        ("Docker", "What is the primary purpose of Docker containers?",
         "To replace databases", "To package applications with dependencies for consistent environments", "To design UI", "To manage DNS", "b", "medium"),
        ("Networking", "What does 'DNS' stand for?",
         "Domain Name System", "Data Network Security", "Digital Network Server", "Domain Network Service", "a", "easy"),
        ("System Design", "In system design, what is the purpose of a load balancer?",
         "Encrypt data", "Distribute incoming traffic across multiple servers", "Store cached data only", "Compress images", "b", "medium"),
        ("Testing & QA", "What is the main goal of unit testing?",
         "Test the entire system end-to-end", "Verify individual components/functions work correctly in isolation", "Test only UI elements", "Replace manual testing entirely", "b", "easy"),
        ("Cybersecurity Basics", "What is 'phishing' in cybersecurity?",
         "A type of firewall", "A social engineering attack to trick users into revealing sensitive info", "An encryption algorithm", "A database backup method", "b", "easy"),
        ("Communication", "In a professional setting, what is 'active listening'?",
         "Waiting for your turn to speak", "Fully concentrating, understanding and responding thoughtfully to the speaker", "Multitasking while listening", "Only listening to your manager", "b", "easy"),
        ("Problem Solving", "When facing a complex problem, what is typically the most effective first step?",
         "Jump straight to coding a solution", "Break the problem into smaller, well-defined sub-problems", "Ask someone else to solve it", "Ignore edge cases", "b", "medium"),
        ("Leadership", "What best describes effective team leadership?",
         "Making all decisions alone without input", "Empowering team members while providing clear direction and support", "Avoiding all conflict", "Assigning blame when things go wrong", "b", "medium"),
        ("Teamwork", "What is a key indicator of strong teamwork?",
         "Everyone works in isolation", "Open communication and shared accountability toward common goals", "Only the team lead makes decisions", "Avoiding feedback", "b", "easy"),
        ("Adaptability", "How is adaptability best demonstrated in a fast-changing project?",
         "Refusing to change the original plan", "Adjusting approach effectively when requirements or conditions change", "Ignoring new information", "Waiting for explicit instructions on everything", "b", "medium"),
        ("Time Management", "Which technique is commonly used to prioritize tasks by urgency and importance?",
         "Random selection", "Eisenhower Matrix", "Alphabetical ordering", "First-in-first-out only", "b", "medium"),
    ]

    def _create_assessment_questions(self, skills):
        for skill_name, text, a, b, c, d, correct, difficulty in self.ASSESSMENT_QUESTIONS:
            AssessmentQuestion.objects.create(
                skill=skills[skill_name], text=text, option_a=a, option_b=b, option_c=c, option_d=d,
                correct_option=correct, difficulty=difficulty)

    def _create_demo_accounts(self):
        student_user = User.objects.create_user(
            username="student", email="student@skillbridge.demo", password=DEMO_PASSWORD, role="student",
            first_name="Rahul", last_name="Sharma")
        StudentProfile.objects.create(
            user=student_user, full_name="Rahul Sharma", college="All India Institute of Ayurveda",
            degree="B.Tech", branch="Computer Science", year=3, cgpa=8.2, location="New Delhi, India",
            career_interest="Full Stack Development", avatar_color="#6366f1",
            bio="Aspiring full-stack developer passionate about building products that solve real problems.",
            profile_completion=85)

        industry_user = User.objects.create_user(
            username="industry", email="industry@skillbridge.demo", password=DEMO_PASSWORD, role="industry",
            first_name="TechNova")
        industry_profile = IndustryProfile.objects.create(
            user=industry_user, company_name="TechNova Solutions", industry_type="Software & IT Services",
            location="Bengaluru, India", website="https://technova.example.com", logo_color="#0ea5e9",
            about="A fast-growing software company building cloud-native products for enterprises.")

        faculty_user = User.objects.create_user(
            username="faculty", email="faculty@skillbridge.demo", password=DEMO_PASSWORD, role="faculty",
            first_name="Dr. Anita", last_name="Verma")
        FacultyProfile.objects.create(
            user=faculty_user, full_name="Dr. Anita Verma", college="All India Institute of Ayurveda",
            department="Computer Science & Engineering", designation="Associate Professor",
            research_interest="Applied Machine Learning, EdTech")

        admin_user = User.objects.create_user(
            username="admin", email="admin@skillbridge.demo", password=DEMO_PASSWORD, role="admin",
            first_name="Institution", last_name="Admin")
        InstitutionProfile.objects.create(
            user=admin_user, institution_name="All India Institute of Ayurveda", location="New Delhi, India")

        return {"student": student_user, "industry": industry_profile, "faculty": faculty_user, "admin": admin_user}

    # ------------------------------------------------------------------
    STUDENT_NAMES = [
        ("Ananya", "Iyer", "Computer Science"), ("Arjun", "Mehta", "Information Technology"),
        ("Priya", "Nair", "Computer Science"), ("Rohan", "Kapoor", "Electronics & Communication"),
        ("Sneha", "Reddy", "Computer Science"), ("Vikram", "Singh", "Information Technology"),
        ("Isha", "Gupta", "Computer Science"), ("Karan", "Malhotra", "Mechanical Engineering"),
        ("Divya", "Joshi", "Computer Science"), ("Aditya", "Rao", "Information Technology"),
        ("Meera", "Pillai", "Electronics & Communication"), ("Siddharth", "Bhatt", "Computer Science"),
    ]
    COLLEGES = ["All India Institute of Ayurveda", "National Institute of Technology",
                "Delhi Technological University", "IIIT Bengaluru"]
    CITIES = ["New Delhi, India", "Bengaluru, India", "Pune, India", "Hyderabad, India", "Chennai, India"]
    INTERESTS = ["Full Stack Development", "Data Science", "Cloud Engineering", "Machine Learning",
                 "Backend Development", "Frontend Development", "DevOps", "Mobile Development"]

    def _create_students(self, skills):
        students = []
        for i, (fname, lname, branch) in enumerate(self.STUDENT_NAMES):
            username = f"{fname.lower()}{lname.lower()}"
            user = User.objects.create_user(
                username=username, email=f"{username}@skillbridge.demo", password=DEMO_PASSWORD, role="student",
                first_name=fname, last_name=lname)
            cgpa = round(random.uniform(6.2, 9.4), 2)
            year = random.choice([2, 3, 4])
            profile = StudentProfile.objects.create(
                user=user, full_name=f"{fname} {lname}", college=random.choice(self.COLLEGES),
                degree="B.Tech", branch=branch, year=year, cgpa=cgpa, location=random.choice(self.CITIES),
                career_interest=random.choice(self.INTERESTS),
                avatar_color=random.choice(["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]),
                bio=f"{branch} student exploring opportunities in {random.choice(self.INTERESTS).lower()}.",
                profile_completion=random.randint(55, 95))
            # assign randomised skill scores across ~10-15 relevant skills
            skill_names = list(skills.keys())
            random.shuffle(skill_names)
            for name in skill_names[:random.randint(10, 16)]:
                StudentSkill.objects.create(student=user, skill=skills[name], score=round(random.uniform(20, 92), 1))
            students.append(user)
        return students

    # ------------------------------------------------------------------
    COMPANIES = [
        ("Cloudera Systems", "Cloud Infrastructure", "Bengaluru, India", "#0ea5e9"),
        ("DataForge Analytics", "Data & AI", "Hyderabad, India", "#8b5cf6"),
        ("PixelCraft Studios", "Product Design & Web", "Pune, India", "#f59e0b"),
        ("FinEdge Technologies", "FinTech", "Mumbai, India", "#10b981"),
        ("HealthStack Innovations", "HealthTech", "New Delhi, India", "#ef4444"),
        ("NextGen Robotics", "Robotics & IoT", "Chennai, India", "#6366f1"),
        ("Quantum Byte Labs", "Software Products", "Gurugram, India", "#0891b2"),
        ("GreenGrid Energy Tech", "CleanTech", "Ahmedabad, India", "#22c55e"),
    ]

    def _create_companies(self):
        companies = []
        for i, (name, itype, loc, color) in enumerate(self.COMPANIES):
            username = name.lower().replace(" ", "")[:15] + str(i)
            user = User.objects.create_user(
                username=username, email=f"{username}@skillbridge.demo", password=DEMO_PASSWORD, role="industry")
            profile = IndustryProfile.objects.create(
                user=user, company_name=name, industry_type=itype, location=loc, logo_color=color,
                website=f"https://{username}.example.com",
                about=f"{name} is a leading company in {itype.lower()} building innovative solutions for global clients.")
            companies.append(profile)
        return companies

    INTERNSHIP_TEMPLATES = [
        ("Software Development Intern", ["Python", "Data Structures", "Git & Version Control", "Problem Solving"]),
        ("Data Science Intern", ["Python", "Machine Learning", "Statistics", "SQL"]),
        ("Cloud Engineering Intern", ["AWS", "Cloud Computing", "Docker", "Networking"]),
        ("AI/ML Intern", ["Python", "Machine Learning", "Data Structures", "Statistics"]),
        ("Frontend Developer Intern", ["JavaScript", "React", "HTML/CSS", "TypeScript"]),
        ("Backend Developer Intern", ["Python", "SQL", "Database", "System Design"]),
        ("Full Stack Developer Intern", ["Python", "JavaScript", "React", "SQL", "AWS"]),
        ("DevOps Intern", ["Docker", "Cloud Computing", "AWS", "Networking"]),
        ("Mobile App Development Intern", ["JavaScript", "React", "Database"]),
        ("QA & Testing Intern", ["Testing & QA", "Problem Solving", "Communication"]),
        ("Cybersecurity Intern", ["Cybersecurity Basics", "Networking", "Problem Solving"]),
        ("UI/UX Design Intern", ["HTML/CSS", "Communication", "Adaptability"]),
        ("Data Analytics Intern", ["SQL", "Statistics", "Python", "Communication"]),
        ("Product Management Intern", ["Communication", "Leadership", "Problem Solving", "Teamwork"]),
        ("Business Intelligence Intern", ["SQL", "Database", "Statistics", "Communication"]),
        ("Research & Innovation Intern", ["Python", "Machine Learning", "Problem Solving"]),
    ]

    def _create_internships(self, companies, skills):
        internships = []
        for i, (title, skill_names) in enumerate(self.INTERNSHIP_TEMPLATES):
            company = companies[i % len(companies)]
            deadline = date.today() + timedelta(days=random.randint(10, 60))
            internship = Internship.objects.create(
                company=company, title=title,
                description=f"Join {company.company_name} as a {title} and work on real production systems "
                             f"alongside experienced engineers. You'll contribute to live projects, "
                             f"participate in code reviews, and gain hands-on industry exposure.",
                location=company.location, mode=random.choice(["remote", "hybrid", "onsite"]),
                duration=random.choice(["8 weeks", "10 weeks", "3 months", "6 months"]),
                stipend=f"₹{random.choice([8, 12, 15, 20, 25, 30])},000/month",
                min_cgpa=round(random.uniform(6.0, 7.5), 1), deadline=deadline)
            internship.required_skills.set([skills[s] for s in skill_names if s in skills])
            internships.append(internship)
        return internships

    JOB_TEMPLATES = [
        ("Full Stack Developer", ["Python", "JavaScript", "React", "SQL", "AWS"], "0-2 years", "₹6-10 LPA"),
        ("Backend Developer", ["Python", "SQL", "Database", "System Design"], "1-3 years", "₹7-12 LPA"),
        ("Frontend Developer", ["JavaScript", "React", "HTML/CSS", "TypeScript"], "0-2 years", "₹5-9 LPA"),
        ("Data Scientist", ["Python", "Machine Learning", "SQL", "Statistics"], "1-3 years", "₹9-16 LPA"),
        ("Cloud Engineer", ["AWS", "Cloud Computing", "Docker", "Networking"], "1-3 years", "₹8-14 LPA"),
        ("ML Engineer", ["Python", "Machine Learning", "Data Structures", "Statistics"], "1-4 years", "₹10-18 LPA"),
        ("DevOps Engineer", ["Docker", "Cloud Computing", "AWS", "Networking"], "2-4 years", "₹9-15 LPA"),
        ("Mobile App Developer", ["JavaScript", "React", "Database"], "0-2 years", "₹6-10 LPA"),
        ("QA Engineer", ["Testing & QA", "Problem Solving", "Communication"], "0-2 years", "₹4-7 LPA"),
        ("Business Analyst", ["SQL", "Communication", "Statistics", "Problem Solving"], "0-2 years", "₹5-9 LPA"),
    ]

    def _create_jobs(self, companies, skills):
        jobs = []
        for i, (title, skill_names, exp, salary) in enumerate(self.JOB_TEMPLATES):
            company = companies[(i + 3) % len(companies)]
            deadline = date.today() + timedelta(days=random.randint(15, 75))
            job = Job.objects.create(
                company=company, title=title,
                description=f"{company.company_name} is hiring a {title} to design, build and ship features used "
                             f"by thousands of users. You will collaborate closely with product and design teams.",
                location=company.location, experience_required=exp, salary=salary,
                min_cgpa=round(random.uniform(6.0, 7.5), 1), deadline=deadline)
            job.required_skills.set([skills[s] for s in skill_names if s in skills])
            jobs.append(job)
        return jobs

    LEARNING_TEMPLATES = [
        ("React for Modern Web Development", "SkillBridge Learning", "React", "6 weeks", "course"),
        ("AWS Cloud Practitioner Fundamentals", "CloudAcademy Partner", "AWS", "4 weeks", "certification"),
        ("Python for Data Science", "SkillBridge Learning", "Python", "8 weeks", "course"),
        ("Mastering SQL for Analysts", "SkillBridge Learning", "SQL", "3 weeks", "course"),
        ("Machine Learning Foundations", "DataForge Academy", "Machine Learning", "10 weeks", "course"),
        ("Docker & Containers Bootcamp", "CloudAcademy Partner", "Docker", "2 weeks", "workshop"),
        ("Effective Technical Communication", "SkillBridge Learning", "Communication", "2 weeks", "workshop"),
        ("Advanced JavaScript & TypeScript", "SkillBridge Learning", "TypeScript", "5 weeks", "course"),
        ("System Design Interview Prep", "TechNova Mentorship", "System Design", "4 weeks", "mentorship"),
        ("Statistics for Data-Driven Decisions", "SkillBridge Learning", "Statistics", "4 weeks", "course"),
        ("Cybersecurity Essentials", "SkillBridge Learning", "Cybersecurity Basics", "3 weeks", "certification"),
        ("Leadership for Young Engineers", "Quantum Byte Mentorship", "Leadership", "3 weeks", "mentorship"),
    ]

    def _create_learning_programs(self, skills):
        for title, provider, skill_name, duration, ptype in self.LEARNING_TEMPLATES:
            LearningProgram.objects.create(
                title=title, provider=provider, skill=skills[skill_name], duration=duration, program_type=ptype,
                description=f"A focused {duration} program to strengthen your {skill_name} proficiency, "
                             f"aligned with current industry expectations.")

    PROJECT_TEMPLATES = [
        ("Campus Event Management System", "Django, React, PostgreSQL", "Full-stack platform for managing college fests and event registrations."),
        ("Personal Expense Tracker", "React, Node.js, MongoDB", "A responsive web app to track daily expenses with visual analytics."),
        ("Skill Gap Visualizer", "Python, Flask, Chart.js", "A dashboard visualizing skill gaps between students and industry benchmarks."),
        ("E-Commerce Storefront", "React, Django REST Framework, SQLite", "A mini e-commerce storefront with cart, checkout and order tracking."),
        ("Weather Prediction Model", "Python, Scikit-learn, Pandas", "ML model predicting rainfall using historical weather datasets."),
        ("Chat Application", "React, WebSockets, Node.js", "Real-time chat app supporting group conversations and notifications."),
        ("Library Management System", "Java, MySQL", "Desktop application to manage book issue/return and inventory."),
        ("Portfolio Website Builder", "React, Tailwind CSS", "A drag-and-drop tool for students to build personal portfolio sites."),
    ]

    CERT_TEMPLATES = [
        ("AWS Certified Cloud Practitioner", "Amazon Web Services"),
        ("Google Data Analytics Certificate", "Google"),
        ("Meta Front-End Developer Certificate", "Meta"),
        ("Python for Everybody Specialization", "University of Michigan (Coursera)"),
        ("Machine Learning Specialization", "DeepLearning.AI"),
        ("Microsoft Azure Fundamentals (AZ-900)", "Microsoft"),
    ]

    ACHIEVEMENT_TEMPLATES = [
        ("Winner - Smart India Hackathon (Institute Round)", "Led a 6-member team to win the internal SIH selection round."),
        ("Best Project Award - Annual Tech Fest", "Recognised for the most innovative student project."),
        ("1st Place - Inter-college Coding Contest", "Solved the highest number of problems within time limit."),
        ("Published Research Paper", "Co-authored a paper on applied machine learning in a peer-reviewed student journal."),
    ]

    def _create_portfolios(self, students, skills):
        for student in students:
            for title, tech, desc in random.sample(self.PROJECT_TEMPLATES, k=random.randint(1, 3)):
                Project.objects.create(student=student, title=title, description=desc, tech_stack=tech,
                                        link="https://github.com/skillbridge-demo/" + title.lower().replace(" ", "-"))
            for title, issuer in random.sample(self.CERT_TEMPLATES, k=random.randint(0, 2)):
                Certification.objects.create(student=student, title=title, issuer=issuer,
                                              date_earned=date.today() - timedelta(days=random.randint(30, 500)))
            if random.random() > 0.5:
                title, desc = random.choice(self.ACHIEVEMENT_TEMPLATES)
                Achievement.objects.create(student=student, title=title, description=desc,
                                            date_earned=date.today() - timedelta(days=random.randint(10, 400)))

    def _create_applications(self, students, internships, jobs):
        statuses = ["applied", "under_review", "shortlisted", "interview", "selected", "rejected"]
        seen = set()
        count = 0
        while count < 24:
            student = random.choice(students)
            target_type = random.choice(["internship", "job"])
            target = random.choice(internships) if target_type == "internship" else random.choice(jobs)
            key = (student.id, target_type, target.id)
            if key in seen:
                continue
            seen.add(key)
            kwargs = {"student": student, "status": random.choice(statuses), "match_score": round(random.uniform(45, 96), 1)}
            if target_type == "internship":
                kwargs["internship"] = target
            else:
                kwargs["job"] = target
            Application.objects.create(**kwargs)
            count += 1

    INTERVIEW_BANK = {
        "Frontend Developer": {
            "beginner": [
                ("What is the difference between HTML and HTML5?", ["semantic", "video", "audio", "canvas", "api"]),
                ("Explain the box model in CSS.", ["margin", "border", "padding", "content"]),
                ("What is the virtual DOM in React?", ["virtual", "dom", "diffing", "render", "performance"]),
            ],
            "intermediate": [
                ("How does state management differ from props in React?", ["state", "props", "immutable", "component", "re-render"]),
                ("Explain React hooks like useState and useEffect.", ["hook", "useeffect", "usestate", "lifecycle", "dependency"]),
                ("How would you optimize the performance of a React app?", ["memo", "lazy", "code splitting", "virtualization", "render"]),
            ],
            "advanced": [
                ("Explain server-side rendering vs client-side rendering trade-offs.", ["ssr", "csr", "seo", "hydration", "performance"]),
                ("How would you design a scalable component library?", ["reusable", "design system", "props", "theme", "accessibility"]),
            ],
        },
        "Backend Developer": {
            "beginner": [
                ("What is a REST API?", ["rest", "http", "endpoint", "json", "stateless"]),
                ("Explain the difference between SQL and NoSQL databases.", ["sql", "nosql", "schema", "relational", "document"]),
                ("What is an index in a database?", ["index", "query", "performance", "lookup"]),
            ],
            "intermediate": [
                ("How would you design an authentication system for an API?", ["jwt", "token", "session", "hash", "authorization"]),
                ("Explain database normalization.", ["normalization", "redundancy", "foreign key", "schema"]),
                ("How do you handle concurrent requests to the same resource?", ["lock", "transaction", "race condition", "concurrency"]),
            ],
            "advanced": [
                ("How would you scale a backend system to handle 1 million users?", ["load balancer", "cache", "horizontal scaling", "sharding", "queue"]),
                ("Explain the CAP theorem.", ["consistency", "availability", "partition", "tradeoff"]),
            ],
        },
        "Data Scientist": {
            "beginner": [
                ("What is overfitting in machine learning?", ["overfitting", "generalization", "training", "variance"]),
                ("Explain the difference between supervised and unsupervised learning.", ["supervised", "unsupervised", "label", "cluster"]),
            ],
            "intermediate": [
                ("How would you handle missing data in a dataset?", ["imputation", "missing", "mean", "drop", "null"]),
                ("Explain precision and recall.", ["precision", "recall", "false positive", "false negative"]),
                ("What is feature engineering and why does it matter?", ["feature", "engineering", "transform", "model performance"]),
            ],
            "advanced": [
                ("How would you deploy a machine learning model to production?", ["deployment", "api", "monitoring", "versioning", "pipeline"]),
            ],
        },
        "Full Stack Developer": {
            "beginner": [
                ("What does full-stack development mean to you?", ["frontend", "backend", "database", "end to end"]),
                ("What is the role of an API in a full-stack app?", ["api", "frontend", "backend", "communication"]),
            ],
            "intermediate": [
                ("How do you structure a React + Django project?", ["react", "django", "rest", "structure", "separation"]),
                ("Explain how you would deploy a full-stack application.", ["deployment", "server", "database", "environment"]),
            ],
            "advanced": [
                ("How would you design the architecture for a scalable full-stack SaaS product?", ["microservice", "scalability", "database", "caching", "architecture"]),
            ],
        },
    }

    def _create_interview_questions(self):
        for role, difficulties in self.INTERVIEW_BANK.items():
            for difficulty, questions in difficulties.items():
                for text, keywords in questions:
                    InterviewQuestion.objects.create(role=role, difficulty=difficulty, text=text, expected_keywords=keywords)

    # ------------------------------------------------------------------
    def _boost_demo_student(self, student, skills):
        """Give Rahul (the demo student) a compelling, story-friendly skill profile."""
        StudentSkill.objects.filter(student=student).delete()
        boosted = {
            "Python": 85, "SQL": 70, "Data Structures": 78, "Git & Version Control": 80,
            "Problem Solving": 82, "Teamwork": 75, "Adaptability": 70,
            "JavaScript": 55, "React": 45, "AWS": 30, "HTML/CSS": 60,
            "Communication": 48, "Cloud Computing": 35, "Database": 68, "Machine Learning": 40,
        }
        for name, score in boosted.items():
            StudentSkill.objects.create(student=student, skill=skills[name], score=score)
