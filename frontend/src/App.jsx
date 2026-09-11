import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

import Landing from './pages/Landing'
import Login from './pages/Login'

// Student
import StudentDashboard from './pages/student/StudentDashboard'
import StudentProfile from './pages/student/Profile'
import Assessment from './pages/student/Assessment'
import SkillAnalysis from './pages/student/SkillAnalysis'
import CareerGuidance from './pages/student/CareerGuidance'
import Internships from './pages/student/Internships'
import Jobs from './pages/student/Jobs'
import MyApplications from './pages/student/MyApplications'
import LearningHub from './pages/student/LearningHub'
import MockInterview from './pages/student/MockInterview'
import Portfolio from './pages/student/Portfolio'
import CompanyAssessments from './pages/student/CompanyAssessments'
import TakeCompanyAssessment from './pages/student/TakeCompanyAssessment'

// Industry
import IndustryDashboard from './pages/industry/IndustryDashboard'
import PostOpportunity from './pages/industry/PostOpportunity'
import IndustryInternships from './pages/industry/IndustryInternships'
import IndustryJobs from './pages/industry/IndustryJobs'
import IndustryApplications from './pages/industry/IndustryApplications'
import CandidateMatching from './pages/industry/CandidateMatching'
import IndustryAssessments from './pages/industry/Assessments'
import AssessmentDetail from './pages/industry/AssessmentDetail'

// Collaboration - Industry
import PostCollaboration from './pages/industry/PostCollaboration'
import CollaborationRequests from './pages/industry/CollaborationRequests'
import IndustryMyCollaborations from './pages/industry/MyCollaborations'
import Candidates from './pages/industry/Candidates'

// Faculty
import FacultyDashboard from './pages/faculty/FacultyDashboard'
import FacultyOpportunities from './pages/faculty/FacultyOpportunities'

// Collaboration - Faculty
import FacultyCollaborations from './pages/faculty/Collaborations'
import FacultyMyCollaborations from './pages/faculty/MyCollaborations'

// Institution
import AdminDashboard from './pages/admin/AdminDashboard'
import InstitutionStudents from './pages/admin/InstitutionStudents'

// Collaboration - Institution
import AdminCollaborations from './pages/admin/Collaborations'
import AdminMyCollaborations from './pages/admin/MyCollaborations'

function Wrapped({ role, children }) {
  return (
    <ProtectedRoute role={role}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}

function HomeRedirect() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <Landing />

  return <Navigate to={`/${user.role}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />

          {/* ==================== STUDENT ==================== */}

          <Route
            path="/student"
            element={
              <Wrapped role="student">
                <StudentDashboard />
              </Wrapped>
            }
          />

          <Route
            path="/student/profile"
            element={
              <Wrapped role="student">
                <StudentProfile />
              </Wrapped>
            }
          />

          <Route
            path="/student/assessment"
            element={
              <Wrapped role="student">
                <Assessment />
              </Wrapped>
            }
          />

          <Route
            path="/student/skill-analysis"
            element={
              <Wrapped role="student">
                <SkillAnalysis />
              </Wrapped>
            }
          />

          <Route
            path="/student/career-guidance"
            element={
              <Wrapped role="student">
                <CareerGuidance />
              </Wrapped>
            }
          />

          <Route
            path="/student/internships"
            element={
              <Wrapped role="student">
                <Internships />
              </Wrapped>
            }
          />

          <Route
            path="/student/jobs"
            element={
              <Wrapped role="student">
                <Jobs />
              </Wrapped>
            }
          />

          <Route
            path="/student/applications"
            element={
              <Wrapped role="student">
                <MyApplications />
              </Wrapped>
            }
          />

          <Route
            path="/student/learning-hub"
            element={
              <Wrapped role="student">
                <LearningHub />
              </Wrapped>
            }
          />

          <Route
            path="/student/mock-interview"
            element={
              <Wrapped role="student">
                <MockInterview />
              </Wrapped>
            }
          />

          <Route
            path="/student/portfolio"
            element={
              <Wrapped role="student">
                <Portfolio />
              </Wrapped>
            }
          />

          <Route
            path="/student/company-assessments"
            element={
              <Wrapped role="student">
                <CompanyAssessments />
              </Wrapped>
            }
          />

          <Route
            path="/student/company-assessments/take/:id"
            element={
              <Wrapped role="student">
                <TakeCompanyAssessment />
              </Wrapped>
            }
          />

          {/* ==================== INDUSTRY ==================== */}

          <Route
            path="/industry"
            element={
              <Wrapped role="industry">
                <IndustryDashboard />
              </Wrapped>
            }
          />

          <Route
            path="/industry/post"
            element={
              <Wrapped role="industry">
                <PostOpportunity />
              </Wrapped>
            }
          />

          <Route
            path="/industry/internships"
            element={
              <Wrapped role="industry">
                <IndustryInternships />
              </Wrapped>
            }
          />

          <Route
            path="/industry/jobs"
            element={
              <Wrapped role="industry">
                <IndustryJobs />
              </Wrapped>
            }
          />

          <Route
            path="/industry/applications"
            element={
              <Wrapped role="industry">
                <IndustryApplications />
              </Wrapped>
            }
          />

          <Route
            path="/industry/candidates"
            element={
              <Wrapped role="industry">
                <CandidateMatching />
              </Wrapped>
            }
          />

          <Route
            path="/industry/assessments"
            element={
              <Wrapped role="industry">
                <IndustryAssessments />
              </Wrapped>
            }
          />

          <Route
            path="/industry/assessments/:id"
            element={
              <Wrapped role="industry">
                <AssessmentDetail />
              </Wrapped>
            }
          />

          {/* ==================== INDUSTRY COLLABORATIONS ==================== */}

          <Route
            path="/industry/post-collaboration"
            element={
              <Wrapped role="industry">
                <PostCollaboration />
              </Wrapped>
            }
          />

          <Route
            path="/industry/my-collaborations"
            element={
              <Wrapped role="industry">
                <IndustryMyCollaborations />
              </Wrapped>
            }
          />

          <Route
            path="/industry/collaboration-requests"
            element={
              <Wrapped role="industry">
                <CollaborationRequests />
              </Wrapped>
            }
          />

          <Route
            path="/industry/collaboration-candidates"
            element={
              <Wrapped role="industry">
                <Candidates />
              </Wrapped>
            }
          />

          {/* ==================== FACULTY ==================== */}

          <Route
            path="/faculty"
            element={
              <Wrapped role="faculty">
                <FacultyDashboard />
              </Wrapped>
            }
          />

          <Route
            path="/faculty/opportunities"
            element={
              <Wrapped role="faculty">
                <FacultyOpportunities />
              </Wrapped>
            }
          />

          {/* ==================== FACULTY COLLABORATIONS ==================== */}

          <Route
            path="/faculty/collaborations"
            element={
              <Wrapped role="faculty">
                <FacultyCollaborations />
              </Wrapped>
            }
          />

          <Route
            path="/faculty/my-collaborations"
            element={
              <Wrapped role="faculty">
                <FacultyMyCollaborations />
              </Wrapped>
            }
          />

          {/* ==================== INSTITUTION ==================== */}

          <Route
            path="/admin"
            element={
              <Wrapped role="admin">
                <AdminDashboard />
              </Wrapped>
            }
          />

          <Route
            path="/admin/students"
            element={
              <Wrapped role="admin">
                <InstitutionStudents />
              </Wrapped>
            }
          />

          {/* ==================== INSTITUTION COLLABORATIONS ==================== */}

          <Route
            path="/admin/collaborations"
            element={
              <Wrapped role="admin">
                <AdminCollaborations />
              </Wrapped>
            }
          />

          <Route
            path="/admin/my-collaborations"
            element={
              <Wrapped role="admin">
                <AdminMyCollaborations />
              </Wrapped>
            }
          />

          {/* ==================== FALLBACK ==================== */}

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}