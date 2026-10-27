import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ConfigProvider, theme, Layout, Button, Avatar, Tag, Typography, Divider, Menu, Badge, Modal, Drawer
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  PlusCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  UsergroupAddOutlined,
  BellOutlined,
  MessageOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';

// Merged Consolidated Modules (Auth, Dashboard, Groups, Partners)
import { LandingPage, RegisterPage, LoginPage } from './Auth';
import { StudentDashboard, ProfileManagementPage, NotificationsPage } from './Dashboard';
import { StudyGroupPage, CreateGroupPage, SessionSchedulerPage, ChatsPage } from './Groups';
import { FindPartnersPage } from './Partners';

const { Header, Sider, Content, Footer } = Layout;

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Windows Taskbar Style Auto-Hide Footer Component
function WindowsTaskbarFooter({ creditsOpen, setCreditsOpen }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Reveal taskbar when mouse reaches within 14px of the bottom edge of the browser window
      if (window.innerHeight - e.clientY <= 14) {
        setVisible(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // When credits modal is closed, auto-hide taskbar
    if (!creditsOpen) {
      setVisible(false);
    }
  }, [creditsOpen]);

  return (
    <>
      {/* Invisible Bottom Edge Hit Zone for Immediate Sensor Trigger (Mouse & Touch) */}
      <div
        onMouseEnter={() => setVisible(true)}
        onTouchStart={() => setVisible(true)}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 14,
          zIndex: 999,
          background: 'transparent',
          pointerEvents: visible ? 'none' : 'auto'
        }}
      />

      {/* Subtle Mobile/Touch Bar Pill for Touch Discovery */}
      <div
        onClick={() => setVisible(prev => !prev)}
        onTouchStart={() => setVisible(true)}
        title="Show footer & credits"
        style={{
          position: 'fixed',
          bottom: 2,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 50,
          height: 5,
          borderRadius: 3,
          backgroundColor: visible ? 'transparent' : 'rgba(30, 58, 138, 0.35)',
          zIndex: 998,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      />

      {/* Windows Taskbar Style Auto-Hide Footer */}
      <Footer
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => {
          if (!creditsOpen) {
            setVisible(false);
          }
        }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid #e2e8f0',
          boxShadow: visible ? '0 -4px 16px rgba(15, 23, 42, 0.08)' : 'none',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          flexWrap: 'wrap',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 380ms ease',
          userSelect: 'none'
        }}
      >
        <span style={{ fontWeight: 700, color: '#1e3a8a', fontSize: 13, letterSpacing: '-0.01em', textAlign: 'center' }}>
          PeerConnect — Student Study Group Management System
        </span>

        <Tag
          color="blue"
          style={{
            fontWeight: 700,
            borderRadius: 12,
            padding: '2px 10px',
            fontSize: 11,
            margin: 0,
            border: '1px solid #bfdbfe'
          }}
        >
          B.Tech S3 OOP Project • Group 1
        </Tag>

        <Button
          type="default"
          size="small"
          icon={<TeamOutlined style={{ color: '#1d4ed8' }} />}
          onClick={() => setCreditsOpen(true)}
          style={{
            fontWeight: 700,
            color: '#1d4ed8',
            borderColor: '#bfdbfe',
            background: '#eff6ff',
            borderRadius: 20,
            padding: '0 14px',
            height: 32,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 1px 2px rgba(29, 78, 216, 0.05)'
          }}
        >
          Project Credits
        </Button>
      </Footer>
    </>
  );
}

function MainLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Map route paths to menu keys
  let currentKey = location.pathname;
  if (currentKey === '/partners') currentKey = '/find-partners';

  // Automatically close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined style={{ fontSize: 16 }} />,
      label: 'Dashboard'
    },
    {
      key: '/notifications',
      icon: (
        <Badge count={unreadCount} size="small" offset={[6, -2]}>
          <BellOutlined style={{ fontSize: 16 }} />
        </Badge>
      ),
      label: (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Tag color="blue" style={{ fontSize: 10, padding: '0 6px', borderRadius: 10, margin: 0, fontWeight: 700 }}>
              {unreadCount}
            </Tag>
          )}
        </span>
      )
    },
    {
      key: '/chats',
      icon: <MessageOutlined style={{ fontSize: 16 }} />,
      label: 'Chats'
    },
    {
      key: '/find-partners',
      icon: <UsergroupAddOutlined style={{ fontSize: 16 }} />,
      label: 'Find Partners'
    },
    {
      key: '/groups',
      icon: <TeamOutlined style={{ fontSize: 16 }} />,
      label: 'Join Groups'
    },
    {
      key: '/create-group',
      icon: <PlusCircleOutlined style={{ fontSize: 16 }} />,
      label: 'Create Group'
    },
    {
      key: '/scheduler',
      icon: <CalendarOutlined style={{ fontSize: 16 }} />,
      label: 'Schedule Session'
    },
    {
      key: '/profile',
      icon: <UserOutlined style={{ fontSize: 16 }} />,
      label: 'Profile'
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top Header */}
      <Header 
        className="academic-header" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          height: 64,
          lineHeight: 'normal',
          padding: '0 20px',
          background: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        {/* Brand Logo & Academic Title Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Mobile Hamburger Button */}
          {user && (
            <Button
              type="text"
              className="mobile-only"
              icon={<MenuOutlined style={{ fontSize: 20, color: '#1e3a8a' }} />}
              onClick={() => setDrawerOpen(true)}
              style={{
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                marginRight: 2
              }}
              aria-label="Toggle navigation menu"
            />
          )}

          <Link to={user ? "/dashboard" : "/"} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="academic-logo-badge">
              <TeamOutlined />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#1e3a8a', letterSpacing: -0.5 }}>
                  PeerConnect
                </span>
                <span className="header-tag-badge">
                  <Tag 
                    color="blue" 
                    style={{ 
                      fontSize: 11, 
                      fontWeight: 700, 
                      borderRadius: 12, 
                      padding: '1px 8px', 
                      margin: 0,
                      borderColor: '#93c5fd',
                      background: '#eff6ff',
                      color: '#1e40af'
                    }}
                  >
                    B.Tech S3 OOP Project • Group 1
                  </Tag>
                </span>
              </div>
              <div className="header-subtext" style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                Student Study Group Management System
              </div>
            </div>
          </Link>
        </div>

        {/* Top Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!user ? (
            <>
              <span className="desktop-only">
                <Link to="/"><Button type="text" style={{ color: '#334155', fontWeight: 600 }}>Home</Button></Link>
                <Link to="/groups"><Button type="text" style={{ color: '#334155', fontWeight: 600 }}>Explore Groups</Button></Link>
              </span>
              <Link to="/login"><Button type="default" style={{ fontWeight: 600 }}>Sign In</Button></Link>
              <Link to="/register"><Button type="primary" style={{ fontWeight: 600 }}>Register</Button></Link>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link to="/notifications" style={{ display: 'flex', alignItems: 'center' }} title="Notifications">
                <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                  <Button 
                    type="text" 
                    icon={<BellOutlined style={{ fontSize: 18, color: '#1e3a8a' }} />} 
                    style={{ 
                      width: 36, 
                      height: 36, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: '#f1f5f9',
                      borderRadius: '50%'
                    }}
                  />
                </Badge>
              </Link>

              <Link to="/chats" style={{ display: 'flex', alignItems: 'center' }} title="Chats">
                <Button 
                  type="text" 
                  icon={<MessageOutlined style={{ fontSize: 18, color: '#1e3a8a' }} />} 
                  style={{ 
                    width: 36, 
                    height: 36, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: '#f1f5f9',
                    borderRadius: '50%'
                  }}
                />
              </Link>

              <Avatar 
                onClick={() => setDrawerOpen(true)}
                style={{ backgroundColor: '#1d4ed8', fontWeight: 700, cursor: 'pointer' }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>

              <div className="desktop-only" style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{user.department || 'Student'}</div>
              </div>

              <span className="desktop-only">
                <Divider type="vertical" style={{ height: 24, borderColor: '#cbd5e1' }} />
                <Button 
                  type="text" 
                  danger 
                  icon={<LogoutOutlined />}
                  onClick={logout} 
                  title="Log Out"
                >
                  Log Out
                </Button>
              </span>
            </div>
          )}
        </div>
      </Header>

      {/* Main Container Layout with Left Sidebar */}
      <Layout>
        {/* Desktop Sidebar (Hidden on mobile via .desktop-sider) */}
        {user && (
          <Sider
            width={240}
            breakpoint="lg"
            collapsedWidth="70"
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            className="academic-sider desktop-sider"
            style={{
              background: '#ffffff',
              borderRight: '1px solid #e2e8f0',
              position: 'sticky',
              top: 64,
              height: 'calc(100vh - 64px)',
              overflowY: 'auto',
              zIndex: 99,
              paddingTop: 8
            }}
          >
            <Menu
              mode="inline"
              selectedKeys={[currentKey]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
              style={{ borderRight: 0 }}
            />
          </Sider>
        )}

        {/* Mobile Slide-in Navigation Drawer */}
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={280}
          bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="academic-logo-badge" style={{ width: 34, height: 34, fontSize: 18 }}>
                <TeamOutlined />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: 16 }}>PeerConnect</div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Study Group Management</div>
              </div>
            </div>
          }
        >
          {user && (
            <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar size={44} style={{ backgroundColor: '#1d4ed8', fontWeight: 700, flexShrink: 0 }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.department || 'Student'} • {user.semester || 'S3'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 4px' }}>
            <Menu
              mode="inline"
              selectedKeys={[currentKey]}
              items={menuItems}
              className="mobile-nav-menu"
              onClick={({ key }) => {
                navigate(key);
                setDrawerOpen(false);
              }}
              style={{ borderRight: 0 }}
            />
          </div>

          {user && (
            <div style={{ padding: '14px 16px', borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
              <Button
                danger
                block
                icon={<LogoutOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  logout();
                }}
                style={{ fontWeight: 600, minHeight: 44, borderRadius: 8 }}
              >
                Log Out
              </Button>
            </div>
          )}
        </Drawer>

        <Layout style={{ background: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>
          <Content className={user ? "authenticated-page-wrapper" : "page-wrapper"}>
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Registration Page */}
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Login Page */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Dashboard */}
              <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
              
              {/* Notifications Page */}
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

              {/* Chats Page */}
              <Route path="/chats" element={<ProtectedRoute><ChatsPage /></ProtectedRoute>} />

              {/* Find Study Partners Page */}
              <Route path="/find-partners" element={<ProtectedRoute><FindPartnersPage /></ProtectedRoute>} />
              <Route path="/partners" element={<Navigate to="/find-partners" replace />} />

              {/* Join Group / Explore Page */}
              <Route path="/groups" element={<StudyGroupPage />} />
              
              {/* Create Group Page */}
              <Route path="/create-group" element={<ProtectedRoute><CreateGroupPage /></ProtectedRoute>} />
              
              {/* Session Scheduling Page */}
              <Route path="/scheduler" element={<ProtectedRoute><SessionSchedulerPage /></ProtectedRoute>} />
              
              {/* Profile Page */}
              <Route path="/profile" element={<ProtectedRoute><ProfileManagementPage /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Content>

          {/* Windows Taskbar Style Auto-Hide Footer */}
          <WindowsTaskbarFooter creditsOpen={creditsOpen} setCreditsOpen={setCreditsOpen} />

          {/* Project Credits Modal */}
          <Modal
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1e3a8a', fontSize: 16 }}>
                <TeamOutlined style={{ color: '#1d4ed8', fontSize: 20 }} />
                <span style={{ fontWeight: 800 }}>Project Credits</span>
              </div>
            }
            open={creditsOpen}
            onCancel={() => setCreditsOpen(false)}
            footer={[
              <Button key="close" type="primary" onClick={() => setCreditsOpen(false)} style={{ fontWeight: 600 }}>
                Close
              </Button>
            ]}
            width={500}
            centered
          >
            <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, marginBottom: 4 }}>
                PeerConnect — Student Study Group Management System
              </div>
              <Tag color="blue" style={{ fontWeight: 600 }}>
                B.Tech Computer Science & Engineering • S3 OOP Project (Group 1)
              </Tag>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: 'HIMASANKAR V', role: 'Project Integration & Full Stack Development' },
                { name: 'AAKIFA SHERIN', role: 'MongoDB Database Design' },
                { name: 'GOURI S UNNI', role: 'Group Management System' },
                { name: 'GAYATHRI DAS R', role: 'Notification System & Testing' },
                { name: 'AALIYA NOUSHAD', role: 'User Interface Design & Documentation' }
              ].map((member) => (
                <div
                  key={member.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar style={{ backgroundColor: '#1d4ed8', fontWeight: 700, width: 36, height: 36, lineHeight: '36px' }}>
                      {member.name.charAt(0)}
                    </Avatar>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
                        {member.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>
                        {member.role}
                      </div>
                    </div>
                  </div>
                  <Tag color="geekblue" style={{ fontWeight: 600, fontSize: 11, margin: 0 }}>
                    CSE • S3
                  </Tag>
                </div>
              ))}
            </div>
          </Modal>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm, // Clean Academic Light Mode
        token: {
          colorPrimary: '#1d4ed8',       // University Royal Blue
          colorInfo: '#0284c7',          // Sky Blue
          colorLink: '#1d4ed8',
          colorBgBase: '#ffffff',
          colorBorder: '#e2e8f0',
          borderRadius: 8,
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        },
        components: {
          Layout: {
            siderBg: '#ffffff',
            triggerBg: '#ffffff',
            triggerColor: '#1e3a8a'
          }
        }
      }}
    >
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <MainLayout />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}
