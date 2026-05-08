import { useMemo, useState } from 'react';

const API_URL = 'http://127.0.0.1:8000';

const roleProfiles: Record<string, RoleProfile> = {
  finance: {
    role: 'Finance Officer',
    departments: ['Finance'],
    accent: '#60a5fa',
  },
  hr: {
    role: 'HR Manager',
    departments: ['HR'],
    accent: '#38bdf8',
  },
  engineering: {
    role: 'Engineering Lead',
    departments: ['Engineering'],
    accent: '#818cf8',
  },
  admin: {
    role: 'Administrator',
    departments: ['Finance', 'HR', 'Engineering', 'Admin'],
    accent: '#8b5cf6',
  },
  executive: {
    role: 'Executive',
    departments: ['Finance', 'Admin'],
    accent: '#f472b6',
  },
};

const documents: Record<DepartmentKey, DocumentItem[]> = {
  Finance: [
    { title: 'Q1 2026 Financial Report', type: 'Report', size: '2.4 KB' },
    { title: 'Budget Forecast 2026', type: 'Forecast', size: '1.8 KB' },
    { title: 'Payroll Summary May 2026', type: 'Summary', size: '1.5 KB' },
  ],
  HR: [
    { title: 'Employee Handbook', type: 'Policy', size: '3.2 KB' },
    { title: 'Leave Policy 2026', type: 'Policy', size: '2.1 KB' },
    { title: 'Recruitment Guidelines', type: 'Guide', size: '1.9 KB' },
  ],
  Engineering: [
    { title: 'Kubernetes Architecture', type: 'Guide', size: '2.8 KB' },
    { title: 'Incident Response', type: 'Procedure', size: '2.2 KB' },
    { title: 'CI/CD Deployment Pipeline', type: 'Guide', size: '2.5 KB' },
  ],
  Admin: [
    { title: 'Company Strategy 2026-2028', type: 'Strategy', size: '3.1 KB' },
    { title: 'Security Audit Report', type: 'Audit', size: '2.7 KB' },
    { title: 'Compliance Report 2026', type: 'Report', size: '3.3 KB' },
  ],
};

type PageKey = 'Dashboard' | 'RAG' | 'Documents' | 'Analytics' | 'Settings';

type ChatEntry = {
  sender: 'user' | 'assistant';
  message: string;
};

type DepartmentKey = 'Finance' | 'HR' | 'Engineering' | 'Admin';

type DocumentItem = {
  title: string;
  type: string;
  size: string;
};

type RoleProfile = {
  role: string;
  departments: DepartmentKey[];
  accent: string;
};

const identifyRole = (username: string) => {
  const key = username.trim().toLowerCase();
  if (key.startsWith('finance')) return 'finance';
  if (key.startsWith('hr')) return 'hr';
  if (key.startsWith('engineering') || key.startsWith('engineer')) return 'engineering';
  if (key.startsWith('admin')) return 'admin';
  if (key.startsWith('exec') || key.startsWith('executive')) return 'executive';
  return null;
};

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState('');
  const [roleKey, setRoleKey] = useState<keyof typeof roleProfiles | null>(null);
  const [token, setToken] = useState('');
  const [currentPage, setCurrentPage] = useState<PageKey>('Dashboard');
  const [chat, setChat] = useState<ChatEntry[]>([]);
  const [query, setQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentKey>('Finance');
  const [status, setStatus] = useState('Ready');
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchInput, setSearchInput] = useState('');

  const profile = roleKey ? roleProfiles[roleKey] : null;
  const accessibleDocs = profile?.departments ?? [];


  const handleLogout = () => {
    setUser('');
    setRoleKey(null);
    setToken('');
    setChat([]);
    setQuery('');
    setStatus('Logged out');
  };

  const handleLogin = async () => {

  try {

    const formData = new URLSearchParams();

    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      setStatus("Invalid credentials");
      return;
    }

    const data = await response.json();

    const identified = identifyRole(username);

    if (!identified) {
      setStatus("Unknown role");
      return;
    }

    setUser(username);
    setRoleKey(identified);

    // REAL JWT TOKEN
    setToken(data.access_token);

    setSelectedDepartment(
      (roleProfiles[identified].departments[0]) as DepartmentKey
    );

    setStatus("Authenticated");

  } catch (error) {
    setStatus("Backend connection failed");
  }
};

const handleSend = async () => {
  if (!query.trim()) return;
  const nextChat: ChatEntry[] = [...chat, { sender: 'user' as const, message: query.trim() }];
  setChat(nextChat);
  setStatus('Sending query...');

  try {
    const response = await fetch(`${API_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: query.trim() }),
    });

    if (!response.ok) {
      setStatus('Query failed');
      return;
    }

    const data = await response.json();
    setChat((prev) => [...prev, { sender: 'assistant', message: data.response ?? 'No response available.' }]);
    setStatus('Ready');
    setQuery('');
  } catch (error) {
    setStatus('Failed to reach backend');
  }
};

  const departmentCards = useMemo(() => {
    if (!profile) return [];
    return profile.departments.map((dept) => ({
      title: dept,
      subtitle: `${dept} document access`,
      value: `${Math.floor(Math.random() * 20) + 8} docs`,
    }));
  }, [profile]);

  const filteredDocuments = useMemo(() => {
    const docs = documents[selectedDepartment] ?? [];
    return docs.filter((doc) => doc.title.toLowerCase().includes(searchInput.toLowerCase()));
  }, [selectedDepartment, searchInput]);

  const isAuthenticated = Boolean(user && token && profile);
  const layoutClass = isAuthenticated ? 'main-layout authenticated' : 'main-layout guest';

  return (
    <div className="app-shell">
      <div className="hero-bg" />
      <div className={layoutClass}>
        {isAuthenticated ? (
          <aside className="side-panel">
            <div className="brand-block">
              <div className="brand-title">RBAC RAG</div>
              <div className="brand-subtitle">Enterprise AI Access</div>
            </div>
            <nav className="nav-menu">
              {(['Dashboard', 'RAG', 'Documents', 'Analytics', 'Settings'] as PageKey[]).map((page) => (
                <button
                  key={page}
                  className={page === currentPage ? 'nav-button active' : 'nav-button'}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </nav>
            <div className="profile-card">
              <div className="profile-name">{user}</div>
              <div className="profile-role">{profile?.role}</div>
              <div className="profile-meta">Access: {profile?.departments.join(', ')}</div>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
            <div className="status-card">
              <div className="status-label">Status</div>
              <div className="status-value">{status}</div>
            </div>
          </aside>
        ) : null}

        <main className="content-panel">
          {!isAuthenticated ? (
            <div className="welcome-page">
              <div className="welcome-panel glass-panel">
                <div className="welcome-hero">
                  <div className="welcome-headline">Modern Enterprise RBAC + RAG</div>
                  <p className="welcome-copy">
                    Secure access, context-aware retrieval, and document intelligence for regulated teams.
                  </p>
                  <div className="feature-grid compact">
                    <div className="feature-card">
                      <div className="feature-icon">🔒</div>
                      <div className="feature-title">Role-aware access</div>
                      <div className="feature-desc">Protect documents at department level with a clear access model.</div>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon">⚡</div>
                      <div className="feature-title">Streamlined search</div>
                      <div className="feature-desc">Fast contextual queries across allowed content.</div>
                    </div>
                  </div>
                </div>
                <div className="login-panel">
                  <div className="login-header">Enterprise sign-in</div>
                  <label>Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="finance_user"
                  />
                  <label>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Secure password"
                  />
                  <button className="primary-button" onClick={handleLogin}>
                    Sign In
                  </button>
                  <p className="hint-copy">Use finance*, hr*, engineer*, admin* or exec* to simulate your role.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="page-shell">
              <div className="page-header">
                <div>
                  <div className="page-title">{currentPage}</div>
                  <div className="page-subtitle">{currentPage === 'Dashboard' ? 'Business metrics and secure access' : 'RBAC intelligence interface'}</div>
                </div>
                <div className="header-pill">{profile?.role}</div>
              </div>
              {currentPage === 'Dashboard' && (
                <>
                  <section className="top-metrics">
                    {departmentCards.map((card) => (
                      <div key={card.title} className="metric-card" style={{ borderColor: profile?.accent }}>
                        <div className="metric-label">{card.title}</div>
                        <div className="metric-value">{card.value}</div>
                        <div className="metric-helper">{card.subtitle}</div>
                      </div>
                    ))}
                  </section>
                  <section className="dashboard-grid">
                    <div className="glass-panel panel-large">
                      <div className="panel-title">Intelligent access summary</div>
                      <p>
                        Your role allows secure document retrieval inside permitted departments with minimal noise. All analytics are filtered to match your access scope.
                      </p>
                      <div className="stat-grid">
                        <div className="stat-block">
                          <span>Documents</span>
                          <strong>24</strong>
                        </div>
                        <div className="stat-block">
                          <span>Queries</span>
                          <strong>5,842</strong>
                        </div>
                        <div className="stat-block">
                          <span>Accuracy</span>
                          <strong>96.4%</strong>
                        </div>
                      </div>
                    </div>
                    <div className="glass-panel panel-small">
                      <div className="panel-title">Accessible departments</div>
                      <div className="department-list">
                        {accessibleDocs.map((dept) => (
                          <span key={dept} className="dept-pill" style={{ backgroundColor: profile?.accent }}>
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="glass-panel panel-small">
                      <div className="panel-title">Latest activity</div>
                      <ul className="activity-list">
                        <li>Review payroll summary</li>
                        <li>Analyze compliance trends</li>
                        <li>Inspect architecture notes</li>
                      </ul>
                    </div>
                  </section>
                </>
              )}
              {currentPage === 'RAG' && (
                <section className="chat-shell">
                  <div className="glass-panel panel-large">
                    <div className="panel-title">Enterprise RAG Conversation</div>
                    <div className="chat-area">
                      {chat.map((entry, index) => (
                        <div key={index} className={entry.sender === 'user' ? 'chat-row user' : 'chat-row assistant'}>
                          <span>{entry.sender === 'user' ? 'You' : 'Assistant'}</span>
                          <p>{entry.message}</p>
                        </div>
                      ))}
                    </div>
                    <div className="chat-input-row">
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={
                          profile
                            ? `Ask about ${profile.departments.join(', ')} documents`
                            : 'Ask about finance, HR, engineering, or admin documents'
                        }
                      />
                      <button className="primary-button" onClick={handleSend}>
                        Send
                      </button>
                    </div>
                  </div>
                </section>
              )}
              {currentPage === 'Documents' && (
                <section className="documents-shell">
                  <div className="glass-panel panel-small">
                    <div className="panel-title">Document Library</div>
                    <div className="filter-row">
                      <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search current department docs"
                      />
                      <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value as DepartmentKey)}>
                        {accessibleDocs.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="document-grid">
                    {filteredDocuments.map((doc) => (
                      <div key={doc.title} className="doc-card glass-panel">
                        <div className="doc-title">{doc.title}</div>
                        <div className="doc-meta">{doc.type} · {doc.size}</div>
                        <button className="secondary-button">View</button>
                      </div>
                    ))}
                    {filteredDocuments.length === 0 && <div className="empty-state">No documents match this search.</div>}
                  </div>
                </section>
              )}
              {currentPage === 'Analytics' && (
                <section className="analytics-shell">
                  <div className="glass-panel panel-large">
                    <div className="panel-title">Usage insights</div>
                    <div className="analytics-bar">
                      <div>
                        <span>Query volume</span>
                        <strong>5,842</strong>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: '84%' }} />
                      </div>
                    </div>
                    <div className="analytics-bar">
                      <div>
                        <span>System health</span>
                        <strong>99.97%</strong>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill green" style={{ width: '99.97%' }} />
                      </div>
                    </div>
                    <div className="analytics-grid">
                      <div className="mini-card">
                        <div>Response time</div>
                        <strong>285 ms</strong>
                      </div>
                      <div className="mini-card">
                        <div>Relevance</div>
                        <strong>94.1%</strong>
                      </div>
                      <div className="mini-card">
                        <div>Compliance score</div>
                        <strong>98.3%</strong>
                      </div>
                    </div>
                  </div>
                </section>
              )}
              {currentPage === 'Settings' && (
                <section className="settings-shell">
                  <div className="glass-panel panel-large">
                    <div className="panel-title">Account settings</div>
                    <div className="setting-row">
                      <div>Username</div>
                      <div>{user}</div>
                    </div>
                    <div className="setting-row">
                      <div>Role</div>
                      <div>{profile?.role}</div>
                    </div>
                    <div className="setting-row">
                      <div>Departments</div>
                      <div>{profile?.departments.join(', ')}</div>
                    </div>
                    <div className="setting-row">
                      <div>Token</div>
                      <div>{token.slice(0, 16)}...</div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
