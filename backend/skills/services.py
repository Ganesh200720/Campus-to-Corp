"""
SkillBridge Intelligence
=========================
Transparent, deterministic (rule-based) scoring engine that powers:
 - Skill gap analysis
 - Career / role recommendations
 - Internship & job matching
 - Candidate ranking (industry side)
 - Placement readiness score

Designed as a clean service layer so a real ML/LLM model can later be
swapped in without touching the callers (views only call these functions).
"""
from .models import Skill, StudentSkill

# ---------------------------------------------------------------------------
# Role -> required skills profile (name -> required proficiency 0-100)
# This acts as the "industry benchmark" used throughout the platform.
# ---------------------------------------------------------------------------
ROLE_PROFILES = {
    "Full Stack Developer": {
        "Python": 70, "JavaScript": 80, "React": 80, "SQL": 75, "AWS": 60,
        "Problem Solving": 70, "Communication": 55,
    },
    "Frontend Developer": {
        "JavaScript": 85, "React": 85, "HTML/CSS": 85, "Communication": 60,
        "Problem Solving": 60, "TypeScript": 60,
    },
    "Backend Developer": {
        "Python": 80, "SQL": 80, "Database": 80, "Cloud Computing": 60,
        "Problem Solving": 75, "System Design": 60,
    },
    "Data Scientist": {
        "Python": 85, "Machine Learning": 80, "SQL": 75, "Statistics": 75,
        "Data Structures": 60, "Communication": 55,
    },
    "Cloud Engineer": {
        "AWS": 85, "Cloud Computing": 85, "Docker": 70, "Python": 60,
        "Problem Solving": 65, "Networking": 65,
    },
    "ML Engineer": {
        "Python": 85, "Machine Learning": 85, "Data Structures": 70,
        "SQL": 60, "Statistics": 65, "Cloud Computing": 55,
    },
    "DevOps Engineer": {
        "Docker": 80, "Cloud Computing": 80, "AWS": 75, "Python": 60,
        "Problem Solving": 70, "Networking": 60,
    },
    "Mobile App Developer": {
        "JavaScript": 70, "React": 65, "Problem Solving": 65,
        "Database": 55, "Communication": 55,
    },
}

CORE_SKILL_LIST = [
    ("Python", "technical"), ("JavaScript", "technical"), ("TypeScript", "technical"),
    ("React", "technical"), ("HTML/CSS", "technical"), ("Node.js", "technical"),
    ("SQL", "technical"), ("Database", "technical"), ("Data Structures", "technical"),
    ("Machine Learning", "technical"), ("Statistics", "technical"),
    ("Cloud Computing", "technical"), ("AWS", "technical"), ("Docker", "technical"),
    ("Networking", "technical"), ("System Design", "technical"), ("Java", "technical"),
    ("Git & Version Control", "technical"), ("Testing & QA", "technical"),
    ("Cybersecurity Basics", "technical"),
    ("Communication", "soft"), ("Problem Solving", "soft"), ("Leadership", "soft"),
    ("Teamwork", "soft"), ("Adaptability", "soft"), ("Time Management", "soft"),
]


def get_student_skill_map(student):
    """Return {skill_name: score} for a student, defaulting missing skills to 0."""
    scores = {s.skill.name: s.score for s in StudentSkill.objects.filter(student=student).select_related('skill')}
    return scores


def compute_skill_gap(student, role_name):
    """Compare a student's skills to a target role's benchmark."""
    student_scores = get_student_skill_map(student)
    profile = ROLE_PROFILES.get(role_name, {})
    gap_report = []
    for skill_name, required in profile.items():
        current = round(student_scores.get(skill_name, 0), 1)
        gap = round(required - current, 1)
        if gap <= 0:
            status = "Strong"
        elif gap <= 15:
            status = "Minor Gap"
        else:
            status = "Major Gap"
        gap_report.append({
            "skill": skill_name,
            "current": current,
            "required": required,
            "gap": max(gap, 0),
            "status": status,
        })
    gap_report.sort(key=lambda x: -x["gap"])
    return gap_report


def _role_match_score(student_scores, profile):
    """Weighted compatibility: how well student scores meet role requirements (0-100)."""
    if not profile:
        return 0, [], []
    total_weight = sum(profile.values())
    achieved = 0
    matched, gaps = [], []
    for skill_name, required in profile.items():
        current = student_scores.get(skill_name, 0)
        ratio = min(current / required, 1.0) if required else 1.0
        achieved += ratio * required
        if current >= required * 0.8:
            matched.append(skill_name)
        else:
            gaps.append(skill_name)
    score = round((achieved / total_weight) * 100, 1) if total_weight else 0
    return score, matched, gaps


def recommend_roles(student, top_n=5):
    """Rank all known roles by fit for this student, with explanations."""
    student_scores = get_student_skill_map(student)
    results = []
    for role_name, profile in ROLE_PROFILES.items():
        score, matched, gaps = _role_match_score(student_scores, profile)
        results.append({
            "role": role_name,
            "match_percent": score,
            "matched_skills": matched,
            "skill_gaps": gaps,
            "explanation": (
                f"Strong in {', '.join(matched[:4])}." if matched else "Limited overlap with current skills."
            ) + (f" Improve {', '.join(gaps[:3])} to raise this match." if gaps else ""),
        })
    results.sort(key=lambda x: -x["match_percent"])
    return results[:top_n]


def compute_opportunity_match(student, required_skill_names, min_cgpa=0, student_cgpa=0, interest=None, role_hint=None):
    """Generic match score used for internships & jobs (0-100) with explanation."""
    student_scores = get_student_skill_map(student)
    if not required_skill_names:
        skill_score, matched, gaps = 60, [], []
    else:
        total = len(required_skill_names)
        hit = 0
        matched, gaps = [], []
        for name in required_skill_names:
            current = student_scores.get(name, 0)
            if current >= 60:
                hit += 1
                matched.append(name)
            elif current >= 35:
                hit += 0.5
                gaps.append(name)
            else:
                gaps.append(name)
        skill_score = round((hit / total) * 100, 1) if total else 60

    eligible = student_cgpa >= min_cgpa
    eligibility_score = 100 if eligible else 40

    interest_score = 100 if (role_hint and interest and role_hint.lower() in interest.lower()) else 70

    final = round(skill_score * 0.65 + eligibility_score * 0.2 + interest_score * 0.15, 1)
    final = min(final, 99)
    return {
        "match_percent": final,
        "matched_skills": matched,
        "skill_gaps": gaps,
        "cgpa_eligible": eligible,
    }


def compute_placement_readiness(student):
    """0-100 composite readiness score with breakdown + advice."""
    from portfolio.models import Project, Certification
    from opportunities.models import Application
    from skills.models import AssessmentResult

    student_scores = get_student_skill_map(student)
    avg_skill = sum(student_scores.values()) / len(student_scores) if student_scores else 0

    last_result = AssessmentResult.objects.filter(student=student).order_by('-taken_at').first()
    assessment_perf = last_result.overall_score if last_result else 0

    project_count = Project.objects.filter(student=student).count()
    project_score = min(project_count * 25, 100)

    cert_count = Certification.objects.filter(student=student).count()
    cert_score = min(cert_count * 30, 100)

    internship_apps = Application.objects.filter(student=student, internship__isnull=False).exclude(status='rejected').count()
    internship_score = min(internship_apps * 40, 100)

    soft_skills = [v for k, v in student_scores.items() if k in
                   ("Communication", "Leadership", "Teamwork", "Adaptability", "Time Management", "Problem Solving")]
    soft_score = sum(soft_skills) / len(soft_skills) if soft_skills else 0

    readiness = (
        avg_skill * 0.40 +
        assessment_perf * 0.20 +
        project_score * 0.15 +
        cert_score * 0.10 +
        internship_score * 0.10 +
        soft_score * 0.05
    )
    readiness = round(min(readiness, 100), 1)

    breakdown = {
        "skill_compatibility": round(avg_skill, 1),
        "assessment_performance": round(assessment_perf, 1),
        "projects": project_score,
        "certifications": cert_score,
        "internship_experience": internship_score,
        "soft_skills": round(soft_score, 1),
    }

    weak_areas = sorted(breakdown.items(), key=lambda x: x[1])[:2]
    advice_map = {
        "skill_compatibility": "Strengthen core technical skills through the Learning Hub.",
        "assessment_performance": "Retake the Skill Assessment after focused practice.",
        "projects": "Build and showcase 2-3 real projects on your portfolio.",
        "certifications": "Earn an industry-recognised certification in your target domain.",
        "internship_experience": "Apply to at least one matched internship this month.",
        "soft_skills": "Practice communication and teamwork through mock interviews.",
    }
    recommended_actions = [advice_map[k] for k, _ in weak_areas]

    return {
        "readiness_score": readiness,
        "breakdown": breakdown,
        "recommended_actions": recommended_actions,
    }


def get_assessment_status(student, assessment):
    """Return the student's status against an IndustryAssessment:
    'not_attempted' | 'failed' | 'passed', plus best attempt info."""
    from .models import IndustryAssessmentAttempt

    attempts = IndustryAssessmentAttempt.objects.filter(student=student, assessment=assessment).order_by('-percentage')
    if not attempts.exists():
        return {"status": "not_attempted", "attempts_used": 0, "best_percentage": None}
    best = attempts.first()
    attempts_used = IndustryAssessmentAttempt.objects.filter(student=student, assessment=assessment).count()
    status = "passed" if best.passed else "failed"
    return {"status": status, "attempts_used": attempts_used, "best_percentage": best.percentage}


def industry_skill_demand():
    """Aggregate required_skills across all active internships & jobs -> demand %."""
    from opportunities.models import Internship, Job
    from collections import Counter

    counter = Counter()
    total_postings = 0
    for internship in Internship.objects.filter(active=True).prefetch_related('required_skills'):
        total_postings += 1
        for s in internship.required_skills.all():
            counter[s.name] += 1
    for job in Job.objects.filter(active=True).prefetch_related('required_skills'):
        total_postings += 1
        for s in job.required_skills.all():
            counter[s.name] += 1

    if total_postings == 0:
        return []
    demand = [{"skill": name, "demand_percent": round(count / total_postings * 100, 1)}
              for name, count in counter.items()]
    demand.sort(key=lambda x: -x["demand_percent"])
    return demand
