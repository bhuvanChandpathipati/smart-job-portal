import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import StudentDashboard from './pages/student/Dashboard';
import Recommended from './pages/student/Recommended';
import Saved from './pages/student/Saved';
import Applications from './pages/student/Applications';
import ApplicationDetails from './pages/student/ApplicationDetails';
import Profile from './pages/student/Profile';
import Resume from './pages/student/Resume';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import Company from './pages/recruiter/Company';
import JobForm from './pages/recruiter/JobForm';
import ManageJobs from './pages/recruiter/ManageJobs';
import Applicants from './pages/recruiter/Applicants';
import ApplicantDetails from './pages/recruiter/ApplicantDetails';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminJobs from './pages/admin/Jobs';
import AdminApplications from './pages/admin/Applications';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/student" element={<Register role="student" />} />
        <Route path="/register/recruiter" element={<Register role="recruiter" />} />
        <Route path="/register" element={<Navigate to="/register/student" replace />} />
      </Route>

      <Route element={<ProtectedRoute roles={['student']} />}>
        <Route path="/student" element={<DashboardLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="jobs" element={<Jobs base="/student/jobs" />} />
          <Route path="jobs/:id" element={<JobDetails base="/student/jobs" />} />
          <Route path="recommended" element={<Recommended />} />
          <Route path="saved" element={<Saved />} />
          <Route path="applications" element={<Applications />} />
          <Route path="applications/:id" element={<ApplicationDetails />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<Navigate to="/student/profile" replace />} />
          <Route path="resume" element={<Resume />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['recruiter']} />}>
        <Route path="/recruiter" element={<DashboardLayout />}>
          <Route index element={<RecruiterDashboard />} />
          <Route path="company" element={<Company />} />
          <Route path="jobs" element={<ManageJobs />} />
          <Route path="jobs/new" element={<JobForm />} />
          <Route path="jobs/:id/edit" element={<JobForm />} />
          <Route path="applicants" element={<Applicants />} />
          <Route path="applicants/:id" element={<ApplicantDetails />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<AdminUsers role="student" />} />
          <Route path="recruiters" element={<AdminUsers role="recruiter" />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<div className="p-16 text-center"><h1 className="text-3xl font-bold">Page not found</h1><a className="mt-4 inline-block text-indigo-600" href="/">Go to home</a></div>} />
    </Routes>
  );
}
