import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle.jsx";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/projects",
        { withCredentials: true }
      );
      setProjects(response.data.projects);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/");
        return;
      }
      alert(error.response?.data?.message || "Failed to fetch projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      navigate("/", { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Logout failed");
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Project name is required");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/projects",
        { name, description },
        { withCredentials: true }
      );
      setName("");
      setDescription("");
      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || "Project creation failed");
    }
  };

  return (
    <div className="dashboard-page">
      <header className="app-navbar">
        <div className="brand">
          <div className="brand-logo">D</div>
          <div>
            <h2>DevCollab</h2>
            <span>Developer Workspace</span>
          </div>
        </div>

        <div className="navbar-actions">
          <ThemeToggle />
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-hero">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h1>Build together.<br />Ship better.</h1>
            <p className="hero-copy">
              A focused workspace for projects, tasks and real-time team collaboration.
            </p>
          </div>

          <div className="dashboard-stats">
            <div><strong>{projects.length}</strong><span>Projects</span></div>
            <div><strong>{projects.filter((p) => p.role === "OWNER").length}</strong><span>Owned</span></div>
            <div><strong>{projects.filter((p) => p.role !== "OWNER").length}</strong><span>Shared</span></div>
          </div>
        </section>

        <section className="create-project-card">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">START SOMETHING</p>
              <h2>Create a new project</h2>
            </div>
            <span className="plus-icon">+</span>
          </div>

          <form className="create-project-form" onSubmit={handleCreateProject}>
            <div className="form-field">
              <label>Project name</label>
              <input
                type="text"
                placeholder="e.g. DevCollab"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Description</label>
              <input
                type="text"
                placeholder="What are you building?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button className="primary-btn" type="submit">
              Create Project
            </button>
          </form>
        </section>

        <section className="projects-section">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">PROJECTS</p>
              <h2>Your workspaces</h2>
            </div>
            <span className="count-pill">{projects.length} total</span>
          </div>

          {projects.length === 0 ? (
            <div className="empty-projects">
              <div className="empty-icon">&lt;/&gt;</div>
              <h3>No projects yet</h3>
              <p>Create your first workspace above.</p>
            </div>
          ) : (
            <div className="project-grid">
              {projects.map((project) => (
                <article className="project-card" key={project._id}>
                  <div className="project-card-top">
                    <div className="project-icon">&lt;/&gt;</div>
                    {project.role && (
                      <span className={`role-badge role-${project.role.toLowerCase()}`}>
                        {project.role}
                      </span>
                    )}
                  </div>

                  <h3>{project.name}</h3>
                  <p className="project-description">
                    {project.description || "No description added yet."}
                  </p>

                  <button
                    className="open-project-btn"
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    <span>Open workspace</span><span>→</span>
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
