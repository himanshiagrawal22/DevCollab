import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import socket from "../services/socket.js";
import ThemeToggle from "../components/ThemeToggle.jsx";
import API_URL from "../services/api.js";

function ProjectWorkspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Browser tab title
  useEffect(() => {
    document.title = "Project Workspace | DevCollab";
  }, []);

  // =========================
  // MAIN DATA
  // =========================

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // =========================
  // NOTIFICATION STATES
  // =========================

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // =========================
  // ACTIVITY LOG STATES
  // =========================

  const [activities, setActivities] = useState([]);
  const [showActivities, setShowActivities] = useState(false);

  // =========================
  // CREATE TASK STATES
  // =========================

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [assignedTo, setAssignedTo] = useState("");

  // =========================
  // EDIT TASK STATES
  // =========================

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("MEDIUM");
  const [editAssignedTo, setEditAssignedTo] = useState("");

  // =========================
  // MEMBER STATES
  // =========================

  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("MEMBER");
  const [roleChanges, setRoleChanges] = useState({});

  // =========================
  // COMMENT STATES
  // =========================

  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // =========================
  // FETCH CURRENT USER
  // =========================

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/me`,
        { withCredentials: true }
      );

      setCurrentUser(response.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // FETCH TASKS
  // =========================

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/projects/${projectId}/tasks`,
        {
          withCredentials: true
        }
      );

      setTasks(response.data.tasks);
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
        "Failed to fetch tasks"
      );
    }
  };

  // =========================
  // FETCH MEMBERS
  // =========================

  const fetchMembers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/projects/${projectId}/members`,
        {
          withCredentials: true
        }
      );

      setMembers(response.data.members);

      const roles = {};

      response.data.members.forEach((member) => {
        roles[member._id] = member.role;
      });

      setRoleChanges(roles);
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
        "Failed to fetch members"
      );
    }
  };

  // =========================
  // FETCH COMMENTS
  // =========================

  const fetchComments = async (taskId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/projects/${projectId}/tasks/${taskId}/comments`,
        {
          withCredentials: true
        }
      );

      setComments((previousComments) => ({
        ...previousComments,
        [taskId]: response.data.comments
      }));
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
        "Failed to fetch comments"
      );
    }
  };

  // =========================
  // FETCH NOTIFICATIONS
  // =========================

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/notifications`,
        { withCredentials: true }
      );

      setNotifications(response.data.notifications);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // FETCH ACTIVITIES
  // =========================

  const fetchActivities = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/projects/${projectId}/activities`,
        {
          withCredentials: true
        }
      );

      setActivities(response.data.activities);
    } catch (error) {
      console.log(error);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );

      fetchNotifications();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update notification");
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await axios.patch(
        `${API_URL}/api/notifications/read-all`,
        {},
        { withCredentials: true }
      );

      fetchNotifications();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update notifications");
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchCurrentUser();
    fetchTasks();
    fetchMembers();
    fetchNotifications();
    fetchActivities();
  }, [projectId]);

  // =========================
  // SOCKET.IO
  // =========================

  useEffect(() => {
    socket.emit("joinProject", projectId);

    // TASK EVENTS

    const handleTaskCreated = () => {
      fetchTasks();
    };

    const handleTaskUpdated = () => {
      fetchTasks();
    };

    const handleTaskDeleted = () => {
      fetchTasks();
    };

    // COMMENT EVENTS

    const handleCommentAdded = ({ taskId }) => {
      fetchComments(taskId);
    };

    const handleCommentDeleted = ({ taskId }) => {
      fetchComments(taskId);
    };

    // MEMBER EVENTS

    const handleMemberAdded = () => {
      fetchMembers();
    };

    const handleMemberRoleUpdated = () => {
      fetchMembers();
    };

    const handleMemberRemoved = () => {
      fetchMembers();
      fetchTasks();
    };

    // NOTIFICATION EVENT

    const handleNotificationCreated = () => {
      // The event is broadcast to the project room, but this API only
      // returns notifications belonging to the currently logged-in user.
      fetchNotifications();
    };

    // ACTIVITY EVENT

    const handleActivityCreated = () => {
      fetchActivities();
    };

    // TASK LISTENERS

    socket.on(
      "taskCreated",
      handleTaskCreated
    );

    socket.on(
      "taskUpdated",
      handleTaskUpdated
    );

    socket.on(
      "taskDeleted",
      handleTaskDeleted
    );

    // COMMENT LISTENERS

    socket.on(
      "commentAdded",
      handleCommentAdded
    );

    socket.on(
      "commentDeleted",
      handleCommentDeleted
    );

    // MEMBER LISTENERS

    socket.on(
      "memberAdded",
      handleMemberAdded
    );

    socket.on(
      "memberRoleUpdated",
      handleMemberRoleUpdated
    );

    socket.on(
      "memberRemoved",
      handleMemberRemoved
    );

    socket.on(
      "notificationCreated",
      handleNotificationCreated
    );

    socket.on(
      "activityCreated",
      handleActivityCreated
    );

    // CLEANUP

    return () => {
      socket.emit(
        "leaveProject",
        projectId
      );

      socket.off(
        "taskCreated",
        handleTaskCreated
      );

      socket.off(
        "taskUpdated",
        handleTaskUpdated
      );

      socket.off(
        "taskDeleted",
        handleTaskDeleted
      );

      socket.off(
        "commentAdded",
        handleCommentAdded
      );

      socket.off(
        "commentDeleted",
        handleCommentDeleted
      );

      socket.off(
        "memberAdded",
        handleMemberAdded
      );

      socket.off(
        "memberRoleUpdated",
        handleMemberRoleUpdated
      );

      socket.off(
        "memberRemoved",
        handleMemberRemoved
      );

      socket.off(
        "notificationCreated",
        handleNotificationCreated
      );

      socket.off(
        "activityCreated",
        handleActivityCreated
      );
    };
  }, [projectId]);

  // =========================
  // ADD MEMBER
  // =========================

  const handleAddMember = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${API_URL}/api/projects/${projectId}/members`,
        {
          email: memberEmail,
          role: memberRole
        },
        {
          withCredentials: true
        }
      );

      setMemberEmail("");
      setMemberRole("MEMBER");

      fetchMembers();

      alert("Member added successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to add member"
      );
    }
  };

  // =========================
  // UPDATE MEMBER ROLE
  // =========================

  const handleUpdateRole = async (memberId) => {
    try {
      await axios.patch(
        `${API_URL}/api/projects/${projectId}/members/${memberId}/role`,
        {
          role: roleChanges[memberId]
        },
        {
          withCredentials: true
        }
      );

      fetchMembers();

      alert(
        "Member role updated successfully"
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to update member role"
      );
    }
  };

  // =========================
  // REMOVE MEMBER
  // =========================

  const handleRemoveMember = async (memberId) => {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this member?"
    );

    if (!confirmRemove) return;

    try {
      await axios.delete(
        `${API_URL}/api/projects/${projectId}/members/${memberId}`,
        {
          withCredentials: true
        }
      );

      fetchMembers();
      fetchTasks();

      alert("Member removed successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to remove member"
      );
    }
  };

  // =========================
  // CREATE TASK
  // =========================

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (isCreatingTask) return;

    setIsCreatingTask(true);

    try {
      await axios.post(
        `${API_URL}/api/projects/${projectId}/tasks`,
        {
          title,
          description,
          priority,
          assignedTo: assignedTo || undefined
        },
        {
          withCredentials: true
        }
      );

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setAssignedTo("");
      setShowCreateTask(false);

      alert("Task created successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Task creation failed"
      );
    } finally {
      setIsCreatingTask(false);
    }
  };

  // =========================
  // START EDIT TASK
  // =========================

  const startEditTask = (task) => {
    setEditingTaskId(task._id);

    setEditTitle(task.title || "");
    setEditDescription(task.description || "");
    setEditPriority(task.priority || "MEDIUM");
    setEditAssignedTo(task.assignedTo?._id || "");
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const cancelEditTask = () => {
    setEditingTaskId(null);

    setEditTitle("");
    setEditDescription("");
    setEditPriority("MEDIUM");
    setEditAssignedTo("");
  };

  // =========================
  // UPDATE TASK
  // =========================

  const handleUpdateTask = async (taskId) => {
    if (!editTitle.trim()) {
      alert("Task title is required");
      return;
    }

    try {
      await axios.patch(
        `${API_URL}/api/projects/${projectId}/tasks/${taskId}`,
        {
          title: editTitle,
          description: editDescription,
          priority: editPriority,
          assignedTo: editAssignedTo || null
        },
        {
          withCredentials: true
        }
      );

      cancelEditTask();

      alert("Task updated successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Task update failed"
      );
    }
  };

  // =========================
  // UPDATE TASK STATUS
  // =========================

  const updateTaskStatus = async (
    taskId,
    status
  ) => {
    try {
      await axios.patch(
        `${API_URL}/api/projects/${projectId}/tasks/${taskId}/status`,
        {
          status
        },
        {
          withCredentials: true
        }
      );

      // Refresh tasks immediately after a successful status update.
      // This keeps the production UI correct even if the Socket.IO
      // refresh event is delayed or unavailable.
      await fetchTasks();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Status update failed"
      );
    }
  };

  // =========================
  // DELETE TASK
  // =========================

  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${API_URL}/api/projects/${projectId}/tasks/${taskId}`,
        {
          withCredentials: true
        }
      );

      alert("Task deleted successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Task deletion failed"
      );
    }
  };

  // =========================
  // TOGGLE COMMENTS
  // =========================

  const toggleComments = (taskId) => {
    const currentlyOpen =
      openComments[taskId];

    setOpenComments((previous) => ({
      ...previous,
      [taskId]: !currentlyOpen
    }));

    if (!currentlyOpen) {
      fetchComments(taskId);
    }
  };

  // =========================
  // ADD COMMENT
  // =========================

  const handleAddComment = async (taskId) => {
    const text = commentText[taskId];

    if (!text || !text.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/projects/${projectId}/tasks/${taskId}/comments`,
        {
          text
        },
        {
          withCredentials: true
        }
      );

      setCommentText((previous) => ({
        ...previous,
        [taskId]: ""
      }));
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to add comment"
      );
    }
  };

  // =========================
  // DELETE COMMENT
  // =========================

  const handleDeleteComment = async (
    taskId,
    commentId
  ) => {
    const confirmDelete = window.confirm(
      "Delete this comment?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${API_URL}/api/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
        {
          withCredentials: true
        }
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to delete comment"
      );
    }
  };

  // =========================
  // CURRENT USER PERMISSIONS
  // =========================

  const currentMembership = members.find(
    (member) =>
      member.user?._id === currentUser?._id
  );

  const currentRole = currentMembership?.role;

  const canManageTasks =
    currentRole === "OWNER" ||
    currentRole === "ADMIN";

  const canManageMembers =
    currentRole === "OWNER" ||
    currentRole === "ADMIN";

  const canChangeRoles =
    currentRole === "OWNER";

  const canRemoveMember = (member) => {
    if (!member || member.role === "OWNER") {
      return false;
    }

    if (currentRole === "OWNER") {
      return true;
    }

    if (
      currentRole === "ADMIN" &&
      member.role !== "ADMIN"
    ) {
      return true;
    }

    return false;
  };

  // =========================
  // FILTER TASKS
  // =========================

  const todoTasks = tasks.filter(
    (task) => task.status === "TODO"
  );

  const inProgressTasks = tasks.filter(
    (task) =>
      task.status === "IN_PROGRESS"
  );

  const doneTasks = tasks.filter(
    (task) => task.status === "DONE"
  );

  // =========================
  // RENDER TASK
  // =========================

  const renderTask = (task, column) => {
    const isEditing =
      editingTaskId === task._id;

    if (isEditing) {
      return (
        <div className="task-card task-edit-card" key={task._id}>
          <h4>Edit Task</h4>

          <input
            type="text"
            placeholder="Task title"
            value={editTitle}
            onChange={(e) =>
              setEditTitle(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Description"
            value={editDescription}
            onChange={(e) =>
              setEditDescription(e.target.value)
            }
          />

          <select
            value={editPriority}
            onChange={(e) =>
              setEditPriority(e.target.value)
            }
          >
            <option value="LOW">
              Low
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HIGH">
              High
            </option>
          </select>

          <select
            value={editAssignedTo}
            onChange={(e) =>
              setEditAssignedTo(e.target.value)
            }
          >
            <option value="">
              Unassigned
            </option>

            {members.map((member) => (
              <option
                key={member._id}
                value={member.user?._id}
              >
                {member.user?.name}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              handleUpdateTask(task._id)
            }
          >
            Save
          </button>

          <button
            onClick={cancelEditTask}
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <div className="task-card" key={task._id}>
        <div className="task-card-header"><h4>{task.title}</h4><span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>{task.priority}</span></div>

        <p>
          {task.description ||
            "No description"}
        </p>


        <p>
          Assigned to:{" "}
          {task.assignedTo?.name ||
            "Unassigned"}
        </p>

        {task.createdBy?.name && (
          <p>
            Created by:{" "}
            {task.createdBy.name}
          </p>
        )}

        {canManageTasks && (
          <button
            onClick={() =>
              startEditTask(task)
            }
          >
            Edit Task
          </button>
        )}

        {column === "TODO" && (
          <button
            onClick={() =>
              updateTaskStatus(
                task._id,
                "IN_PROGRESS"
              )
            }
          >
            Start Task
          </button>
        )}

        {column === "IN_PROGRESS" && (
          <>
            <button
              onClick={() =>
                updateTaskStatus(
                  task._id,
                  "DONE"
                )
              }
            >
              Mark Done
            </button>

            <button
              onClick={() =>
                updateTaskStatus(
                  task._id,
                  "TODO"
                )
              }
            >
              Move Back
            </button>
          </>
        )}

        {column === "DONE" && (
          <button
            onClick={() =>
              updateTaskStatus(
                task._id,
                "IN_PROGRESS"
              )
            }
          >
            Reopen Task
          </button>
        )}

        {canManageTasks && (
          <button
            onClick={() =>
              handleDeleteTask(task._id)
            }
          >
            Delete Task
          </button>
        )}

        <button
          onClick={() =>
            toggleComments(task._id)
          }
        >
          {openComments[task._id]
            ? "Hide Comments"
            : "Comments"}
        </button>

        {openComments[task._id] && (
          <div>
            <h5>Comments</h5>

            {!comments[task._id] ||
              comments[task._id].length === 0 ? (
              <p>No comments yet</p>
            ) : (
              comments[task._id].map(
                (comment) => (
                  <div key={comment._id}>
                    <p>
                      <strong>
                        {comment.user?.name ||
                          "User"}
                      </strong>
                      : {comment.text}
                    </p>

                    <button
                      onClick={() =>
                        handleDeleteComment(
                          task._id,
                          comment._id
                        )
                      }
                    >
                      Delete Comment
                    </button>
                  </div>
                )
              )
            )}

            <input
              type="text"
              placeholder="Write a comment..."
              value={
                commentText[task._id] || ""
              }
              onChange={(e) =>
                setCommentText(
                  (previous) => ({
                    ...previous,
                    [task._id]:
                      e.target.value
                  })
                )
              }
            />

            <button
              onClick={() =>
                handleAddComment(task._id)
              }
            >
              Add Comment
            </button>
          </div>
        )}

        <hr />
      </div>
    );
  };

  // =========================
  // NOTIFICATION COUNT
  // =========================

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  // =========================
  // UI
  // =========================

  return (
    <div className="workspace-page">
      <header className="app-navbar">
        <div className="brand">
          <div className="brand-logo">D</div>
          <div><h2>DevCollab</h2><span>Developer workspace</span></div>
        </div>

        <div className="navbar-actions">
          <button className="nav-icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            🔔{unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
          </button>
          <ThemeToggle />
          <button className="secondary-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
        </div>
      </header>

      <main className="workspace-content">
        <section className="project-overview">
          <div>
            <p className="project-kicker"><span className="live-dot"></span>REAL-TIME PROJECT WORKSPACE</p>
            <h1>Project Workspace</h1>
            <p>Plan work, collaborate with your team and keep every update in one place.</p>
            <div className="project-stats">
              <span><strong>{tasks.length}</strong> Tasks</span>
              <span><strong>{members.length}</strong> Members</span>
              {currentRole && <span className="role-pill">{currentRole}</span>}
            </div>
          </div>

          <div className="overview-actions">
            <button className="secondary-btn" onClick={() => setShowTeam(!showTeam)}>👥 Team</button>
            <button className="secondary-btn" onClick={() => setShowActivities(!showActivities)}>◷ Activity</button>
            {canManageTasks && (
              <button className="primary-btn" onClick={() => setShowCreateTask(true)}>+ New Task</button>
            )}
          </div>
        </section>

        {showNotifications && (
          <section className="floating-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">INBOX</p><h3>Notifications</h3></div>
              <div className="panel-heading-actions">
                {unreadCount > 0 && <button className="text-btn" onClick={handleMarkAllNotificationsAsRead}>Mark all read</button>}
                <button className="icon-close" onClick={() => setShowNotifications(false)}>×</button>
              </div>
            </div>
            {notifications.length === 0 ? <div className="empty-state">You're all caught up.</div> : (
              <div className="feed-list">
                {notifications.map((notification) => (
                  <div className={`feed-item ${!notification.isRead ? "unread" : ""}`} key={notification._id}>
                    <div className="feed-icon">🔔</div>
                    <div className="feed-content">
                      <p>{notification.message}</p>
                      <small>{notification.sender?.name ? `From ${notification.sender.name}` : "Project update"}</small>
                    </div>
                    {!notification.isRead && <button className="text-btn" onClick={() => handleMarkNotificationAsRead(notification._id)}>Read</button>}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {showActivities && (
          <section className="floating-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">PROJECT FEED</p><h3>Recent Activity</h3></div>
              <button className="icon-close" onClick={() => setShowActivities(false)}>×</button>
            </div>
            {activities.length === 0 ? <div className="empty-state">No activity yet.</div> : (
              <div className="activity-grid">
                {activities.slice(0, 8).map((activity) => (
                  <div className="activity-item" key={activity._id}>
                    <div className="avatar">{(activity.user?.name || "U").charAt(0).toUpperCase()}</div>
                    <div><p><strong>{activity.user?.name || "User"}</strong>{" "}{activity.message}</p><small>{new Date(activity.createdAt).toLocaleString()}</small></div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {showTeam && (
          <section className="floating-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">TEAM</p><h3>Project Members <span className="count-pill">{members.length}</span></h3></div>
              <button className="icon-close" onClick={() => setShowTeam(false)}>×</button>
            </div>
            <div className="member-grid">
              {members.map((member) => (
                <div className="member-card" key={member._id}>
                  <div className="member-main">
                    <div className="avatar large">{(member.user?.name || "U").charAt(0).toUpperCase()}</div>
                    <div><strong>{member.user?.name}</strong><span>{member.user?.email}</span></div>
                  </div>
                  <div className="member-actions">
                    <span className="member-role">{member.role}</span>
                    {member.role !== "OWNER" && canChangeRoles && (
                      <>
                        <select value={roleChanges[member._id] || member.role} onChange={(e) => setRoleChanges({ ...roleChanges, [member._id]: e.target.value })}>
                          <option value="ADMIN">Admin</option><option value="MEMBER">Member</option><option value="VIEWER">Viewer</option>
                        </select>
                        <button className="small-btn" onClick={() => handleUpdateRole(member._id)}>Update</button>
                      </>
                    )}
                    {canRemoveMember(member) && <button className="danger-ghost" onClick={() => handleRemoveMember(member._id)}>Remove</button>}
                  </div>
                </div>
              ))}
            </div>

            {canManageMembers && (
              <form className="add-member-form" onSubmit={handleAddMember}>
                <div><strong>Add teammate</strong><span>Invite a registered user.</span></div>
                <input type="email" placeholder="Teammate email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} required />
                <select value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
                  <option value="MEMBER">Member</option><option value="ADMIN">Admin</option><option value="VIEWER">Viewer</option>
                </select>
                <button className="primary-btn" type="submit">Add</button>
              </form>
            )}
          </section>
        )}

        <section className="board-section">
          <div className="board-header">
            <div><p className="eyebrow">KANBAN BOARD</p><h2>Your Tasks</h2></div>
            <div className="board-summary"><span>{todoTasks.length} To do</span><span>{inProgressTasks.length} In progress</span><span>{doneTasks.length} Done</span></div>
          </div>

          <div className="kanban-board">
            {[
              ["TODO", "TO DO", todoTasks, "todo-dot", "No tasks here"],
              ["IN_PROGRESS", "IN PROGRESS", inProgressTasks, "progress-dot", "Ready for work"],
              ["DONE", "DONE", doneTasks, "done-dot", "Completed work appears here"]
            ].map(([status, label, list, dot, empty]) => (
              <div className="kanban-column" key={status}>
                <div className="kanban-column-title">
                  <div><span className={`status-dot ${dot}`}></span><h3>{label}</h3></div><span>{list.length}</span>
                </div>
                <div className="column-tasks">
                  {list.length === 0 ? <div className="column-empty"><span>◇</span><p>{empty}</p></div> : list.map((task) => renderTask(task, status))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showCreateTask && canManageTasks && (
        <div className="modal-backdrop" onMouseDown={() => setShowCreateTask(false)}>
          <section className="task-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="panel-heading">
              <div><p className="eyebrow">NEW WORK ITEM</p><h2>Create a task</h2></div>
              <button className="icon-close" onClick={() => setShowCreateTask(false)}>×</button>
            </div>
            <form className="task-modal-form" onSubmit={handleCreateTask}>
              <label>Task title<input type="text" placeholder="e.g. Build dashboard UI" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus /></label>
              <label>Description<textarea placeholder="What needs to be done?" value={description} onChange={(e) => setDescription(e.target.value)} rows="4" /></label>
              <div className="form-row">
                <label>Priority<select value={priority} onChange={(e) => setPriority(e.target.value)}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label>
                <label>Assignee<select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}><option value="">Unassigned</option>{members.map((member) => <option key={member._id} value={member.user?._id}>{member.user?.name}</option>)}</select></label>
              </div>
              <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowCreateTask(false)}>Cancel</button><button type="submit" className="primary-btn" disabled={isCreatingTask}>{isCreatingTask ? "Creating..." : "Create Task"}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default ProjectWorkspace;
