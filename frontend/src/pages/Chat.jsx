import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import MessageBubble from "../components/chat/MessageBubble";
import TypingIndicator from "../components/chat/TypingIndicator";
import ChatInput from "../components/chat/ChatInput";
import { logout } from "../redux/authSlice";
import { clearSelectedDocument } from "../redux/documentSlice";
import {
  fetchChats,
  createChat,
  fetchChat,
  sendMessage,
  deleteChat,
  clearCurrentChat,
} from "../redux/chatSlice";
import "../styles/chat.css";

const SUGGESTIONS = [
  "Explain RAG in simple words",
  "Summarize my selected PDF",
  "Write a C++ binary search",
];

function EmptyState({ hasChat, onNew, onPick }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">✦</div>
      <h1>How can I help?</h1>
      <p className="muted">Ask a coding question, upload a document, or explore a topic.</p>
      {hasChat ? (
        <div className="chips">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="chip" onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
      ) : (
        <button className="btn btn-primary" onClick={onNew}>＋ Start a conversation</button>
      )}
    </div>
  );
}

export default function Chat() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: chatIdFromUrl } = useParams();

  const { chats, currentChat, messages, error } = useSelector((state) => state.chat);
  const user = useSelector((state) => state.auth.user);
  const { documents, selectedDocumentId } = useSelector((state) => state.documents);

  const [input, setInput] = useState("");
  const [pendingText, setPendingText] = useState(null); // shown instantly while the AI answers
  const lastTextRef = useRef("");
  const bottomRef = useRef(null);

  const sending = pendingText !== null;
  const selectedDoc = selectedDocumentId
    ? documents.find((d) => d._id === selectedDocumentId) || { fileName: "Selected document" }
    : null;

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  useEffect(() => {
    if (chatIdFromUrl) dispatch(fetchChat(chatIdFromUrl));
    else dispatch(clearCurrentChat());
  }, [chatIdFromUrl, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleNewChat() {
    const result = await dispatch(createChat());
    if (createChat.fulfilled.match(result)) navigate(`/chat/${result.payload._id}`);
  }

  async function handleSend() {
    const content = input.trim();
    if (!content || !currentChat || sending) return;
    lastTextRef.current = content;
    setInput("");
    setPendingText(content);
    await dispatch(
      sendMessage({ chatId: currentChat._id, content, documentId: selectedDocumentId })
    );
    setPendingText(null);
  }

  async function handleDelete(chatId, e) {
    e.stopPropagation();
    await dispatch(deleteChat(chatId));
    if (chatIdFromUrl === chatId) navigate("/chat");
  }

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <Sidebar
        chats={chats}
        activeId={chatIdFromUrl}
        user={user}
        onNew={handleNewChat}
        onSelect={(id) => navigate(`/chat/${id}`)}
        onDelete={handleDelete}
        onLogout={handleLogout}
      />

      <main className="chat-main">
        <header className="chat-topbar">
          <h2>{currentChat?.title || "MultiAI"}</h2>
          {selectedDoc && <span className="pill">📄 {selectedDoc.fileName}</span>}
        </header>

        <div className="chat-scroll">
          <div className="chat-column">
            {(!currentChat || (messages.length === 0 && !sending)) && (
              <EmptyState hasChat={!!currentChat} onNew={handleNewChat} onPick={setInput} />
            )}

            {messages.map((m) => (
              <MessageBubble key={m._id} message={m} />
            ))}

            {sending && (
              <>
                <MessageBubble message={{ _id: "pending", role: "user", content: pendingText }} />
                <TypingIndicator
                  label={selectedDoc ? "Searching your document" : "MultiAI is thinking"}
                />
              </>
            )}

            {error && !sending && (
              <div className="error-box">
                <strong>Something went wrong</strong>
                <p className="muted">We couldn't generate a response. Please try again.</p>
                <button className="btn" onClick={() => setInput(lastTextRef.current)}>
                  Try again
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {currentChat && (
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            sending={sending}
            selectedDoc={selectedDoc}
            onClearDoc={() => dispatch(clearSelectedDocument())}
          />
        )}
      </main>
    </div>
  );
}