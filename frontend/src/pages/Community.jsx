import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Linkedin,
  Calendar,
  Users,
  Search,
  Plus,
  Trash2,
  ArrowLeft,
  Sparkles,
  Mail,
  UserCircle,
  X,
} from "lucide-react";

const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    {/* Rich Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-rose-950 animate-gradient-shift"></div>
    
    {/* Floating Orbs */}
    <motion.div
      className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/15 to-blue-500/15 rounded-full blur-[140px]"
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 60, 0],
        y: [0, 40, 0],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-violet-400/15 to-fuchsia-500/15 rounded-full blur-[140px]"
      animate={{
        scale: [1, 1.3, 1],
        x: [0, -60, 0],
        y: [0, -40, 0],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-amber-400/10 to-orange-500/10 rounded-full blur-[140px]"
      animate={{
        scale: [1, 1.15, 1],
        rotate: [0, 180, 360],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
    
    {/* Mesh Grid */}
    <div className="absolute inset-0 bg-grid-pattern opacity-[0.06]"></div>
    
    {/* Animated Particles */}
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white/20 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
);

const MemberCard = ({ member, index, onDelete, currentUser, BACKEND_URL, token }) => {
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

  const getAvatarGradient = (name) => {
    const gradients = [
      "from-cyan-400 to-blue-500",
      "from-violet-400 to-purple-500",
      "from-pink-400 to-rose-500",
      "from-amber-400 to-orange-500",
      "from-emerald-400 to-teal-500",
      "from-fuchsia-400 to-pink-500",
    ];
    return gradients[name.charCodeAt(0) % gradients.length];
  };

  const canDelete = currentUser?.email && 
    member.email?.toLowerCase() === currentUser.email.toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative"
    >
      {/* Card */}
      <div className="relative h-full bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-xl transition-all duration-500 group-hover:border-white/40 group-hover:shadow-[0_0_40px_rgba(139,92,246,0.2)]">
        {/* Shine Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.8 }}
        />
        
        {/* Gradient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
        
        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Avatar & Info */}
          <div className="flex items-start gap-4 mb-6">
            <motion.div
              className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarGradient(
                member.name
              )} flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              {member.profileimg ? (
                <img
                  src={`${BACKEND_URL}/${member.profileimg}`}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(member.name)
              )}
              {/* Avatar Border Glow */}
              <div className="absolute inset-0 rounded-2xl border-2 border-white/20"></div>
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl text-white mb-2 tracking-tight">
                {member.name}
              </h3>
              <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <p className="truncate">{member.email}</p>
              </div>
              {member.createdAt && (
                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Joined {formatDate(member.createdAt)}</span>
                </div>
              )}
            </div>
            
            {/* Sparkle Icon */}
            <motion.div
              className="text-white/20 flex-shrink-0"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Sparkles size={18} />
            </motion.div>
          </div>

          {/* About Section */}
          {member.about && (
            <div className="mb-5 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                {member.about}
              </p>
            </div>
          )}

          {/* Social Links */}
          {(member.linkedin || member.github) && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {member.linkedin && (
                <motion.a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </motion.a>
              )}
              {member.github && (
                <motion.a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </motion.a>
              )}
            </div>
          )}

          {/* Delete Button */}
          {canDelete && (
            <motion.button
              onClick={() => onDelete(member._id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 mt-3"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Profile</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

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

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
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
          throw new Error(data.message || `HTTP error! status: ${response.status}`);

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

  // Enhanced search with real-time filtering
  useEffect(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    
    if (searchLower) {
      const filtered = members.filter((member) => {
        const nameMatch = member.name?.toLowerCase().includes(searchLower);
        const emailMatch = member.email?.toLowerCase().includes(searchLower);
        const aboutMatch = member.about?.toLowerCase().includes(searchLower);
        
        return nameMatch || emailMatch || aboutMatch;
      });
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [members, searchTerm]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <AnimatedBackground />

      {/* Glass Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white/[0.08] backdrop-blur-2xl border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-6">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Community Hub
                </h1>
                <p className="text-gray-400 text-sm mt-0.5">Connect with amazing people</p>
              </div>
            </motion.div>

            <motion.button
              onClick={handleCreateMember}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-semibold shadow-lg hover:shadow-violet-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Member</span>
              <span className="sm:hidden">Add</span>
            </motion.button>
          </div>

          {/* Search Bar */}
          <motion.div
            className="relative max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <input
              type="text"
              placeholder="Search by name, email, or about section..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-white/[0.08] backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
            />
            {searchTerm && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>

          {/* Search Results Count */}
          {searchTerm && (
            <motion.div
              className="mt-3 text-sm text-gray-400"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Found <span className="text-violet-400 font-semibold">{filteredMembers.length}</span> {filteredMembers.length === 1 ? 'member' : 'members'}
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pt-48 pb-20 relative z-10">
        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-6 p-4 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-200"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Members Grid */}
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMembers.map((member, index) => (
              <div
                key={member._id}
                ref={index === filteredMembers.length - 1 ? lastMemberElementRef : null}
              >
                <MemberCard
                  member={member}
                  index={index}
                  onDelete={handleDelete}
                  currentUser={currentUser}
                  BACKEND_URL={BACKEND_URL}
                  token={token}
                />
              </div>
            ))}
          </div>
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <motion.div
            className="flex justify-center items-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredMembers.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <UserCircle className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No members found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? `No results for "${searchTerm}"` : "Be the first to join!"}
            </p>
            {searchTerm && (
              <motion.button
                onClick={clearSearch}
                className="px-6 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Search
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {/* Back to Features FAB */}
      <motion.button
        onClick={() => navigate("/features")}
        className="fixed bottom-8 left-8 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 font-semibold z-50"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.5, type: "spring" }}
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Back to Features</span>
      </motion.button>

      {/* Footer */}
      <motion.footer
        className="relative z-10 border-t border-white/10 py-8 mt-16 bg-white/[0.03] backdrop-blur-xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-gray-400 text-sm">
          Building connections, one member at a time{" "}
          <span className="text-violet-400">✨</span>
        </p>
      </motion.footer>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}