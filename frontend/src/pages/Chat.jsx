import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchChats,
  createChat,
  fetchChat,
  sendMessage,
  deleteChat,
  clearCurrentChat,
} from "../redux/chatSlice";

export default function Chat() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: chatIdFromUrl } = useParams();

  const { chats, currentChat, messages, loading, error } = useSelector((state) => state.chat);
  const [input, setInput] = useState("");

  // Load the sidebar list once, on mount.
  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  // Whenever the URL's :id changes (user clicked a different chat, or
  // navigated directly to /chat/someId), load THAT conversation.
  useEffect(() => {
    if (chatIdFromUrl) {
      dispatch(fetchChat(chatIdFromUrl));
    } else {
      dispatch(clearCurrentChat());
    }
  }, [chatIdFromUrl, dispatch]);

  async function handleNewChat() {
    const result = await dispatch(createChat());
    if (createChat.fulfilled.match(result)) {
      navigate(`/chat/${result.payload._id}`);
    }
  }

  async function handleSend() {
    if (!input.trim() || !currentChat) return;
    const content = input.trim();
    setInput("");
    await dispatch(sendMessage({ chatId: currentChat._id, content }));
  }

  async function handleDelete(chatId, e) {
    e.stopPropagation(); // don't also trigger navigating INTO the chat we're deleting
    await dispatch(deleteChat(chatId));
    if (chatIdFromUrl === chatId) {
      navigate("/chat");
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 240, borderRight: "1px solid #ddd", padding: 16, display: "flex", flexDirection: "column" }}>
        <button
          onClick={handleNewChat}
          style={{ padding: "8px 12px", marginBottom: 16, cursor: "pointer" }}
        >
          + New Chat
        </button>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {chats.map((c) => (
            <div
              key={c._id}
              onClick={() => navigate(`/chat/${c._id}`)}
              style={{
                padding: "8px 10px",
                marginBottom: 4,
                borderRadius: 6,
                cursor: "pointer",
                background: c._id === chatIdFromUrl ? "#eee" : "transparent",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.title}
              </span>
              <button
                onClick={(e) => handleDelete(c._id, e)}
                title="Delete chat"
                style={{ border: "none", background: "none", cursor: "pointer", color: "#999" }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {!currentChat && <p style={{ color: "#999" }}>Select a chat or start a new one.</p>}

          {messages.map((m) => (
            <div key={m._id} style={{ marginBottom: 12 }}>
              <strong>{m.role === "user" ? "You" : "Assistant"}:</strong>
              <p style={{ margin: "4px 0" }}>{m.content}</p>
            </div>
          ))}

          {loading && <p style={{ color: "#999" }}>AI is thinking…</p>}
          {error && <p style={{ color: "crimson" }}>{error}</p>}
        </div>

        {currentChat && (
          <div style={{ display: "flex", padding: 16, borderTop: "1px solid #ddd" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask something…"
              style={{ flex: 1, padding: 10, marginRight: 8 }}
            />
            <button onClick={handleSend} style={{ padding: "10px 20px", cursor: "pointer" }}>
              ➤
            </button>
          </div>
        )}
      </div>
    </div>
  );
}