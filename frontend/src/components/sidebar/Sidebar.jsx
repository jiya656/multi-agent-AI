import { Link } from "react-router-dom";

export default function Sidebar({ chats, activeId, user, open, onNew, onSelect, onDelete, onLogout }) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">✦ MultiAI</div>

      <button className="btn btn-primary new-chat" onClick={onNew}>
        ＋ New conversation
      </button>

      <div className="sidebar-label">Conversations</div>
      <div className="chat-list">
        {chats.length === 0 && <p className="muted">No conversations yet.</p>}
        {chats.map((c) => (
          <div
            key={c._id}
            className={`chat-item ${c._id === activeId ? "active" : ""}`}
            onClick={() => onSelect(c._id)}
          >
            <span className="chat-item-title">{c.title}</span>
            <button
              className="chat-item-delete"
              title="Delete conversation"
              onClick={(e) => onDelete(c._id, e)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <nav className="sidebar-footer">
        <Link to="/documents" className="sidebar-link">📄 Documents</Link>
        <div className="sidebar-user">
          <span>👤 {user?.name || "Account"}</span>
          <button className="btn" onClick={onLogout}>Log out</button>
        </div>
      </nav>
    </aside>
  );
}