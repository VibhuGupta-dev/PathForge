import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Github,
  Linkedin,
  Calendar,
  Users,
  Search,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";

export default function CommunityPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [error, setError] = useState("");
  const observer = useRef();

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const handleCreateMember = () => {
    navigate("/community/create");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete your profile?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/community/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setMembers(members.filter((m) => m._id !== id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const fetchMembers = useCallback(
    async (pageNum = 1, reset = false) => {
      if (loading) return;
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${BACKEND_URL}/api/community`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(
            data.message || `HTTP error! status: ${response.status}`
          );

        if (data.success) {
          const newMembers = data.data || [];
          if (reset) {
            setMembers(newMembers);
          } else {
            setMembers((prev) => [...prev, ...newMembers]);
          }
          setHasMore(newMembers.length === 10);
        }
      } catch (err) {
        setError(`Connection error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    },
    [BACKEND_URL, loading, token]
  );

  const lastMemberElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    fetchMembers(1, true);
  }, []);

  useEffect(() => {
    if (page > 1) fetchMembers(page);
  }, [page, fetchMembers]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = members.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (member.about &&
            member.about.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [members, searchTerm]);

  const getInitials = (name) =>
    name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  const getAvatarColor = (name) => {
    const colors = [
      "bg-gradient-to-r from-purple-400 to-pink-400",
      "bg-gradient-to-r from-blue-400 to-indigo-400",
      "bg-gradient-to-r from-green-400 to-teal-400",
      "bg-gradient-to-r from-yellow-400 to-orange-400",
      "bg-gradient-to-r from-red-400 to-pink-400",
      "bg-gradient-to-r from-indigo-400 to-purple-400",
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Back to Features Button */}
      <button
        onClick={() => navigate("/features")}
        className="fixed bottom-4 left-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Features
      </button>

      {/* Floating dots background */}
      <div className="absolute inset-0 -z-10">
        {[...Array(30)].map((_, i) => {
          const size = Math.random() * 6 + 4;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const duration = (4 + Math.random() * 6).toFixed(2);
          return (
            <div
              key={i}
              className="absolute rounded-full bg-indigo-300/30 animate-float"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${top}%`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" /> Community Members
            </h1>
            <p className="text-gray-600 mt-1">
              Connect with our amazing community
            </p>
          </div>
          <button
            onClick={handleCreateMember}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" /> Add Member
          </button>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member, index) => (
          <div
            key={member._id}
            ref={
              index === filteredMembers.length - 1 ? lastMemberElementRef : null
            }
            className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 group"
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-16 h-16 rounded-full ${getAvatarColor(
                  member.name
                )} flex items-center justify-center text-white font-bold text-lg`}
              >
                {member.profileimg ? (
                  <img
                    src={`${BACKEND_URL}/${member.profileimg}`}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(member.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-gray-600 text-sm truncate">{member.email}</p>
                {member.about && (
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {member.about}
                  </p>
                )}
                {member.createdAt && (
                  <div className="flex items-center gap-1 mt-2 text-gray-500 text-xs">
                    <Calendar className="w-3 h-3" />{" "}
                    <span>Joined {formatDate(member.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium flex-1 justify-center"
                >
                  <Linkedin className="w-4 h-4" /> <span>LinkedIn</span>
                </a>
              )}
              {member.github && (
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex-1 justify-center"
                >
                  <Github className="w-4 h-4" /> <span>GitHub</span>
                </a>
              )}
            </div>

            {/* Delete only for current user */}
            {currentUser?.email &&
              member.email?.toLowerCase() ===
                currentUser.email.toLowerCase() && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-20px); opacity: 0.8; }
          100% { transform: translateY(0); opacity: 0.5; }
        }
        .animate-float {
          animation: float infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}