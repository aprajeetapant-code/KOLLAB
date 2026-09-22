import { useState } from "react";
import "./App.css";

function App() {
  const [project, setProject] = useState("");
  const [collabRoom, setCollabRoom] = useState(null);
  const [projects, setProjects] = useState(() => {
  const savedProjects = localStorage.getItem("kollab_projects");
  return savedProjects ? JSON.parse(savedProjects) : [];
});

const [newProject, setNewProject] = useState("");
  const [matches, setMatches] = useState([]);
  const [showMatches, setShowMatches] = useState(false);
  const [activePage, setActivePage] = useState("home")

  const [profile, setProfile] = useState({
    name: "",
    role: "",
    skills: "",
  });

  const [profiles, setProfiles] = useState(() => {
    const savedProfiles = localStorage.getItem("kollab_profiles");
    return savedProfiles ? JSON.parse(savedProfiles) : [];
  });

  // Create a profile
  const createProfile = () => {
    if (
      !profile.name.trim() ||
      !profile.role.trim() ||
      !profile.skills.trim()
    ) {
      alert("Please fill in your name, role and skills.");
      return;
    }

    const newProfile = {
      id: Date.now(),
      name: profile.name.trim(),
      role: profile.role.trim(),
      skills: profile.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    };

    const updatedProfiles = [...profiles, newProfile];

    setProfiles(updatedProfiles);

    localStorage.setItem(
      "kollab_profiles",
      JSON.stringify(updatedProfiles)
    );

    setProfile({
      name: "",
      role: "",
      skills: "",
    });

    alert("Profile created successfully!");
  };
  const createProject = () => {
  if (!newProject.trim()) {
    alert("Please enter a project name.");
    return;
  }

  const projectData = {
    id: Date.now(),
    name: newProject.trim(),
    createdAt: new Date().toLocaleDateString(),
  };

  const updatedProjects = [...projects, projectData];

  setProjects(updatedProjects);
  localStorage.setItem("kollab_projects", JSON.stringify(updatedProjects));

  setNewProject("");
  alert("Project created successfully!");
};

  // Match project with profiles
  const findCreators = () => {
  if (!project.trim()) {
    alert("Please describe your project first.");
    return;
  }

  if (profiles.length === 0) {
    alert("No collaborator profiles exist yet. Create a profile first.");
    return;
  }

  const normalizeText = (text) => {
    return String(text || "")
      .toLowerCase()
      .replace(/[\/_-]/g, " ")
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  };

  const projectWords = [...new Set(normalizeText(project))];

  const rankedProfiles = profiles
    .map((creator) => {
      const skills = Array.isArray(creator.skills)
        ? creator.skills
        : String(creator.skills || "")
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean);

      const creatorWords = [
        ...normalizeText(creator.role),
        ...skills.flatMap((skill) => normalizeText(skill))
      ];

      const uniqueCreatorWords = [...new Set(creatorWords)];

      const matchedWords = projectWords.filter((word) =>
        uniqueCreatorWords.includes(word)
      );

      const uniqueMatches = [...new Set(matchedWords)];

      const totalUniqueWords = new Set([
        ...projectWords,
        ...uniqueCreatorWords
      ]).size;

      const match =
        totalUniqueWords > 0
          ? Math.round(
              (uniqueMatches.length / totalUniqueWords) * 100
            )
          : 0;

      return {
        ...creator,
        match,
        matchedSkills: uniqueMatches
      };
    })
    .sort((a, b) => b.match - a.match);

  setMatches(rankedProfiles);
  setShowMatches(true);
};

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">KOLLAB</div>

        <div className="nav-links">
          <span>Discover</span>
          <span onClick={() =>
            setActivePage("projects")
          }>My Projects</span>
          <span onClick = {() =>
            setActivePage("rooms")}>Collab Rooms </span>
          
        </div>

        <button
        className = "profile-btn"
        onClick={() =>
          setActivePage("creator")
        }>
          Creator
        </button>
      </nav>

        {activePage==="room " ? (
  <main className="room-page">
    <section className="collab-room">
      <p className="tagline">COLLAB ROOM</p>

      <h1>{collabRoom?.project || "Project Room"}</h1>

      <p className="description">
        You are collaborating with {collabRoom?.creator?.name || "your collaborator"}.
      </p>

      <div className="room-card">
        <h2>Project</h2>
        <p>{collabRoom?.project || "No project description available."}</p>
      </div>

      <div className="room-card">
        <h2>Collaborator</h2>
        <p>{collabRoom?.creator?.name}</p>
        <p>{collabRoom?.creator?.role}</p>
      </div>

      <button
        className="back-btn"
        onClick={() => setActivePage("home")}
      >
        ← Back to Home
      </button>
    </section>
  </main>
) : activePage === "projects" ? (
  <main className = "projects-page">
  <section className="projects-section">
    <p className="tagline">YOUR WORKSPACE</p>

    <h1>My Projects</h1>

    <p className="description">
      Create and manage the projects you want to build with your collaborators.
    </p>

    <div className="project-create-box">
      <input
        type="text"
        placeholder="Enter your project name"
        value={newProject}
        onChange={(e) => setNewProject(e.target.value)}
      />

      <button
        className="find-btn"
        onClick={createProject}
      >
        Create Project
      </button>
    </div>

    <div className="projects-list">
      {projects.length === 0 ? (
        <p>No projects yet. Create your first project.</p>
      ) : (
        projects.map((project) => (
          <div className="project-card" key={project.id}>
            <h2>{project.name}</h2>
            <p>Created on {project.createdAt}</p>
          </div>
        ))
      )}
    </div>

    <button
      className="back-btn"
      onClick={() => setActivePage("home")}
    >
      ← Back to Home
    </button>
  </section>
</main> 
  ): activePage === "room" ? (
  <main className="room-page">
    <section className="collab-room">
      <p className="tagline">COLLAB ROOM</p>

      <h1>Project Collaboration Room</h1>

      <p className="description">
        You are now connected with your collaborator.
      </p>

      <div className="room-card">
        <h2>Project</h2>
        <p>{project || "Your project"}</p>
      </div>

      <div className="room-card">
        <h2>Collaboration</h2>
        <p>Start working together on your project.</p>
      </div>

      <button
        className="back-btn"
        onClick={() => setActivePage("home")}
      >
        ← Back to Home
      </button>
    </section>
  </main>
) : activePage === "creator" ? (
          <main className="creator-page">
    <section className="creator-profile-section">
      <p className="tagline">BUILD YOUR CREATOR PROFILE</p>

      <h1>Create Your Creator Profile</h1>

      <p className="description">
        Add your skills so other creators can find you.
      </p>

      <div className="profile-form">
        <input
          type="text"
          placeholder="Your name"
          value={profile.name}
          onChange={(e) =>
            setProfile({ ...profile, name: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Your role"
          value={profile.role}
          onChange={(e) =>
            setProfile({ ...profile, role: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Skills (comma separated)"
          value={profile.skills}
          onChange={(e) =>
            setProfile({ ...profile, skills: e.target.value })
          }
        />

        <button
          className="find-btn"
          onClick={createProfile}
        >
          Create Profile
        </button>
      </div>

      <button
        className="back-btn"
        onClick={() => setActivePage("home")}
      >
        ← Back to Home
      </button>
    </section>
  </main>
) : (
  <main>

        {/* HERO */}
        <section className="hero-section">

          <div className="hero-text">

            <p className="tagline">
              FIND YOUR PEOPLE. CREATE TOGETHER.
            </p>

            <h1>
              Turn your idea into a
              <span> team.</span>
            </h1>

            <p className="description">
              Tell Kollab what you're building. Find creators,
              developers, designers and storytellers who match
              your project.
            </p>

            {/* PROJECT INPUT */}
            <div className="project-box">

              <label>What are you building?</label>

              <textarea
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Describe your project and the people you need..."
              />

              <button
                className="find-btn"
                onClick={findCreators}
              >
                ✨ Find My Collaborators
              </button>

            </div>

          </div>

          {/* MATCH RESULTS */}
          {showMatches && (
            <div className="results">

              {matches.length === 0 ? (
                <div className="match-card">
                  <h3>No matching collaborators found.</h3>
                  <p>
                    Try describing your project with more details
                    about the skills you need.
                  </p>
                </div>
              ) : (
                matches.map((creator) => (

                  <div
                    className="match-card"
                    key={creator.id}
                  >

                    <div className="card-header">
                      <span>COLLABORATOR MATCH</span>

                      <span className="online">
                        ● AVAILABLE
                      </span>
                    </div>

                    <div className="creator">

                      <div className="avatar">
                        {creator.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div className="creator-info">
                        <h3>{creator.name}</h3>

                        <p>
                          {creator.role}
                        </p>
                      </div>

                      <div className="score">
                        <strong>
                          {creator.match}%
                        </strong>

                        <small>
                          MATCH
                        </small>
                      </div>

                    </div>

                    <div className="skills">

                      {creator.skills.map((skill) => (
                        <span key={skill}>
                          {skill}
                        </span>
                      ))}

                    </div>

                    {creator.matchedSkills.length > 0 && (
                      <p className="match-reason">
                        ✨ Matching skills:{" "}
                        {creator.matchedSkills.join(", ")}
                      </p>
                    )}

                    <button
                    type = "button"
                      className="connect-btn"
                      onClick={() => {

                        setActivePage("room");
                      }}
                    >
                      Connect →
                    </button>

                  </div>

                ))
              )}

            </div>
          )}

        </section>


        


        {/* HOW IT WORKS */}
        <section className="how-section">

          <h2>How Kollab works</h2>

          <div className="steps">

            <div className="step">
              <div className="number">01</div>

              <h3>Describe</h3>

              <p>
                Tell Kollab about your project and the skills
                you need.
              </p>
            </div>

            <div className="step">
              <div className="number">02</div>

              <h3>Match</h3>

              <p>
                Kollab compares your project with available
                collaborator profiles.
              </p>
            </div>

            <div className="step">
              <div className="number">03</div>

              <h3>Collaborate</h3>

              <p>
                Connect with people whose skills match your
                project.
              </p>
            </div>

          </div>

        </section>

      </main>
)}

    </div>
  );
}

export default App;











































































































