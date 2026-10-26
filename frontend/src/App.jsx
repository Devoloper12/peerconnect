import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ConfigProvider, theme, Layout, Button, Avatar, Tag, Typography, Divider, Menu, Badge, Modal
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
  MessageOutlined
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

function MainLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);

  // Map route paths to menu keys
  let currentKey = location.pathname;
  if (currentKey === '/partners') currentKey = '/find-partners';

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
          padding: '0 24px',
          background: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}
      >
        {/* Brand Logo & Academic Title Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to={user ? "/dashboard" : "/"} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="academic-logo-badge" style={{ fontSize: 20 }}>
              <TeamOutlined />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#1e3a8a', letterSpacing: -0.5 }}>
                  PeerConnect
                </span>
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
              </div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                Student Study Group Management System
              </div>
            </div>
          </Link>
        </div>

        {/* Top Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!user ? (
            <>
              <Link to="/"><Button type="text" style={{ color: '#334155', fontWeight: 600 }}>Home</Button></Link>
              <Link to="/groups"><Button type="text" style={{ color: '#334155', fontWeight: 600 }}>Explore Groups</Button></Link>
              <Link to="/login"><Button type="default" style={{ fontWeight: 600 }}>Sign In</Button></Link>
              <Link to="/register"><Button type="primary" style={{ fontWeight: 600 }}>Register</Button></Link>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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

              <Avatar style={{ backgroundColor: '#1d4ed8', fontWeight: 700 }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{user.department || 'Student'}</div>
              </div>

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
            </div>
          )}
        </div>
      </Header>

      {/* Main Container Layout with Left Sidebar */}
      <Layout>
        {user && (
          <Sider
            width={240}
            breakpoint="lg"
            collapsedWidth="70"
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            className="academic-sider"
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

          <Footer style={{ textAlign: 'center', background: '#ffffff', borderTop: '1px solid #e2e8f0', color: '#64748b', padding: '20px 24px', fontSize: 13 }}>
            <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: 14, marginBottom: 4 }}>
              PeerConnect — Student Study Group Management System
            </div>
            <div style={{ marginBottom: 10 }}>
              <Tag color="blue" style={{ fontWeight: 700, borderRadius: 12, padding: '1px 10px' }}>
                B.Tech S3 OOP Project • Group 1
              </Tag>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, margin: '0 auto' }}>
              <Button 
                type="default" 
                size="middle"
                icon={<TeamOutlined style={{ color: '#1d4ed8' }} />}
                onClick={() => setCreditsOpen(true)}
                style={{ 
                  fontWeight: 700, 
                  color: '#1d4ed8', 
                  borderColor: '#bfdbfe',
                  background: '#eff6ff',
                  borderRadius: 20,
                  padding: '0 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 1px 2px rgba(29, 78, 216, 0.05)'
                }}
              >
                Project Credits
              </Button>
            </div>
          </Footer>

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
          colorBorder: '#cbd5e1',
          borderRadius: 8,
          fontFamily: "'Plus Jakarta Sans', sans-serif"
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
