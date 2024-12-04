/**
 * Dashboard Component
 * 
 * Requirements Addressed:
 * - Dashboard Overview (Technical Specification/3.1 User Interface Design/3.1.3 Critical User Flows)
 *   Provides a centralized dashboard for users to view and manage projects and tasks.
 * 
 * Human Tasks:
 * - Verify dashboard layout responsiveness on different screen sizes
 * - Ensure loading states provide good user experience
 * - Test error handling and retry mechanisms
 */

// react v18.2.0
import React, { useEffect, useState } from 'react';

// Internal imports using relative paths
import useAuth from '../../hooks/useAuth';
import useProject from '../../hooks/useProject';
import useTask from '../../hooks/useTask';
import ProjectList from '../../components/project/ProjectList/ProjectList';
import TaskList from '../../components/task/TaskList/TaskList';
import Loading from '../../components/common/Loading/Loading';
import { ROUTES } from '../../constants/routes.constants';

const Dashboard: React.FC = () => {
  // Initialize hooks
  const { isAuthenticated } = useAuth();
  const { projects, loading: projectsLoading, error: projectsError, getProjects } = useProject();
  const { tasks, loading: tasksLoading, error: tasksError } = useTask();

  // Local state for retry mechanism
  const [retryCount, setRetryCount] = useState(0);

  // Fetch initial data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await getProjects();
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, getProjects, retryCount]);

  // Handle retry action
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Show loading state while fetching data
  if (projectsLoading || tasksLoading) {
    return (
      <Loading 
        isLoading={true} 
        message="Loading dashboard..." 
      />
    );
  }

  // Show error state if data fetching failed
  if (projectsError || tasksError) {
    return (
      <div className="dashboard-error" style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-color)'
      }}>
        <p>Error loading dashboard: {projectsError || tasksError}</p>
        <button 
          onClick={handleRetry}
          style={{
            padding: '0.5rem 1rem',
            marginTop: '1rem',
            backgroundColor: 'var(--primary-color)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard" style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <header style={{
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 500,
          color: 'var(--text-color)',
          margin: 0
        }}>
          Dashboard
        </h1>
      </header>

      <div className="dashboard-content" style={{
        display: 'grid',
        gap: '2rem',
        gridTemplateColumns: '1fr',
        '@media (min-width: 768px)': {
          gridTemplateColumns: '1fr 1fr'
        }
      }}>
        <section className="dashboard-section">
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 500,
            color: 'var(--text-color)',
            marginBottom: '1rem'
          }}>
            Projects
          </h2>
          <ProjectList />
        </section>

        <section className="dashboard-section">
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 500,
            color: 'var(--text-color)',
            marginBottom: '1rem'
          }}>
            Tasks
          </h2>
          <TaskList />
        </section>
      </div>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background-color: var(--background-color);
        }

        .dashboard-content {
          display: grid;
          gap: 2rem;
          grid-template-columns: 1fr;
        }

        .dashboard-section {
          background-color: var(--background-color);
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          border: 1px solid var(--border-color);
        }

        @media (min-width: 768px) {
          .dashboard-content {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 767px) {
          .dashboard {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;