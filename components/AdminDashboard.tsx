import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

// Types
interface Deposit {
  amount: number;
  date: string;
}
interface Purchase {
  network: string;
  bundle: string;
  amount: number;
  date: string;
}
interface UserRecord {
  id: number;
  email: string;
  role?: string;
  wallet_balance?: number;
  deposits?: Deposit[];
  purchases?: Purchase[];
}
interface ChatMessage {
  id: number;
  user: string;
  message: string;
  created_at: string;
}
interface FileItem {
  name: string;
  url: string;
  created_at?: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<{ totalUsers: number; totalBalance: number; totalPurchases: number }>({
    totalUsers: 0,
    totalBalance: 0,
    totalPurchases: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [blockLoadingId, setBlockLoadingId] = useState<number | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const usersPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));

  // Chart data (simple total balances & purchases per user)
  const chartData = filteredUsers.map(u => ({
    email: u.email,
    balance: u.wallet_balance || 0,
    purchases: u.purchases?.length || 0,
  }));

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // File state
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) return;
      const { data: user } = await supabase.from("users").select("id,role").eq("email", email).single();
      if (user && user.role === "admin") {
        setIsAdmin(true);
        fetchAdminData();
        setupRealtime();
        fetchChat();
        subscribeChat();
        fetchFiles();
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
    return () => {
      supabase.removeAllChannels();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((u) => u.email.toLowerCase().includes(search.trim().toLowerCase()))
      );
    }
    setPage(1);
  }, [search, users]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Data fetch
  const fetchAdminData = async () => {
    setLoading(true);
    const { data: userList } = await supabase.from("users").select("id, email, role");
    if (!userList) return;

    const { data: wallets } = await supabase.from("wallets").select("user_id, balance");
    const { data: deposits } = await supabase.from("deposits").select("user_id, amount, date");
    const { data: purchases } = await supabase.from("purchases").select("user_id, network, bundle, amount, date");

    const records: UserRecord[] = userList.map((u: any) => ({
      ...u,
      wallet_balance: wallets?.find((w: any) => w.user_id === u.id)?.balance || 0,
      deposits: deposits?.filter((d: any) => d.user_id === u.id) || [],
      purchases: purchases?.filter((p: any) => p.user_id === u.id) || [],
    }));

    const totalUsers = records.length;
    const totalBalance = records.reduce((acc, u) => acc + (u.wallet_balance || 0), 0);
    const totalPurchases = purchases?.length || 0;

    setUsers(records);
    setStats({ totalUsers, totalBalance, totalPurchases });
    setLoading(false);
  };

  // Realtime updates for wallets, purchases, deposits
  const setupRealtime = () => {
    supabase
      .channel("wallets-admin")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "wallets" }, fetchAdminData)
      .subscribe();
    supabase
      .channel("purchases-admin")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "purchases" }, fetchAdminData)
      .subscribe();
    supabase
      .channel("deposits-admin")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "deposits" }, fetchAdminData)
      .subscribe();
  };

  // CSV Export
  const exportCSV = () => {
    const rows = filteredUsers.map(u => ({
      Email: u.email,
      Role: u.role,
      WalletBalance: u.wallet_balance,
      Deposits: (u.deposits || []).map(d => `GHS ${d.amount} (${d.date})`).join(" | "),
      Purchases: (u.purchases || []).map(p => `${p.network}-${p.bundle}: GHS ${p.amount} (${p.date})`).join(" | ")
    }));
    const csv =
      "Email,Role,WalletBalance,Deposits,Purchases\n" +
      rows.map(row => `"${row.Email}","${row.Role}","${row.WalletBalance}","${row.Deposits}","${row.Purchases}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin_users.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Block and Unblock
  const blockUser = async (userId: number) => {
    setBlockLoadingId(userId);
    const { error } = await supabase.from("users").update({ role: "blocked" }).eq("id", userId);
    setBlockLoadingId(null);
    if (!error) {
      fetchAdminData();
      alert("User blocked!");
    } else {
      alert("Failed to block user.");
    }
  };
  const unblockUser = async (userId: number) => {
    setBlockLoadingId(userId);
    const { error } = await supabase.from("users").update({ role: "user" }).eq("id", userId);
    setBlockLoadingId(null);
    if (!error) {
      fetchAdminData();
      alert("User unblocked!");
    } else {
      alert("Failed to unblock user.");
    }
  };

  // Pagination controls
  const handlePrev = () => setPage(prev => Math.max(prev - 1, 1));
  const handleNext = () => setPage(prev => Math.min(prev + 1, totalPages));
  const paginatedUsers = filteredUsers.slice((page - 1) * usersPerPage, page * usersPerPage);

  // Chat fetch and realtime
  const fetchChat = async () => {
    const { data } = await supabase.from("admin_chat").select("*").order("created_at", { ascending: true });
    if (data) setChatMessages(data);
  };
  const subscribeChat = () => {
    supabase
      .channel("admin-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_chat" }, fetchChat)
      .subscribe();
  };
  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const email = localStorage.getItem("userEmail") || "admin";
    await supabase.from("admin_chat").insert([{ user: email, message: chatInput }]);
    setChatInput("");
  };

  // File upload/fetch/list/delete
  const fetchFiles = async () => {
    const { data, error } = await supabase.storage.from("admin-files").list("", { sortBy: { column: "created_at", order: "desc" } });
    if (data) {
      const filesWithUrl: FileItem[] = await Promise.all(
        data.map(async (f: any) => ({
          name: f.name,
          url: supabase.storage.from("admin-files").getPublicUrl(f.name).publicUrl,
          created_at: f.created_at,
        }))
      );
      setFiles(filesWithUrl);
    }
  };
  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setUploading(true);
    const file = e.target.files[0];
    const { error } = await supabase.storage.from("admin-files").upload(file.name, file);
    setUploading(false);
    if (!error) fetchFiles();
    else alert("File upload failed");
  };
  const deleteFile = async (filename: string) => {
    const { error } = await supabase.storage.from("admin-files").remove([filename]);
    if (!error) fetchFiles();
    else alert("Failed to delete file");
  };

  // Chart rendering (simple SVG bar chart)
  const chartWidth = 600;
  const maxBalance = Math.max(...chartData.map(d => d.balance), 1);
  const maxPurchases = Math.max(...chartData.map(d => d.purchases), 1);

  if (!isAdmin) {
    return <div className="p-6 text-red-600 text-center font-bold">Access Denied: You are not an admin.</div>;
  }
  if (loading) {
    return <div className="p-6 text-gray-500 text-center">Loading admin dashboard...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-4xl text-center font-bold text-green-700">Admin Dashboard</h1>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="bg-gray-100 rounded shadow p-4">
          <h2 className="text-xl font-semibold">Total Users</h2>
          <p className="text-2xl font-bold text-green-700">{stats.totalUsers}</p>
        </div>
        <div className="bg-gray-100 rounded shadow p-4">
          <h2 className="text-xl font-semibold">Total Wallet Balance</h2>
          <p className="text-2xl font-bold text-green-700">GHS {stats.totalBalance.toFixed(2)}</p>
        </div>
        <div className="bg-gray-100 rounded shadow p-4">
          <h2 className="text-xl font-semibold">Total Purchases</h2>
          <p className="text-2xl font-bold text-green-700">{stats.totalPurchases}</p>
        </div>
      </div>

      {/* Search and CSV */}
      <div className="flex items-center justify-between mt-8 mb-2">
        <input type="text" placeholder="Search email..." className="border rounded p-2 w-60" value={search} onChange={e => setSearch(e.target.value)} />
        <button className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700" onClick={exportCSV}>Export CSV</button>
      </div>

      {/* Chart */}
      <div className="bg-white my-8 py-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">User Wallet Balances & Purchases Chart (Top 10)</h3>
        <svg width={chartWidth} height={220}>
          {chartData.slice(0, 10).map((d, i) => (
            <g key={d.email}>
              <rect x={i * 60 + 40} y={180 - (d.balance / maxBalance) * 160} width={20} height={(d.balance / maxBalance) * 160} fill="#22c55e" />
              <rect x={i * 60 + 65} y={180 - (d.purchases / maxPurchases) * 160} width={10} height={(d.purchases / maxPurchases) * 160} fill="#1d4ed8" />
              <text x={i * 60 + 40} y={200} fontSize="10" fill="#555" transform={`rotate(40,${i*60+40},200)`}>{d.email.slice(0,6)}...</text>
            </g>
          ))}
          <rect x={10} y={10} width={15} height={15} fill="#22c55e"/>
          <text x={30} y={22} fontSize="12">Balance</text>
          <rect x={110} y={10} width={10} height={15} fill="#1d4ed8"/>
          <text x={125} y={22} fontSize="12">Purchases</text>
        </svg>
      </div>

      {/* Users Table */}
      <h2 className="text-2xl font-bold text-green-800 mt-4">Users</h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-green-100">
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Wallet Balance</th>
              <th className="p-2">Deposits</th>
              <th className="p-2">Purchases</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((u) => (
              <tr key={u.id}>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">GHS {u.wallet_balance?.toFixed(2)}</td>
                <td className="p-2">
                  {u.deposits && u.deposits.length > 0
                    ? u.deposits.map((d, i) => (
                        <div key={i}>
                          <span className="font-semibold">GHS {d.amount}</span> <span className="text-xs text-gray-500">({d.date})</span>
                        </div>
                      ))
                    : <span className="text-gray-400">No deposits</span>}
                </td>
                <td className="p-2">
                  {u.purchases && u.purchases.length > 0
                    ? u.purchases.map((p, i) => (
                        <div key={i}>
                          <span>{p.network} - {p.bundle}:</span> <span className="font-semibold">GHS {p.amount}</span> <span className="text-xs text-gray-500">({p.date})</span>
                        </div>
                      ))
                    : <span className="text-gray-400">No purchases</span>}
                </td>
                <td className="p-2">
                  {u.role === "blocked" ? (
                    <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => unblockUser(u.id)} disabled={blockLoadingId === u.id}>
                      {blockLoadingId === u.id ? "..." : "Unblock"}
                    </button>
                  ) : (
                    <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => blockUser(u.id)} disabled={blockLoadingId === u.id}>
                      {blockLoadingId === u.id ? "..." : "Block"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination controls */}
        <div className="flex justify-center space-x-3 mt-6">
          <button className={`px-4 py-2 rounded border ${page === 1 ? "bg-gray-200" : "bg-green-600 text-white"}`} onClick={handlePrev} disabled={page === 1}>Prev</button>
          <span className="py-2">Page {page} / {totalPages}</span>
          <button className={`px-4 py-2 rounded border ${page === totalPages ? "bg-gray-200" : "bg-green-600 text-white"}`} onClick={handleNext} disabled={page === totalPages}>Next</button>
        </div>
      </div>

      {/* Admin Chat */}
      <div className="bg-gray-50 rounded shadow p-4 my-10">
        <h2 className="text-xl font-bold mb-3 text-green-700">Admin Chat</h2>
        <div style={{ maxHeight: 220, overflowY: "auto", background: "#f8fafc", padding: 12, borderRadius: 8 }}>
          {chatMessages.map((msg) => (
            <div key={msg.id} className="my-2">
              <span className="font-semibold text-green-700">{msg.user}:</span>{" "}
              <span>{msg.message}</span>{" "}
              <span className="text-xs text-gray-500">({new Date(msg.created_at).toLocaleString()})</span>
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>
        <div className="flex mt-2">
          <input type="text" className="border rounded p-2 flex-1 mr-2" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." />
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={sendChat}>Send</button>
        </div>
      </div>

      {/* Files Panel */}
      <div className="bg-gray-50 rounded shadow p-4 my-10">
        <h2 className="text-xl font-bold mb-3 text-green-700">Admin Files</h2>
        <div className="flex items-center mb-3">
          <input type="file" onChange={uploadFile} disabled={uploading} />
          {uploading && <span className="ml-2 text-gray-500">Uploading...</span>}
        </div>
        <ul>
          {files.map(file => (
            <li key={file.name} className="flex items-center justify-between py-2 border-b">
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{file.name}</a>
              <button className="bg-red-500 text-white px-2 py-1 rounded ml-2" onClick={() => deleteFile(file.name)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
