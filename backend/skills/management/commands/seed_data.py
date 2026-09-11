import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User, StudentProfile, IndustryProfile, FacultyProfile, InstitutionProfile
from skills.models import (
    Skill,
    SkillModule,
    SkillTopic,
    AssessmentQuestion,
    StudentSkill,
    IndustryAssessment,
    IndustryAssessmentQuestion,
    IndustryAssessmentAttempt,
    IndustryAssessmentAnswer,
)
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

            self.stdout.write("Creating skill modules and topics...")
            topics = self._create_skill_hierarchy(skills)

            self.stdout.write("Creating assessment questions...")
            self._create_assessment_questions(skills, topics)

            self.stdout.write("Adding richer skill assessment questions...")
            self._add_skill_assessment_questions()

            self.stdout.write("Creating demo accounts...")
            demo = self._create_demo_accounts()

            self.stdout.write("Creating extra students...")
            students = self._create_students(skills) + [demo['student']]

            self.stdout.write("Creating companies + opportunities...")
            companies = self._create_companies() + [demo['industry']]
            internships = self._create_internships(companies, skills)
            jobs = self._create_jobs(companies, skills)

            self.stdout.write("Creating industry assessments (company-wise, with a live prerequisite demo)...")
            self._create_industry_assessments(companies, students, demo['student'])

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
        self.stdout.write(
            self.style.SUCCESS(
                f"Demo password for all demo accounts: {DEMO_PASSWORD}"
            )
        )

    # ------------------------------------------------------------------
    def _clear(self):
        IndustryAssessmentAnswer.objects.all().delete()
        IndustryAssessmentAttempt.objects.all().delete()
        IndustryAssessmentQuestion.objects.all().delete()
        IndustryAssessment.objects.all().delete()

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
            skills[name] = Skill.objects.create(
                name=name,
                category=category
            )

        return skills

    # ------------------------------------------------------------------
    # Skill -> Module -> Topic hierarchy
    # ------------------------------------------------------------------

    SKILL_HIERARCHY = {
        "Python": [
            (
                "Python Basics",
                "Fundamental Python syntax and core language concepts.",
                [
                    ("Variables & Data Types", "Variables, data types and Python collections."),
                    ("Operators & Expressions", "Operators and expressions in Python."),
                    ("Control Flow", "Conditions, loops and program flow."),
                ],
            ),
            (
                "Functions",
                "Reusable blocks of Python code.",
                [
                    ("Functions", "Defining and using Python functions."),
                    ("Comprehensions", "List and other collection comprehensions."),
                ],
            ),
            (
                "Object Oriented Programming",
                "Object-oriented programming concepts in Python.",
                [
                    ("Classes & Objects", "Classes, objects and instance methods."),
                    ("Inheritance", "Inheritance and reusable class structures."),
                ],
            ),
        ],

        "JavaScript": [
            (
                "JavaScript Basics",
                "Core JavaScript language concepts.",
                [
                    ("Variables & Scope", "Variables, let, const and scope."),
                    ("Objects & this", "Objects and the this keyword."),
                ],
            ),
            (
                "Data & Web APIs",
                "Working with data and browser-facing APIs.",
                [
                    ("JSON", "Parsing and serializing JSON data."),
                    ("Modern JavaScript", "Modern JavaScript language features."),
                ],
            ),
            (
                "Advanced JavaScript",
                "Advanced concepts used in modern applications.",
                [
                    ("Functions & Closures", "Functions, callbacks and closures."),
                    ("Asynchronous JavaScript", "Promises, async operations and event handling."),
                ],
            ),
        ],

        "React": [
            (
                "React Basics",
                "Core React concepts.",
                [
                    ("Components & Props", "React components and passing data with props."),
                    ("Virtual DOM", "React rendering and virtual DOM concepts."),
                ],
            ),
            (
                "React Hooks",
                "Managing state and side effects using hooks.",
                [
                    ("useState", "Managing component state."),
                    ("useEffect", "Handling side effects and component lifecycle."),
                ],
            ),
            (
                "Advanced React",
                "Advanced React development concepts.",
                [
                    ("Performance", "Rendering performance and optimization."),
                    ("Application Architecture", "Structuring scalable React applications."),
                ],
            ),
        ],

        "HTML/CSS": [
            (
                "HTML Fundamentals",
                "Core HTML and semantic page structure.",
                [
                    ("HTML Elements", "Common HTML elements and document structure."),
                    ("Semantic HTML", "Semantic elements and accessible page structure."),
                ],
            ),
            (
                "CSS Fundamentals",
                "Core CSS layout and styling concepts.",
                [
                    ("Box Model", "Margins, borders, padding and content."),
                    ("Layout & Spacing", "CSS layout and spacing techniques."),
                ],
            ),
            (
                "Responsive Web Design",
                "Creating responsive and modern web interfaces.",
                [
                    ("Responsive Layouts", "Layouts that adapt to different screens."),
                    ("Modern CSS", "Modern CSS features and best practices."),
                ],
            ),
        ],

        "SQL": [
            (
                "SQL Basics",
                "Fundamental SQL querying concepts.",
                [
                    ("SELECT & WHERE", "Selecting and filtering database rows."),
                    ("Sorting & Filtering", "Ordering and filtering query results."),
                ],
            ),
            (
                "Grouping & Aggregation",
                "Grouping records and calculating aggregates.",
                [
                    ("GROUP BY", "Grouping rows for analysis."),
                    ("Aggregate Functions", "COUNT, SUM, AVG and related functions."),
                ],
            ),
            (
                "SQL Joins",
                "Combining information from multiple tables.",
                [
                    ("JOIN Fundamentals", "Understanding SQL joins."),
                    ("Advanced Joins", "Working with different join strategies."),
                ],
            ),
        ],

        "Database": [
            (
                "Database Fundamentals",
                "Core relational database concepts.",
                [
                    ("Tables & Keys", "Tables, primary keys and relationships."),
                    ("Database Design", "Designing structured relational databases."),
                ],
            ),
            (
                "Normalization",
                "Reducing redundancy and improving database integrity.",
                [
                    ("Normal Forms", "Database normalization and normal forms."),
                    ("Data Integrity", "Maintaining consistency and integrity."),
                ],
            ),
            (
                "Database Performance",
                "Improving database access and query performance.",
                [
                    ("Indexes", "Indexes and efficient data lookup."),
                    ("Query Optimization", "Improving database query performance."),
                ],
            ),
        ],

        "Data Structures": [
            (
                "Linear Data Structures",
                "Core linear data structures.",
                [
                    ("Arrays", "Arrays and sequential data storage."),
                    ("Stacks & Queues", "LIFO and FIFO data structures."),
                ],
            ),
            (
                "Searching & Sorting",
                "Finding and organizing data efficiently.",
                [
                    ("Binary Search", "Searching sorted collections efficiently."),
                    ("Sorting Algorithms", "Common sorting approaches."),
                ],
            ),
            (
                "Trees & Heaps",
                "Hierarchical data structures and priority queues.",
                [
                    ("Trees", "Tree structures and traversal."),
                    ("Heaps", "Heap structures and priority queues."),
                ],
            ),
        ],

        "Machine Learning": [
            (
                "ML Fundamentals",
                "Fundamental machine learning concepts.",
                [
                    ("Supervised Learning", "Learning from labeled data."),
                    ("Unsupervised Learning", "Learning patterns from unlabeled data."),
                ],
            ),
            (
                "Model Training",
                "Training and evaluating machine learning models.",
                [
                    ("Classification", "Classification algorithms and tasks."),
                    ("Model Evaluation", "Evaluating machine learning models."),
                ],
            ),
            (
                "Model Generalization",
                "Understanding generalization and model behavior.",
                [
                    ("Overfitting", "Overfitting and generalization."),
                    ("Feature Engineering", "Preparing and transforming features."),
                ],
            ),
        ],

        "Statistics": [
            (
                "Statistics Fundamentals",
                "Fundamental statistical concepts.",
                [
                    ("Descriptive Statistics", "Mean, median, mode and data summaries."),
                    ("Variability", "Understanding spread and dispersion."),
                ],
            ),
            (
                "Probability",
                "Probability concepts used in data analysis.",
                [
                    ("Probability Basics", "Basic probability concepts."),
                    ("Distributions", "Probability distributions."),
                ],
            ),
            (
                "Hypothesis Testing",
                "Testing statistical hypotheses.",
                [
                    ("p-values", "Understanding statistical significance and p-values."),
                    ("Statistical Tests", "Common hypothesis testing approaches."),
                ],
            ),
        ],

        "Cloud Computing": [
            (
                "Cloud Fundamentals",
                "Core cloud computing concepts.",
                [
                    ("Cloud Service Models", "IaaS, PaaS and SaaS."),
                    ("Cloud Architecture", "Fundamental cloud architecture concepts."),
                ],
            ),
            (
                "Cloud Infrastructure",
                "Infrastructure and deployment concepts.",
                [
                    ("Compute", "Cloud compute resources."),
                    ("Storage", "Cloud storage concepts."),
                ],
            ),
            (
                "Cloud Operations",
                "Operating scalable cloud systems.",
                [
                    ("Scalability", "Scaling cloud applications."),
                    ("Availability", "Designing highly available systems."),
                ],
            ),
        ],

        "AWS": [
            (
                "AWS Fundamentals",
                "Core AWS services and concepts.",
                [
                    ("AWS Services", "Introduction to major AWS services."),
                    ("Cloud Storage", "Object and cloud storage services."),
                ],
            ),
            (
                "AWS Compute",
                "Running applications and code on AWS.",
                [
                    ("EC2", "AWS virtual compute instances."),
                    ("Lambda", "Serverless compute using AWS Lambda."),
                ],
            ),
            (
                "AWS Architecture",
                "Designing scalable AWS solutions.",
                [
                    ("AWS Networking", "Networking concepts in AWS."),
                    ("Scalable Architecture", "Designing scalable cloud applications."),
                ],
            ),
        ],

        "Docker": [
            (
                "Docker Fundamentals",
                "Core Docker and container concepts.",
                [
                    ("Containers", "Containerization fundamentals."),
                    ("Images", "Docker images and image management."),
                ],
            ),
            (
                "Docker Development",
                "Building and running containerized applications.",
                [
                    ("Dockerfile", "Creating Docker images with Dockerfiles."),
                    ("Container Networking", "Networking between containers."),
                ],
            ),
            (
                "Docker Deployment",
                "Deploying containerized applications.",
                [
                    ("Container Orchestration", "Managing multiple containers."),
                    ("Production Containers", "Running containers in production."),
                ],
            ),
        ],

        "Networking": [
            (
                "Networking Fundamentals",
                "Core computer networking concepts.",
                [
                    ("Network Basics", "Fundamental networking concepts."),
                    ("DNS", "Domain Name System and name resolution."),
                ],
            ),
            (
                "Protocols",
                "Common networking protocols.",
                [
                    ("HTTP & HTTPS", "Web communication protocols."),
                    ("TCP/IP", "Core Internet communication protocols."),
                ],
            ),
            (
                "Network Infrastructure",
                "Infrastructure used to connect systems.",
                [
                    ("Routing", "Routing and packet forwarding."),
                    ("Network Security", "Basic network security concepts."),
                ],
            ),
        ],

        "System Design": [
            (
                "System Design Fundamentals",
                "Fundamental principles of system design.",
                [
                    ("Scalability", "Designing systems that scale."),
                    ("Reliability", "Building reliable systems."),
                ],
            ),
            (
                "Distributed Systems",
                "Designing systems across multiple machines.",
                [
                    ("Load Balancing", "Distributing traffic across servers."),
                    ("Caching", "Caching strategies and performance."),
                ],
            ),
            (
                "Data Architecture",
                "Designing scalable data layers.",
                [
                    ("Database Scaling", "Scaling database systems."),
                    ("Data Partitioning", "Partitioning and distributed data."),
                ],
            ),
        ],

        "Testing & QA": [
            (
                "Testing Fundamentals",
                "Core software testing concepts.",
                [
                    ("Unit Testing", "Testing individual functions and components."),
                    ("Integration Testing", "Testing interactions between components."),
                ],
            ),
            (
                "Test Automation",
                "Automating software testing.",
                [
                    ("Automated Tests", "Writing automated test cases."),
                    ("Test Frameworks", "Using testing frameworks."),
                ],
            ),
            (
                "Quality Assurance",
                "Maintaining software quality.",
                [
                    ("Bug Tracking", "Finding and tracking software defects."),
                    ("Quality Processes", "Software quality assurance processes."),
                ],
            ),
        ],

        "Cybersecurity Basics": [
            (
                "Security Fundamentals",
                "Basic cybersecurity principles.",
                [
                    ("Threats", "Common cybersecurity threats."),
                    ("Social Engineering", "Human-focused security attacks."),
                ],
            ),
            (
                "Authentication & Access",
                "Controlling access to systems.",
                [
                    ("Authentication", "Verifying user identities."),
                    ("Authorization", "Controlling permissions."),
                ],
            ),
            (
                "Application Security",
                "Security concepts for applications.",
                [
                    ("Web Security", "Common web application security concepts."),
                    ("Data Protection", "Protecting sensitive information."),
                ],
            ),
        ],

        "Communication": [
            (
                "Communication Fundamentals",
                "Core professional communication skills.",
                [
                    ("Active Listening", "Listening carefully and responding effectively."),
                    ("Clear Communication", "Communicating ideas clearly."),
                ],
            ),
            (
                "Professional Communication",
                "Communication in professional environments.",
                [
                    ("Written Communication", "Professional written communication."),
                    ("Presentation Skills", "Presenting information effectively."),
                ],
            ),
            (
                "Workplace Communication",
                "Communication within teams and organizations.",
                [
                    ("Feedback", "Giving and receiving useful feedback."),
                    ("Conflict Communication", "Handling disagreements constructively."),
                ],
            ),
        ],

        "Problem Solving": [
            (
                "Problem Solving Fundamentals",
                "Core problem solving techniques.",
                [
                    ("Problem Decomposition", "Breaking complex problems into smaller parts."),
                    ("Root Cause Analysis", "Finding the underlying cause of problems."),
                ],
            ),
            (
                "Analytical Thinking",
                "Analyzing problems systematically.",
                [
                    ("Logical Reasoning", "Applying logical reasoning."),
                    ("Decision Making", "Choosing effective solutions."),
                ],
            ),
            (
                "Solution Design",
                "Designing and evaluating solutions.",
                [
                    ("Solution Strategies", "Developing possible solutions."),
                    ("Evaluation", "Comparing and evaluating solutions."),
                ],
            ),
        ],

        "Leadership": [
            (
                "Leadership Fundamentals",
                "Fundamental leadership concepts.",
                [
                    ("Leadership Styles", "Different approaches to leadership."),
                    ("Decision Making", "Leadership decision-making."),
                ],
            ),
            (
                "Team Leadership",
                "Leading and supporting teams.",
                [
                    ("Delegation", "Delegating tasks effectively."),
                    ("Motivation", "Motivating team members."),
                ],
            ),
            (
                "Strategic Leadership",
                "Long-term leadership and organizational thinking.",
                [
                    ("Vision & Goals", "Creating direction and goals."),
                    ("Conflict Resolution", "Resolving team conflicts."),
                ],
            ),
        ],

        "Teamwork": [
            (
                "Teamwork Fundamentals",
                "Core principles of effective teamwork.",
                [
                    ("Collaboration", "Working effectively with others."),
                    ("Shared Accountability", "Taking responsibility for team outcomes."),
                ],
            ),
            (
                "Team Communication",
                "Communication within teams.",
                [
                    ("Team Communication", "Open and effective team communication."),
                    ("Feedback", "Constructive team feedback."),
                ],
            ),
            (
                "Team Performance",
                "Improving team effectiveness.",
                [
                    ("Coordination", "Coordinating team activities."),
                    ("Conflict Management", "Managing team disagreements."),
                ],
            ),
        ],

        "Adaptability": [
            (
                "Adaptability Fundamentals",
                "Understanding adaptability in changing environments.",
                [
                    ("Change Management", "Responding effectively to change."),
                    ("Flexible Thinking", "Adapting approaches when circumstances change."),
                ],
            ),
            (
                "Workplace Adaptability",
                "Adapting to changing workplace requirements.",
                [
                    ("Learning New Skills", "Learning and applying new skills."),
                    ("Handling Uncertainty", "Working effectively with uncertainty."),
                ],
            ),
            (
                "Resilience",
                "Maintaining performance through challenges.",
                [
                    ("Resilience", "Recovering from setbacks."),
                    ("Continuous Improvement", "Improving through experience and feedback."),
                ],
            ),
        ],

        "Time Management": [
            (
                "Time Management Fundamentals",
                "Fundamental time management techniques.",
                [
                    ("Prioritization", "Prioritizing tasks effectively."),
                    ("Urgency & Importance", "Distinguishing urgent and important work."),
                ],
            ),
            (
                "Planning",
                "Planning and organizing work.",
                [
                    ("Task Planning", "Breaking work into manageable tasks."),
                    ("Scheduling", "Creating effective schedules."),
                ],
            ),
            (
                "Productivity",
                "Improving personal productivity.",
                [
                    ("Focus", "Maintaining focus and reducing distractions."),
                    ("Productivity Techniques", "Using productivity frameworks."),
                ],
            ),
        ],
    }

    def _create_skill_hierarchy(self, skills):
        topics = {}

        for skill_name, modules in self.SKILL_HIERARCHY.items():
            if skill_name not in skills:
                continue

            skill = skills[skill_name]

            for module_index, (module_title, module_description, topic_list) in enumerate(modules, start=1):
                module = SkillModule.objects.create(
                    skill=skill,
                    title=module_title,
                    description=module_description,
                    order=module_index,
                )

                for topic_index, (topic_title, topic_description) in enumerate(topic_list, start=1):
                    topic = SkillTopic.objects.create(
                        module=module,
                        title=topic_title,
                        description=topic_description,
                        order=topic_index,
                    )

                    topics[(skill_name, topic_title)] = topic

        return topics

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

    # ------------------------------------------------------------------
    # Assign existing questions to topics using the SAME topic titles
    # that exist in SKILL_HIERARCHY.
    # ------------------------------------------------------------------

    QUESTION_TOPIC_MAP = {
        "Python": [
            "Variables & Data Types",
            "Classes & Objects",
            "Comprehensions",
            "Operators & Expressions",
        ],
        "JavaScript": [
            "Variables & Scope",
            "Objects & this",
            "JSON",
        ],
        "React": [
            "useState",
            "Virtual DOM",
            "useEffect",
        ],
        "HTML/CSS": [
            "Box Model",
            "Semantic HTML",
        ],
        "SQL": [
            "SELECT & WHERE",
            "JOIN Fundamentals",
            "GROUP BY",
        ],
        "Database": [
            "Normal Forms",
            "Tables & Keys",
        ],
        "Data Structures": [
            "Binary Search",
            "Stacks & Queues",
            "Heaps",
        ],
        "Machine Learning": [
            "Overfitting",
            "Classification",
            "Supervised Learning",
        ],
        "Statistics": [
            "p-values",
            "Variability",
        ],
        "Cloud Computing": [
            "Cloud Service Models",
        ],
        "AWS": [
            "Cloud Storage",
            "Lambda",
        ],
        "Docker": [
            "Containers",
        ],
        "Networking": [
            "DNS",
        ],
        "System Design": [
            "Load Balancing",
        ],
        "Testing & QA": [
            "Unit Testing",
        ],
        "Cybersecurity Basics": [
            "Social Engineering",
        ],
        "Communication": [
            "Active Listening",
        ],
        "Problem Solving": [
            "Problem Decomposition",
        ],
        "Leadership": [
            "Team Leadership",
        ],
        "Teamwork": [
            "Collaboration",
        ],
        "Adaptability": [
            "Change Management",
        ],
        "Time Management": [
            "Prioritization",
        ],
    }

    def _create_assessment_questions(self, skills, topics):
        skill_question_indexes = {}

        for skill_name, text, a, b, c, d, correct, difficulty in self.ASSESSMENT_QUESTIONS:
            index = skill_question_indexes.get(skill_name, 0)

            topic_names = self.QUESTION_TOPIC_MAP.get(skill_name, [])

            topic = None

            if topic_names:
                topic_name = topic_names[min(index, len(topic_names) - 1)]
                topic = topics.get((skill_name, topic_name))

            AssessmentQuestion.objects.create(
                skill=skills[skill_name],
                topic=topic,
                text=text,
                option_a=a,
                option_b=b,
                option_c=c,
                option_d=d,
                correct_option=correct,
                difficulty=difficulty,
            )

            skill_question_indexes[skill_name] = index + 1

    # ------------------------------------------------------------------
    def _add_skill_assessment_questions(self):
        """
        Add a richer question bank for the GFG-style
        Skill -> Module -> Topic assessment flow.

        Question topic titles are aligned with SKILL_HIERARCHY,
        so every question attaches to an existing topic on the first run.
        """

        from skills.models import Skill, SkillTopic, AssessmentQuestion

        question_bank = {
            'Python': {
                'Variables & Data Types': [
                    {'text': 'Which of the following is used to create a variable in Python?',
                     'a': 'var x = 10', 'b': 'x = 10', 'c': 'int x = 10', 'd': 'let x = 10',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which data type is used to store True or False in Python?',
                     'a': 'String', 'b': 'Integer', 'c': 'Boolean', 'd': 'Float',
                     'correct': 'c', 'difficulty': 'easy'},
                    {'text': 'What is the type of the value 10.5 in Python?',
                     'a': 'int', 'b': 'str', 'c': 'float', 'd': 'bool',
                     'correct': 'c', 'difficulty': 'easy'},
                    {'text': 'Which function is used to determine the type of a Python value?',
                     'a': 'typeof()', 'b': 'type()', 'c': 'datatype()', 'd': 'checktype()',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which of these is immutable in Python?',
                     'a': 'List', 'b': 'Dictionary', 'c': 'Set', 'd': 'Tuple',
                     'correct': 'd', 'difficulty': 'medium'},
                ],

                'Operators & Expressions': [
                    {'text': 'What is the result of 10 // 3 in Python?',
                     'a': '3.33', 'b': '3', 'c': '1', 'd': '4',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which operator is used for exponentiation in Python?',
                     'a': '^', 'b': '**', 'c': '//', 'd': '%%',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'What is the result of 5 % 2?',
                     'a': '0', 'b': '1', 'c': '2', 'd': '2.5',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which operator checks whether two values are equal?',
                     'a': '=', 'b': '!=', 'c': '==', 'd': '===',
                     'correct': 'c', 'difficulty': 'easy'},
                    {'text': 'What is the result of 2 + 3 * 4?',
                     'a': '20', 'b': '14', 'c': '24', 'd': '10',
                     'correct': 'b', 'difficulty': 'medium'},
                ],

                'Control Flow': [
                    {'text': 'Which keyword is used to make a decision in Python?',
                     'a': 'if', 'b': 'when', 'c': 'switch', 'd': 'choose',
                     'correct': 'a', 'difficulty': 'easy'},
                    {'text': 'Which keyword immediately exits a loop?',
                     'a': 'stop', 'b': 'exit', 'c': 'break', 'd': 'return',
                     'correct': 'c', 'difficulty': 'easy'},
                    {'text': 'Which keyword skips the current iteration of a loop?',
                     'a': 'skip', 'b': 'continue', 'c': 'pass', 'd': 'next',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which loop is commonly used to iterate over a sequence?',
                     'a': 'for', 'b': 'repeat', 'c': 'loop', 'd': 'foreach',
                     'correct': 'a', 'difficulty': 'easy'},
                    {'text': 'What does the pass statement do?',
                     'a': 'Stops the program', 'b': 'Skips the entire loop',
                     'c': 'Does nothing', 'd': 'Restarts the loop',
                     'correct': 'c', 'difficulty': 'medium'},
                ],
            },

            'JavaScript': {
                'Variables & Scope': [
                    {'text': 'Which keyword declares a block-scoped variable that can be reassigned?',
                     'a': 'var', 'b': 'let', 'c': 'const', 'd': 'static',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which JavaScript value represents an intentionally empty value?',
                     'a': 'undefined', 'b': 'null', 'c': 'empty', 'd': 'void',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which operator returns the JavaScript type of a value?',
                     'a': 'type', 'b': 'typeof', 'c': 'datatype', 'd': 'instance',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which value is a JavaScript primitive?',
                     'a': 'Object', 'b': 'Array', 'c': 'String', 'd': 'Function Object',
                     'correct': 'c', 'difficulty': 'easy'},
                    {'text': 'What is the result of typeof null in JavaScript?',
                     'a': 'null', 'b': 'undefined', 'c': 'object', 'd': 'boolean',
                     'correct': 'c', 'difficulty': 'medium'},
                ],

                'Objects & this': [
                    {'text': 'Which method adds an element to the end of an array?',
                     'a': 'push()', 'b': 'add()', 'c': 'append()', 'd': 'insert()',
                     'correct': 'a', 'difficulty': 'easy'},
                    {'text': 'Which method removes the last element from an array?',
                     'a': 'remove()', 'b': 'delete()', 'c': 'pop()', 'd': 'shift()',
                     'correct': 'c', 'difficulty': 'easy'},
                    {'text': 'Which method creates a new array by transforming each element?',
                     'a': 'filter()', 'b': 'map()', 'c': 'reduce()', 'd': 'forEach()',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which method selects elements that satisfy a condition?',
                     'a': 'map()', 'b': 'findAll()', 'c': 'filter()', 'd': 'select()',
                     'correct': 'c', 'difficulty': 'easy'},
                    {'text': 'How do you access the name property of object user?',
                     'a': 'user->name', 'b': 'user.name', 'c': 'user::name', 'd': 'user[name()]',
                     'correct': 'b', 'difficulty': 'easy'},
                ],

                'Functions & Closures': [
                    {'text': 'Which keyword is used to define a traditional JavaScript function?',
                     'a': 'function', 'b': 'def', 'c': 'func', 'd': 'method',
                     'correct': 'a', 'difficulty': 'easy'},
                    {'text': 'What does a return statement do inside a function?',
                     'a': 'Repeats the function', 'b': 'Returns a value from the function',
                     'c': 'Stops JavaScript permanently', 'd': 'Creates a variable',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which syntax represents an arrow function?',
                     'a': 'function => ()', 'b': '() => {}', 'c': 'func() {}', 'd': 'arrow() {}',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'What is a callback function?',
                     'a': 'A function passed to another function',
                     'b': 'A function that never returns',
                     'c': 'A built-in browser function',
                     'd': 'A recursive function',
                     'correct': 'a', 'difficulty': 'medium'},
                    {'text': 'What concept allows an inner function to access variables from its outer function?',
                     'a': 'Inheritance', 'b': 'Closure', 'c': 'Hoisting', 'd': 'Prototype',
                     'correct': 'b', 'difficulty': 'medium'},
                ],
            },

            'React': {
                'Components & Props': [
                    {'text': 'What is a React component?',
                     'a': 'A database table', 'b': 'A reusable UI building block',
                     'c': 'A CSS file', 'd': 'A backend server',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which syntax is commonly used to return UI from a React component?',
                     'a': 'HTML only', 'b': 'JSX', 'c': 'SQL', 'd': 'XML only',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which is a valid functional React component?',
                     'a': 'function App() { return <div>Hello</div> }',
                     'b': 'component App() {}',
                     'c': 'React App = {}',
                     'd': 'create App() {}',
                     'correct': 'a', 'difficulty': 'easy'},
                    {'text': 'What are props in React?',
                     'a': 'Internal database records',
                     'b': 'Data passed from a parent component',
                     'c': 'CSS variables',
                     'd': 'Server routes',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Can a child component directly modify its props?',
                     'a': 'Yes', 'b': 'No', 'c': 'Only with CSS', 'd': 'Only in production',
                     'correct': 'b', 'difficulty': 'easy'},
                ],

                'useState': [
                    {'text': 'Which hook is commonly used to manage component state?',
                     'a': 'useState', 'b': 'useData', 'c': 'useValue', 'd': 'useComponent',
                     'correct': 'a', 'difficulty': 'easy'},
                    {'text': 'What happens when React state changes?',
                     'a': 'The component can re-render', 'b': 'The browser closes',
                     'c': 'The database resets', 'd': 'The component is deleted',
                     'correct': 'a', 'difficulty': 'easy'},
                    {'text': 'Which is the correct useState syntax?',
                     'a': 'const [count, setCount] = useState(0)',
                     'b': 'state count = 0',
                     'c': 'useState count = 0',
                     'd': 'const count = state(0)',
                     'correct': 'a', 'difficulty': 'medium'},
                    {'text': 'Can React state be updated directly by mutating the existing value?',
                     'a': 'Yes, always', 'b': 'No, use the setter function',
                     'c': 'Only in class components', 'd': 'Only on the server',
                     'correct': 'b', 'difficulty': 'medium'},
                    {'text': 'Which React hook returns both a value and a setter function?',
                     'a': 'useEffect', 'b': 'useState', 'c': 'useMemo', 'd': 'useRef',
                     'correct': 'b', 'difficulty': 'easy'},
                ],

                'useEffect': [
                    {'text': 'Which hook is commonly used for side effects?',
                     'a': 'useEffect', 'b': 'useSideEffect', 'c': 'useAction', 'd': 'useAsyncEffectOnly',
                     'correct': 'a', 'difficulty': 'easy'},
                    {'text': 'What does the dependency array in useEffect help control?',
                     'a': 'When the effect runs', 'b': 'CSS colors',
                     'c': 'Component names', 'd': 'Database indexes',
                     'correct': 'a', 'difficulty': 'medium'},
                    {'text': 'When does useEffect with an empty dependency array run?',
                     'a': 'On every render', 'b': 'Only once after the initial render',
                     'c': 'Never', 'd': 'Only on unmount',
                     'correct': 'b', 'difficulty': 'medium'},
                    {'text': 'What should useEffect return if it needs cleanup?',
                     'a': 'A promise', 'b': 'A cleanup function',
                     'c': 'A number', 'd': 'A boolean',
                     'correct': 'b', 'difficulty': 'medium'},
                    {'text': 'Which is a common use case for useEffect?',
                     'a': 'Fetching data from an API', 'b': 'Writing SQL queries',
                     'c': 'Creating database tables', 'd': 'Configuring web servers',
                     'correct': 'a', 'difficulty': 'easy'},
                ],
            },

            'SQL': {
                'SELECT & WHERE': [
                    {'text': 'Which SQL command is used to retrieve data?',
                     'a': 'GET', 'b': 'SELECT', 'c': 'FETCH TABLE', 'd': 'READ',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which clause filters rows in a SQL query?',
                     'a': 'FILTER', 'b': 'WHERE', 'c': 'WHEN', 'd': 'HAVING ONLY',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which keyword removes duplicate rows from a result?',
                     'a': 'UNIQUE', 'b': 'DISTINCT', 'c': 'REMOVE', 'd': 'DEDUP',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which operator is commonly used for pattern matching?',
                     'a': 'MATCH', 'b': 'LIKE', 'c': 'PATTERN', 'd': 'SEARCH',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which operator checks whether a value is within a range?',
                     'a': 'BETWEEN', 'b': 'RANGE', 'c': 'WITHIN', 'd': 'LIMIT',
                     'correct': 'a', 'difficulty': 'easy'},
                ],

                'JOIN Fundamentals': [
                    {'text': 'Which JOIN returns matching rows from both tables?',
                     'a': 'INNER JOIN', 'b': 'LEFT JOIN', 'c': 'FULL JOIN', 'd': 'CROSS JOIN',
                     'correct': 'a', 'difficulty': 'easy'},
                    {'text': 'Which JOIN returns all rows from the left table?',
                     'a': 'INNER JOIN', 'b': 'LEFT JOIN', 'c': 'RIGHT JOIN', 'd': 'CROSS JOIN',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which JOIN produces every combination of rows from two tables?',
                     'a': 'INNER JOIN', 'b': 'LEFT JOIN', 'c': 'CROSS JOIN', 'd': 'SELF JOIN',
                     'correct': 'c', 'difficulty': 'medium'},
                    {'text': 'A JOIN condition is commonly specified using which keyword?',
                     'a': 'ON', 'b': 'WITH', 'c': 'USING ONLY', 'd': 'MATCHES',
                     'correct': 'a', 'difficulty': 'easy'},
                    {'text': 'Which join can return rows from both tables even when there is no match?',
                     'a': 'INNER JOIN', 'b': 'FULL OUTER JOIN', 'c': 'SEMI JOIN', 'd': 'NATURAL ONLY',
                     'correct': 'b', 'difficulty': 'medium'},
                ],

                'GROUP BY': [
                    {'text': 'Which SQL function calculates the number of rows?',
                     'a': 'TOTAL()', 'b': 'COUNT()', 'c': 'ROWS()', 'd': 'NUMBER()',
                     'correct': 'b', 'difficulty': 'easy'},
                    {'text': 'Which function calculates the average?',
                     'a': 'AVG()', 'b': 'MEAN()', 'c': 'AVERAGE()', 'd': 'MID()',
                     'correct': 'a', 'difficulty': 'easy'},
                    {'text': 'Which function returns the largest value?',
                     'a': 'TOP()', 'b': 'HIGH()', 'c': 'MAX()', 'd': 'LARGE()',
                     'correct': 'c', 'difficulty': 'easy'},
                    {'text': 'Which clause groups rows for aggregate calculations?',
                     'a': 'GROUP BY', 'b': 'ORDER BY', 'c': 'COLLECT BY', 'd': 'AGGREGATE BY',
                     'correct': 'a', 'difficulty': 'easy'},
                    {'text': 'Which clause filters grouped results?',
                     'a': 'WHERE', 'b': 'FILTER', 'c': 'HAVING', 'd': 'GROUP WHERE',
                     'correct': 'c', 'difficulty': 'medium'},
                ],
            },
        }

        created = 0
        skipped = 0

        for skill_name, topics in question_bank.items():
            try:
                skill = Skill.objects.get(name=skill_name)
            except Skill.DoesNotExist:
                print(f'Skill not found: {skill_name}')
                skipped += 1
                continue

            for topic_title, questions in topics.items():
                try:
                    topic = SkillTopic.objects.get(
                        module__skill=skill,
                        title=topic_title,
                    )
                except SkillTopic.DoesNotExist:
                    print(
                        f'Topic not found: '
                        f'{skill_name} -> {topic_title}'
                    )
                    skipped += len(questions)
                    continue

                for q in questions:
                    question, was_created = AssessmentQuestion.objects.get_or_create(
                        skill=skill,
                        topic=topic,
                        text=q['text'],
                        defaults={
                            'option_a': q['a'],
                            'option_b': q['b'],
                            'option_c': q['c'],
                            'option_d': q['d'],
                            'correct_option': q['correct'],
                            'difficulty': q['difficulty'],
                        },
                    )

                    if was_created:
                        created += 1
                    else:
                        skipped += 1

        print(
            f'Added {created} skill assessment questions '
            f'({skipped} already existed/skipped).'
        )

    # ------------------------------------------------------------------
    def _create_demo_accounts(self):
        student_user = User.objects.create_user(
            username="student",
            email="student@skillbridge.demo",
            password=DEMO_PASSWORD,
            role="student",
            first_name="Rahul",
            last_name="Sharma",
        )

        StudentProfile.objects.create(
            user=student_user,
            full_name="Rahul Sharma",
            college="All India Institute of Ayurveda",
            degree="B.Tech",
            branch="Computer Science",
            year=3,
            cgpa=8.2,
            location="New Delhi, India",
            career_interest="Full Stack Development",
            avatar_color="#6366f1",
            bio="Aspiring full-stack developer passionate about building products that solve real problems.",
            profile_completion=85,
        )

        industry_user = User.objects.create_user(
            username="industry",
            email="industry@skillbridge.demo",
            password=DEMO_PASSWORD,
            role="industry",
            first_name="TechNova",
        )

        industry_profile = IndustryProfile.objects.create(
            user=industry_user,
            company_name="TechNova Solutions",
            industry_type="Software & IT Services",
            location="Bengaluru, India",
            website="https://technova.example.com",
            logo_color="#0ea5e9",
            about="A fast-growing software company building cloud-native products for enterprises.",
        )

        faculty_user = User.objects.create_user(
            username="faculty",
            email="faculty@skillbridge.demo",
            password=DEMO_PASSWORD,
            role="faculty",
            first_name="Dr. Anita",
            last_name="Verma",
        )

        FacultyProfile.objects.create(
            user=faculty_user,
            full_name="Dr. Anita Verma",
            college="All India Institute of Ayurveda",
            department="Computer Science & Engineering",
            designation="Associate Professor",
            research_interest="Applied Machine Learning, EdTech",
        )

        admin_user = User.objects.create_user(
            username="admin",
            email="admin@skillbridge.demo",
            password=DEMO_PASSWORD,
            role="admin",
            first_name="Institution",
            last_name="Admin",
        )

        InstitutionProfile.objects.create(
            user=admin_user,
            institution_name="All India Institute of Ayurveda",
            location="New Delhi, India",
        )

        return {
            "student": student_user,
            "industry": industry_profile,
            "faculty": faculty_user,
            "admin": admin_user,
        }

    # ------------------------------------------------------------------
    STUDENT_NAMES = [
        ("Ananya", "Iyer", "Computer Science"),
        ("Arjun", "Mehta", "Information Technology"),
        ("Priya", "Nair", "Computer Science"),
        ("Rohan", "Kapoor", "Electronics & Communication"),
        ("Sneha", "Reddy", "Computer Science"),
        ("Vikram", "Singh", "Information Technology"),
        ("Isha", "Gupta", "Computer Science"),
        ("Karan", "Malhotra", "Mechanical Engineering"),
        ("Divya", "Joshi", "Computer Science"),
        ("Aditya", "Rao", "Information Technology"),
        ("Meera", "Pillai", "Electronics & Communication"),
        ("Siddharth", "Bhatt", "Computer Science"),
    ]

    COLLEGES = [
        "All India Institute of Ayurveda",
        "National Institute of Technology",
        "Delhi Technological University",
        "IIIT Bengaluru",
    ]

    CITIES = [
        "New Delhi, India",
        "Bengaluru, India",
        "Pune, India",
        "Hyderabad, India",
        "Chennai, India",
    ]

    INTERESTS = [
        "Full Stack Development",
        "Data Science",
        "Cloud Engineering",
        "Machine Learning",
        "Backend Development",
        "Frontend Development",
        "DevOps",
        "Mobile Development",
    ]

    def _create_students(self, skills):
        students = []

        for i, (fname, lname, branch) in enumerate(self.STUDENT_NAMES):
            username = f"{fname.lower()}{lname.lower()}"

            user = User.objects.create_user(
                username=username,
                email=f"{username}@skillbridge.demo",
                password=DEMO_PASSWORD,
                role="student",
                first_name=fname,
                last_name=lname,
            )

            cgpa = round(random.uniform(6.2, 9.4), 2)
            year = random.choice([2, 3, 4])

            profile = StudentProfile.objects.create(
                user=user,
                full_name=f"{fname} {lname}",
                college=random.choice(self.COLLEGES),
                degree="B.Tech",
                branch=branch,
                year=year,
                cgpa=cgpa,
                location=random.choice(self.CITIES),
                career_interest=random.choice(self.INTERESTS),
                avatar_color=random.choice(
                    ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
                ),
                bio=f"{branch} student exploring opportunities in {random.choice(self.INTERESTS).lower()}.",
                profile_completion=random.randint(55, 95),
            )

            skill_names = list(skills.keys())
            random.shuffle(skill_names)

            for name in skill_names[:random.randint(10, 16)]:
                StudentSkill.objects.create(
                    student=user,
                    skill=skills[name],
                    score=round(random.uniform(20, 92), 1),
                )

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
                username=username,
                email=f"{username}@skillbridge.demo",
                password=DEMO_PASSWORD,
                role="industry",
            )

            profile = IndustryProfile.objects.create(
                user=user,
                company_name=name,
                industry_type=itype,
                location=loc,
                logo_color=color,
                website=f"https://{username}.example.com",
                about=f"{name} is a leading company in {itype.lower()} building innovative solutions for global clients.",
            )

            companies.append(profile)

        return companies

    # ------------------------------------------------------------------
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
                company=company,
                title=title,
                description=(
                    f"Join {company.company_name} as a {title} and work on real production systems "
                    f"alongside experienced engineers. You'll contribute to live projects, "
                    f"participate in code reviews, and gain hands-on industry exposure."
                ),
                location=company.location,
                mode=random.choice(["remote", "hybrid", "onsite"]),
                duration=random.choice(["8 weeks", "10 weeks", "3 months", "6 months"]),
                stipend=f"₹{random.choice([8, 12, 15, 20, 25, 30])},000/month",
                min_cgpa=round(random.uniform(6.0, 7.5), 1),
                deadline=deadline,
            )

            internship.required_skills.set(
                [skills[s] for s in skill_names if s in skills]
            )

            internships.append(internship)

        return internships

    # ------------------------------------------------------------------
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
                company=company,
                title=title,
                description=(
                    f"{company.company_name} is hiring a {title} to design, build and ship features used "
                    f"by thousands of users. You will collaborate closely with product and design teams."
                ),
                location=company.location,
                experience_required=exp,
                salary=salary,
                min_cgpa=round(random.uniform(6.0, 7.5), 1),
                deadline=deadline,
            )

            job.required_skills.set(
                [skills[s] for s in skill_names if s in skills]
            )

            jobs.append(job)

        return jobs

    # ------------------------------------------------------------------
    def _create_industry_assessments(self, companies, students, demo_student):
        """Feature Groups 1-4: industry-created assessments as an application prerequisite."""

        technova = next(
            (c for c in companies if c.company_name == "TechNova Solutions"),
            companies[-1],
        )

        cloudera = next(
            (c for c in companies if c.company_name == "Cloudera Systems"),
            companies[0],
        )

        a1 = IndustryAssessment.objects.create(
            company=technova,
            title="Full Stack Developer Assessment",
            description=(
                "A short technical + aptitude assessment covering the core skills TechNova looks "
                "for in Full Stack Developer applicants."
            ),
            assessment_type="questionnaire",
            duration_minutes=25,
            passing_score=60,
            max_attempts=2,
            active=True,
        )

        a1_questions = [
            ("technical", "mcq",
             "Which HTTP method is idempotent and safe for retrieving data?",
             "GET", "POST", "DELETE", "PATCH", "a", 1),
            ("technical", "mcq",
             "In React, which hook lets a component manage local state?",
             "useEffect", "useState", "useContext", "useRef", "b", 1),
            ("technical", "mcq",
             "Which SQL clause filters rows AFTER grouping (e.g. HAVING COUNT(*) > 5)?",
             "WHERE", "HAVING", "GROUP BY", "ORDER BY", "b", 1),
            ("technical", "mcq",
             "What does REST stand for in the context of web APIs?",
             "Representational State Transfer", "Remote Endpoint Service Type",
             "Relational External Storage Table", "Real-time Event Streaming Trigger", "a", 1),
            ("logical", "mcq",
             "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely:",
             "Lazzies", "Razzies only", "Not Lazzies", "Unrelated to Lazzies", "a", 1),
            ("quantitative", "mcq",
             "A train travels 180 km in 3 hours. What is its average speed?",
             "45 km/h", "60 km/h", "50 km/h", "90 km/h", "b", 1),
            ("numerical", "mcq",
             "What is 15% of 240?",
             "30", "36", "24", "40", "b", 1),
            ("problem_solving", "mcq",
             "You need to find a specific value in a sorted array of 1 million elements as fast as possible. Which approach is best?",
             "Linear scan", "Binary search", "Bubble sort then scan", "Random sampling", "b", 1),
        ]

        for category, qtype, text, oa, ob, oc, od, correct, marks in a1_questions:
            IndustryAssessmentQuestion.objects.create(
                assessment=a1,
                question_type=qtype,
                category=category,
                text=text,
                option_a=oa,
                option_b=ob,
                option_c=oc,
                option_d=od,
                correct_option=correct,
                marks=marks,
                order=a1.questions.count(),
            )

        technova_internship = (
            Internship.objects.filter(company=technova).order_by("id").first()
        )
        technova_job = (
            Job.objects.filter(company=technova).order_by("id").first()
        )

        if technova_internship:
            technova_internship.required_assessment = a1
            technova_internship.save()

        if technova_job:
            technova_job.required_assessment = a1
            technova_job.save()

        a2 = IndustryAssessment.objects.create(
            company=cloudera,
            title="Cloud Infrastructure Aptitude Test",
            description=(
                "Aptitude screening used by Cloudera Systems for cloud engineering internship applicants."
            ),
            assessment_type="aptitude",
            duration_minutes=20,
            passing_score=50,
            max_attempts=1,
            active=True,
        )

        a2_questions = [
            ("logical", "mcq",
             "Which number completes the series: 2, 6, 12, 20, 30, ?",
             "36", "40", "42", "44", "c", 1),
            ("verbal", "mcq",
             "Choose the word most nearly OPPOSITE in meaning to 'redundant':",
             "Excessive", "Essential", "Repetitive", "Obsolete", "b", 1),
            ("numerical", "mcq",
             "If a server processes 240 requests per minute, how many does it process in 45 seconds?",
             "150", "180", "200", "160", "b", 1),
            ("quantitative", "mcq",
             "A cloud storage plan costs ₹500 for 100GB. What is the cost per GB?",
             "₹5", "₹50", "₹0.5", "₹500", "a", 1),
            ("problem_solving", "mcq",
             "A distributed system's three replicas disagree on a value. What should it generally use to resolve this?",
             "The oldest replica", "A random replica", "Majority/consensus voting", "The largest value", "c", 1),
        ]

        for category, qtype, text, oa, ob, oc, od, correct, marks in a2_questions:
            IndustryAssessmentQuestion.objects.create(
                assessment=a2,
                question_type=qtype,
                category=category,
                text=text,
                option_a=oa,
                option_b=ob,
                option_c=oc,
                option_d=od,
                correct_option=correct,
                marks=marks,
                order=a2.questions.count(),
            )

        cloudera_internship = (
            Internship.objects.filter(company=cloudera).order_by("id").first()
        )

        if cloudera_internship:
            cloudera_internship.required_assessment = a2
            cloudera_internship.save()

        other_students = [s for s in students if s != demo_student][:5]

        a2_question_list = list(a2.questions.all())

        for s in other_students:
            correct_ratio = random.uniform(0.2, 1.0)

            attempt = IndustryAssessmentAttempt.objects.create(
                assessment=a2,
                student=s,
                attempt_number=1,
            )

            total_marks = 0
            scored_marks = 0
            category_totals = {}

            for q in a2_question_list:
                is_correct = random.random() < correct_ratio

                IndustryAssessmentAnswer.objects.create(
                    attempt=attempt,
                    question=q,
                    selected_option=(
                        q.correct_option if is_correct
                        else random.choice(["a", "b", "c", "d"])
                    ),
                    is_correct=is_correct,
                )

                total_marks += q.marks

                if is_correct:
                    scored_marks += q.marks

                bucket = category_totals.setdefault(
                    q.category, {"correct": 0, "total": 0}
                )
                bucket["total"] += 1

                if is_correct:
                    bucket["correct"] += 1

            percentage = (
                round((scored_marks / total_marks) * 100, 1)
                if total_marks else 0
            )

            attempt.total_marks = total_marks
            attempt.scored_marks = scored_marks
            attempt.percentage = percentage
            attempt.passed = percentage >= a2.passing_score
            attempt.category_breakdown = category_totals
            attempt.save()

        return {
            "technova_assessment": a1,
            "cloudera_assessment": a2,
        }

    # ------------------------------------------------------------------
    LEARNING_TEMPLATES = [
        (
            "React for Modern Web Development",
            "YouTube",
            "React",
            "6 weeks",
            "course",
            "https://www.youtube.com/results?search_query=React+full+course+for+beginners",
        ),
        (
            "AWS Cloud Practitioner Fundamentals",
            "Coursera",
            "AWS",
            "4 weeks",
            "certification",
            "https://www.coursera.org/search?query=AWS%20Cloud%20Practitioner",
        ),
        (
            "Python for Data Science",
            "Coursera",
            "Python",
            "8 weeks",
            "course",
            "https://www.coursera.org/search?query=Python%20for%20Data%20Science",
        ),
        (
            "Mastering SQL for Analysts",
            "YouTube",
            "SQL",
            "3 weeks",
            "course",
            "https://www.youtube.com/results?search_query=SQL+full+course+for+beginners",
        ),
        (
            "Machine Learning Foundations",
            "Coursera",
            "Machine Learning",
            "10 weeks",
            "course",
            "https://www.coursera.org/search?query=Machine%20Learning%20Foundations",
        ),
        (
            "Docker & Containers Bootcamp",
            "YouTube",
            "Docker",
            "2 weeks",
            "workshop",
            "https://www.youtube.com/results?search_query=Docker+full+course+for+beginners",
        ),
        (
            "Effective Technical Communication",
            "Coursera",
            "Communication",
            "2 weeks",
            "workshop",
            "https://www.coursera.org/search?query=technical%20communication",
        ),
        (
            "Advanced JavaScript & TypeScript",
            "YouTube",
            "TypeScript",
            "5 weeks",
            "course",
            "https://www.youtube.com/results?search_query=JavaScript+TypeScript+full+course",
        ),
        (
            "System Design Interview Prep",
            "YouTube",
            "System Design",
            "4 weeks",
            "mentorship",
            "https://www.youtube.com/results?search_query=system+design+interview+preparation",
        ),
        (
            "Statistics for Data-Driven Decisions",
            "Coursera",
            "Statistics",
            "4 weeks",
            "course",
            "https://www.coursera.org/search?query=statistics%20for%20data%20science",
        ),
        (
            "Cybersecurity Essentials",
            "Coursera",
            "Cybersecurity Basics",
            "3 weeks",
            "certification",
            "https://www.coursera.org/search?query=cybersecurity%20essentials",
        ),
        (
            "Leadership for Young Engineers",
            "YouTube",
            "Leadership",
            "3 weeks",
            "mentorship",
            "https://www.youtube.com/results?search_query=leadership+skills+for+engineers",
        ),
    ]

    def _create_learning_programs(self, skills):
        for title, provider, skill_name, duration, ptype, url in self.LEARNING_TEMPLATES:
            LearningProgram.objects.create(
                title=title,
                provider=provider,
                skill=skills[skill_name],
                duration=duration,
                program_type=ptype,
                url=url,
                description=(
                    f"A focused {duration} program to strengthen your "
                    f"{skill_name} proficiency, aligned with current industry expectations."
                ),
            )

    # ------------------------------------------------------------------
    PROJECT_TEMPLATES = [
        ("Campus Event Management System", "Django, React, PostgreSQL",
         "Full-stack platform for managing college fests and event registrations."),
        ("Personal Expense Tracker", "React, Node.js, MongoDB",
         "A responsive web app to track daily expenses with visual analytics."),
        ("Skill Gap Visualizer", "Python, Flask, Chart.js",
         "A dashboard visualizing skill gaps between students and industry benchmarks."),
        ("E-Commerce Storefront", "React, Django REST Framework, SQLite",
         "A mini e-commerce storefront with cart, checkout and order tracking."),
        ("Weather Prediction Model", "Python, Scikit-learn, Pandas",
         "ML model predicting rainfall using historical weather datasets."),
        ("Chat Application", "React, WebSockets, Node.js",
         "Real-time chat app supporting group conversations and notifications."),
        ("Library Management System", "Java, MySQL",
         "Desktop application to manage book issue/return and inventory."),
        ("Portfolio Website Builder", "React, Tailwind CSS",
         "A drag-and-drop tool for students to build personal portfolio sites."),
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
        ("Winner - Smart India Hackathon (Institute Round)",
         "Led a 6-member team to win the internal SIH selection round."),
        ("Best Project Award - Annual Tech Fest",
         "Recognised for the most innovative student project."),
        ("1st Place - Inter-college Coding Contest",
         "Solved the highest number of problems within time limit."),
        ("Published Research Paper",
         "Co-authored a paper on applied machine learning in a peer-reviewed student journal."),
    ]

    def _create_portfolios(self, students, skills):
        for student in students:
            for title, tech, desc in random.sample(
                self.PROJECT_TEMPLATES, k=random.randint(1, 3)
            ):
                Project.objects.create(
                    student=student,
                    title=title,
                    description=desc,
                    tech_stack=tech,
                    link=(
                        "https://github.com/skillbridge-demo/"
                        + title.lower().replace(" ", "-")
                    ),
                )

            for title, issuer in random.sample(
                self.CERT_TEMPLATES, k=random.randint(0, 2)
            ):
                Certification.objects.create(
                    student=student,
                    title=title,
                    issuer=issuer,
                    date_earned=date.today() - timedelta(days=random.randint(30, 500)),
                )

            if random.random() > 0.5:
                title, desc = random.choice(self.ACHIEVEMENT_TEMPLATES)

                Achievement.objects.create(
                    student=student,
                    title=title,
                    description=desc,
                    date_earned=date.today() - timedelta(days=random.randint(10, 400)),
                )

    # ------------------------------------------------------------------
    def _create_applications(self, students, internships, jobs):
        statuses = [
            "applied",
            "under_review",
            "shortlisted",
            "interview",
            "selected",
            "rejected",
        ]

        seen = set()
        count = 0

        while count < 24:
            student = random.choice(students)
            target_type = random.choice(["internship", "job"])

            target = (
                random.choice(internships)
                if target_type == "internship"
                else random.choice(jobs)
            )

            key = (student.id, target_type, target.id)

            if key in seen:
                continue

            seen.add(key)

            kwargs = {
                "student": student,
                "status": random.choice(statuses),
                "match_score": round(random.uniform(45, 96), 1),
            }

            if target_type == "internship":
                kwargs["internship"] = target
            else:
                kwargs["job"] = target

            Application.objects.create(**kwargs)
            count += 1

    # ------------------------------------------------------------------
    INTERVIEW_BANK = {
        "Frontend Developer": {
            "beginner": [
                ("What is the difference between HTML and HTML5?",
                 ["semantic", "video", "audio", "canvas", "api"]),
                ("Explain the box model in CSS.",
                 ["margin", "border", "padding", "content"]),
                ("What is the virtual DOM in React?",
                 ["virtual", "dom", "diffing", "render", "performance"]),
            ],
            "intermediate": [
                ("How does state management differ from props in React?",
                 ["state", "props", "immutable", "component", "re-render"]),
                ("Explain React hooks like useState and useEffect.",
                 ["hook", "useeffect", "usestate", "lifecycle", "dependency"]),
                ("How would you optimize the performance of a React app?",
                 ["memo", "lazy", "code splitting", "virtualization", "render"]),
            ],
            "advanced": [
                ("Explain server-side rendering vs client-side rendering trade-offs.",
                 ["ssr", "csr", "seo", "hydration", "performance"]),
                ("How would you design a scalable component library?",
                 ["reusable", "design system", "props", "theme", "accessibility"]),
            ],
        },
        "Backend Developer": {
            "beginner": [
                ("What is a REST API?",
                 ["rest", "http", "endpoint", "json", "stateless"]),
                ("Explain the difference between SQL and NoSQL databases.",
                 ["sql", "nosql", "schema", "relational", "document"]),
                ("What is an index in a database?",
                 ["index", "query", "performance", "lookup"]),
            ],
            "intermediate": [
                ("How would you design an authentication system for an API?",
                 ["jwt", "token", "session", "hash", "authorization"]),
                ("Explain database normalization.",
                 ["normalization", "redundancy", "foreign key", "schema"]),
                ("How do you handle concurrent requests to the same resource?",
                 ["lock", "transaction", "race condition", "concurrency"]),
            ],
            "advanced": [
                ("How would you scale a backend system to handle 1 million users?",
                 ["load balancer", "cache", "horizontal scaling", "sharding", "queue"]),
                ("Explain the CAP theorem.",
                 ["consistency", "availability", "partition", "tradeoff"]),
            ],
        },
        "Data Scientist": {
            "beginner": [
                ("What is overfitting in machine learning?",
                 ["overfitting", "generalization", "training", "variance"]),
                ("Explain the difference between supervised and unsupervised learning.",
                 ["supervised", "unsupervised", "label", "cluster"]),
            ],
            "intermediate": [
                ("How would you handle missing data in a dataset?",
                 ["imputation", "missing", "mean", "drop", "null"]),
                ("Explain precision and recall.",
                 ["precision", "recall", "false positive", "false negative"]),
                ("What is feature engineering and why does it matter?",
                 ["feature", "engineering", "transform", "model performance"]),
            ],
            "advanced": [
                ("How would you deploy a machine learning model to production?",
                 ["deployment", "api", "monitoring", "versioning", "pipeline"]),
            ],
        },
        "Full Stack Developer": {
            "beginner": [
                ("What does full-stack development mean to you?",
                 ["frontend", "backend", "database", "end to end"]),
                ("What is the role of an API in a full-stack app?",
                 ["api", "frontend", "backend", "communication"]),
            ],
            "intermediate": [
                ("How do you structure a React + Django project?",
                 ["react", "django", "rest", "structure", "separation"]),
                ("Explain how you would deploy a full-stack application.",
                 ["deployment", "server", "database", "environment"]),
            ],
            "advanced": [
                ("How would you design the architecture for a scalable full-stack SaaS product?",
                 ["microservice", "scalability", "database", "caching", "architecture"]),
            ],
        },
    }

    def _create_interview_questions(self):
        for role, difficulties in self.INTERVIEW_BANK.items():
            for difficulty, questions in difficulties.items():
                for text, keywords in questions:
                    InterviewQuestion.objects.create(
                        role=role,
                        difficulty=difficulty,
                        text=text,
                        expected_keywords=keywords,
                    )

    # ------------------------------------------------------------------
    def _boost_demo_student(self, student, skills):
        """Give Rahul (the demo student) a compelling, story-friendly skill profile."""

        StudentSkill.objects.filter(student=student).delete()

        boosted = {
            "Python": 85,
            "SQL": 70,
            "Data Structures": 78,
            "Git & Version Control": 80,
            "Problem Solving": 82,
            "Teamwork": 75,
            "Adaptability": 70,
            "JavaScript": 55,
            "React": 45,
            "AWS": 30,
            "HTML/CSS": 60,
            "Communication": 48,
            "Cloud Computing": 35,
            "Database": 68,
            "Machine Learning": 40,
        }

        for name, score in boosted.items():
            StudentSkill.objects.create(
                student=student,
                skill=skills[name],
                score=score,
            )