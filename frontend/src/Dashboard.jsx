import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Avatar,
  Space,
  Spin,
  Empty,
  Badge,
  Form,
  Input,
  Select,
  Divider,
  Tabs,
  Popconfirm,
  message
} from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  BookOutlined,
  UserOutlined,
  AppstoreOutlined,
  ReadOutlined,
  CheckCircleOutlined,
  UsergroupAddOutlined,
  BellOutlined,
  ClockCircleOutlined,
  NotificationOutlined,
  ThunderboltOutlined,
  ArrowRightOutlined,
  MessageOutlined,
  SaveOutlined,
  BulbOutlined,
  BankOutlined,
  PlusOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useAuth } from './context/AuthContext';
import { useNotifications } from './context/NotificationContext';
import { getMyGroupsApi, getSessionsApi, updateProfileApi } from './api/client';
import {
  ACADEMIC_INTERESTS,
  LEARNING_PREFERENCES,
  DEPARTMENTS,
  YEARS,
  SEMESTERS
} from './constants/academicData';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// ============================================================================
// 1. STUDENT DASHBOARD COMPONENT
// ============================================================================
export function StudentDashboard() {
  const { user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [gRes, sRes] = await Promise.allSettled([
        getMyGroupsApi(),
        getSessionsApi()
      ]);

      if (gRes.status === 'fulfilled' && gRes.value?.data) {
        setMyGroups(gRes.value.data.groupsJoined || []);
      }
      if (sRes.status === 'fulfilled' && sRes.value?.data) {
        setUpcomingSessions(sRes.value.data.sessions || []);
      }
    } catch (err) {
      console.warn('Dashboard loading notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const academicInterests = user?.academicInterests || user?.subjects || [];
  const learningPreferences = user?.learningPreferences || (user?.learningPreference ? [user?.learningPreference] : []);

  // Helper for notification relative time
  const formatTime = (dateInput) => {
    if (!dateInput) return 'Recently';
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return `Yesterday`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getTypeConfig = (type) => {
    switch (type) {
      case 'SESSION_REMINDER':
        return {
          icon: <ClockCircleOutlined style={{ fontSize: 16, color: '#d97706' }} />,
          tag: 'Session Reminder',
          color: 'orange'
        };
      case 'SESSION':
        return {
          icon: <CalendarOutlined style={{ fontSize: 16, color: '#1d4ed8' }} />,
          tag: 'Session',
          color: 'blue'
        };
      case 'MEMBER_JOINED':
        return {
          icon: <UsergroupAddOutlined style={{ fontSize: 16, color: '#16a34a' }} />,
          tag: 'Member Joined',
          color: 'green'
        };
      case 'JOIN':
      case 'JOIN_REQUEST':
        return {
          icon: <CheckCircleOutlined style={{ fontSize: 16, color: '#16a34a' }} />,
          tag: 'Group Enrollment',
          color: 'green'
        };
      case 'PARTNER_MATCH':
      case 'INVITATION':
        return {
          icon: <ThunderboltOutlined style={{ fontSize: 16, color: '#0284c7' }} />,
          tag: 'Study Partner',
          color: 'cyan'
        };
      case 'GROUP_UPDATE':
        return {
          icon: <NotificationOutlined style={{ fontSize: 16, color: '#7c3aed' }} />,
          tag: 'Group Update',
          color: 'purple'
        };
      default:
        return {
          icon: <BellOutlined style={{ fontSize: 16, color: '#64748b' }} />,
          tag: 'Notice',
          color: 'default'
        };
    }
  };

  return (
    <div>
      {/* Student Welcome Header Card */}
      <Card 
        className="academic-card" 
        style={{ 
          marginBottom: 24, 
          padding: '8px 12px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
          borderColor: '#bfdbfe'
        }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <Avatar size={64} style={{ backgroundColor: '#1d4ed8', fontSize: 26, fontWeight: 700, flexShrink: 0 }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </Avatar>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Title level={3} style={{ color: '#1e3a8a', margin: 0, fontWeight: 800 }}>
                    Welcome, {user?.name || 'Student'}!
                  </Title>
                  <Tag color="blue" style={{ fontWeight: 600 }}>{user?.department || 'Computer Science & Engineering'}</Tag>
                  <Tag color="cyan" style={{ fontWeight: 600 }}>{user?.semester || 'S3'} • {user?.year || '2nd Year'}</Tag>
                </div>

                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <Text type="secondary" style={{ fontSize: 13, fontWeight: 600, marginRight: 4 }}>
                    Academic Subjects:
                  </Text>
                  {academicInterests.length > 0 ? (
                    academicInterests.map(subj => (
                      <Tag key={subj} color="geekblue" style={{ margin: '2px 4px' }}>
                        {subj}
                      </Tag>
                    ))
                  ) : (
                    <Text type="secondary" style={{ fontSize: 13 }}>None specified</Text>
                  )}
                </div>

                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <Text type="secondary" style={{ fontSize: 13, fontWeight: 600, marginRight: 4 }}>
                    Learning Preferences:
                  </Text>
                  {learningPreferences.length > 0 ? (
                    learningPreferences.map(pref => (
                      <Tag key={pref} color="green" style={{ margin: '2px 4px' }}>
                        {pref}
                      </Tag>
                    ))
                  ) : (
                    <Tag color="green">Group Discussion</Tag>
                  )}
                  {user?.availability && (
                    <Tag color="orange" style={{ margin: '2px 4px' }}>
                      ⏰ {user.availability}
                    </Tag>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 4 Clean Academic Statistics Widgets with Live Badges */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-widget" onClick={() => navigate('/groups')} style={{ cursor: 'pointer' }}>
            <div className="stat-widget-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
              <TeamOutlined />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                My Enrolled Groups
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
                {myGroups.length}
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-widget" onClick={() => navigate('/scheduler')} style={{ cursor: 'pointer' }}>
            <div className="stat-widget-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <CalendarOutlined />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Upcoming Sessions
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
                {upcomingSessions.length}
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="stat-widget" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
            <div className="stat-widget-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
              <BookOutlined />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Enrolled Subjects
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
                {academicInterests.length}
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div 
            className="stat-widget" 
            onClick={() => navigate('/notifications')} 
            style={{ 
              cursor: 'pointer',
              borderColor: unreadCount > 0 ? '#93c5fd' : '#e2e8f0',
              background: unreadCount > 0 ? '#f0f9ff' : '#ffffff'
            }}
          >
            <div className="stat-widget-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
              <Badge count={unreadCount} overflowCount={99} size="small" offset={[2, -2]}>
                <BellOutlined style={{ fontSize: 20 }} />
              </Badge>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Academic Alerts
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
                  {unreadCount}
                </span>
                <span style={{ fontSize: 12, color: unreadCount > 0 ? '#1d4ed8' : '#64748b', fontWeight: 600 }}>
                  {unreadCount > 0 ? 'unread' : 'all caught up'}
                </span>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Main Grid: My Groups & Upcoming Sessions */}
      <Row gutter={[24, 24]}>
        {/* Left Column: My Study Groups */}
        <Col xs={24} lg={14}>
          <Card 
            className="academic-card"
            title={<span style={{ color: '#1e3a8a' }}>👥 My Enrolled Study Groups</span>}
            extra={<Button type="link" onClick={() => navigate('/groups')}>Explore All Groups →</Button>}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
            ) : myGroups.length === 0 ? (
              <Empty description="You have not joined any study groups yet.">
                <Button type="primary" onClick={() => navigate('/groups')}>Browse & Join Groups</Button>
              </Empty>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myGroups.map(grp => (
                  <div 
                    key={grp._id || grp.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#ffffff'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Tag color="blue">{grp.subject}</Tag>
                        {grp.semester && <Tag color="cyan">{grp.semester}</Tag>}
                      </div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, marginTop: 4 }}>
                        {grp.groupName}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        👥 {(grp.members || []).length} / {grp.maxMembers || 8} students enrolled
                      </div>
                    </div>

                    <Space wrap>
                      <Button 
                        type="default" 
                        size="small" 
                        icon={<MessageOutlined />}
                        onClick={() => navigate(`/chats?type=GROUP&id=${grp._id || grp.id}`)}
                      >
                        Group Chat
                      </Button>
                      <Button 
                        type="default" 
                        size="small" 
                        icon={<CalendarOutlined />}
                        onClick={() => navigate('/scheduler')}
                      >
                        Schedule
                      </Button>
                    </Space>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Academic Notifications & Reminders Card */}
          <Card 
            className="academic-card"
            style={{ marginTop: 24 }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#1e3a8a', fontWeight: 700 }}>🔔 Academic Notifications & Reminders</span>
                {unreadCount > 0 && (
                  <Badge count={unreadCount} style={{ backgroundColor: '#1d4ed8' }} />
                )}
              </div>
            }
            extra={
              <Button type="link" onClick={() => navigate('/notifications')}>
                View All Notifications →
              </Button>
            }
          >
            {notifications.length === 0 ? (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No academic notifications yet. You will see session reminders, group updates, and match invites here." 
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notifications.slice(0, 4).map(item => {
                  const cfg = getTypeConfig(item.type);
                  return (
                    <div
                      key={item._id || item.id}
                      onClick={() => navigate('/notifications')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 8,
                        border: '1px solid',
                        borderColor: item.read ? '#e2e8f0' : '#bfdbfe',
                        background: item.read ? '#ffffff' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12
                      }}
                    >
                      <div style={{ marginTop: 2 }}>{cfg.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Tag color={cfg.color} style={{ fontSize: 11, margin: 0 }}>{cfg.tag}</Tag>
                            <span style={{ fontWeight: item.read ? 600 : 700, color: '#0f172a', fontSize: 13 }}>
                              {item.title || 'Notification'}
                            </span>
                          </div>
                          <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            {formatTime(item.createdAt)}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#475569', marginTop: 4, lineHeight: 1.4 }}>
                          {item.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>

        {/* Right Column: Upcoming Sessions */}
        <Col xs={24} lg={10}>
          <Card 
            className="academic-card"
            title={<span style={{ color: '#1e3a8a' }}>🗓️ Scheduled Study Sessions</span>}
            extra={<Button type="link" onClick={() => navigate('/scheduler')}>+ New Session</Button>}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
            ) : upcomingSessions.length === 0 ? (
              <Empty description="No study sessions scheduled yet.">
                <Button size="small" type="primary" onClick={() => navigate('/scheduler')}>Schedule Now</Button>
              </Empty>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingSessions.slice(0, 4).map(s => (
                  <div 
                    key={s._id || s.id}
                    style={{
                      borderLeft: '4px solid #1d4ed8',
                      background: '#f8fafc',
                      padding: '10px 14px',
                      borderRadius: '0 6px 6px 0',
                      borderTop: '1px solid #e2e8f0',
                      borderRight: '1px solid #e2e8f0',
                      borderBottom: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>
                      {s.topic}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      📅 {s.date ? new Date(s.date).toLocaleDateString() : ''} at {s.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Academic Collaboration Card */}
          <Card 
            className="academic-card"
            style={{ marginTop: 24 }}
            title={<span style={{ color: '#1e3a8a' }}>🤝 Peer Collaboration</span>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Button 
                type="primary" 
                icon={<UsergroupAddOutlined />} 
                onClick={() => navigate('/find-partners')}
                style={{ width: '100%', fontWeight: 600 }}
              >
                Find Recommended Study Partners
              </Button>
              <Button 
                type="default" 
                icon={<TeamOutlined />} 
                onClick={() => navigate('/groups')}
                style={{ width: '100%', fontWeight: 600 }}
              >
                Browse Syllabus Study Groups
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

// ============================================================================
// 2. PROFILE MANAGEMENT PAGE COMPONENT
// ============================================================================
export function ProfileManagementPage() {
  const { user, saveAuth, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        name: values.name,
        department: values.department,
        year: values.year,
        semester: values.semester,
        academicInterests: values.academicInterests || [],
        personalInterests: [],
        learningPreferences: values.learningPreferences || [],
        availability: values.availability,
        subjects: values.academicInterests || [],
        interests: [],
        learningPreference: (values.learningPreferences || []).join(', ')
      };

      const res = await updateProfileApi(payload);
      if (res.data?.user) {
        saveAuth(res.data.user, token);
        message.success('Academic profile updated successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const initialAcademic = user?.academicInterests?.length
    ? user.academicInterests
    : (user?.subjects?.length ? user.subjects : ['Data Structures', 'DBMS']);

  const initialLearning = user?.learningPreferences?.length
    ? user.learningPreferences
    : (user?.learningPreference ? [user.learningPreference] : ['Group Discussion', 'Problem Solving']);

  // Subject Options (includes default syllabus + any custom subjects user has)
  const [subjectOptions, setSubjectOptions] = useState(
    Array.from(new Set([...ACADEMIC_INTERESTS, ...initialAcademic])).map((s) => ({
      label: s,
      value: s
    }))
  );
  const [customSubjectInput, setCustomSubjectInput] = useState('');

  const handleAddCustomSubject = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = customSubjectInput.trim();
    if (!trimmed) {
      message.warning('Please enter a subject name');
      return;
    }
    if (!subjectOptions.some((opt) => opt.value.toLowerCase() === trimmed.toLowerCase())) {
      setSubjectOptions((prev) => [...prev, { label: trimmed, value: trimmed }]);
    }
    const current = form.getFieldValue('academicInterests') || [];
    if (!current.includes(trimmed)) {
      form.setFieldsValue({ academicInterests: [...current, trimmed] });
    }
    setCustomSubjectInput('');
    message.success(`Subject "${trimmed}" added!`);
  };

  return (
    <div style={{ maxWidth: 720, margin: '20px auto' }}>
      <Card 
        className="academic-card"
        style={{ padding: '16px 20px', borderTop: '4px solid #1d4ed8' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
          <Avatar size={64} style={{ backgroundColor: '#1d4ed8', fontSize: 26, fontWeight: 700 }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </Avatar>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Title level={3} style={{ color: '#1e3a8a', margin: 0, fontWeight: 800 }}>
                {user?.name || 'Student Profile'}
              </Title>
              <Tag color="blue">{user?.department || 'Computer Science & Engineering'}</Tag>
              <Tag color="cyan">{user?.semester || 'S3'}</Tag>
            </div>
            <Paragraph style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13 }}>
              Manage your academic standing, course interests, and study preferences
            </Paragraph>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: user?.name,
            email: user?.email,
            department: user?.department || 'Computer Science & Engineering',
            year: user?.year || '2nd Year',
            semester: user?.semester || 'S3',
            academicInterests: initialAcademic,
            learningPreferences: initialLearning,
            availability: user?.availability || 'Evenings 6 PM - 9 PM'
          }}
          onFinish={onFinish}
        >
          {/* Section 1: Basic Info */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Full Name</span>} 
                name="name" 
                rules={[{ required: true, message: 'Please enter name' }]}
              >
                <Input size="large" prefix={<UserOutlined style={{ color: '#94a3b8' }} />} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Email Address</span>} 
                name="email"
              >
                <Input size="large" disabled />
              </Form.Item>
            </Col>
          </Row>

          {/* Section 2: Academic Details */}
          <Divider style={{ margin: '14px 0', borderColor: '#e2e8f0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <BankOutlined style={{ color: '#1d4ed8' }} />
            <Text strong style={{ color: '#1e3a8a', textTransform: 'uppercase', fontSize: 13 }}>
              Academic Program
            </Text>
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Department</span>} 
                name="department"
              >
                <Select size="large">
                  {DEPARTMENTS.map(d => <Option key={d} value={d}>{d}</Option>)}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Item 
                label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Year</span>} 
                name="year"
              >
                <Select size="large">
                  {YEARS.map(y => <Option key={y} value={y}>{y}</Option>)}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Item 
                label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Semester</span>} 
                name="semester"
              >
                <Select size="large">
                  {SEMESTERS.map(s => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Section 3: Academic Interests */}
          <Divider style={{ margin: '14px 0', borderColor: '#e2e8f0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <BookOutlined style={{ color: '#1d4ed8' }} />
            <Text strong style={{ color: '#1e3a8a', textTransform: 'uppercase', fontSize: 13 }}>
              Academic Interests (Select or add custom subjects)
            </Text>
          </div>

          <Form.Item 
            name="academicInterests" 
            rules={[{ required: true, message: 'Please select or add your academic interests' }]}
          >
            <Select 
              mode="tags" 
              size="large" 
              placeholder="Select or type to add subjects (e.g. Cloud Computing)..."
              options={subjectOptions}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ padding: '4px 8px 6px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1e3a8a', marginBottom: 6, textTransform: 'uppercase' }}>
                      + Add Custom Subject
                    </div>
                    <Space.Compact style={{ width: '100%' }}>
                      <Input
                        placeholder="Type subject name (e.g. Machine Learning)"
                        value={customSubjectInput}
                        onChange={(e) => setCustomSubjectInput(e.target.value)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') handleAddCustomSubject(e);
                        }}
                        size="middle"
                      />
                      <Button type="primary" size="middle" icon={<PlusOutlined />} onClick={handleAddCustomSubject}>
                        Add Subject
                      </Button>
                    </Space.Compact>
                  </div>
                </div>
              )}
            />
          </Form.Item>

          {/* Section 4: Learning Preferences & Availability */}
          <Divider style={{ margin: '14px 0', borderColor: '#e2e8f0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <BulbOutlined style={{ color: '#d97706' }} />
            <Text strong style={{ color: '#1e3a8a', textTransform: 'uppercase', fontSize: 13 }}>
              Study Style & Schedule
            </Text>
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Learning Preferences</span>} 
                name="learningPreferences"
              >
                <Select mode="multiple" size="large">
                  {LEARNING_PREFERENCES.map(p => <Option key={p} value={p}>{p}</Option>)}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item 
                label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Weekly Availability</span>} 
                name="availability"
              >
                <Select size="large">
                  <Option value="Evenings 6 PM - 9 PM">Evenings 6 PM - 9 PM</Option>
                  <Option value="Weekdays Late Night (9 PM - Midnight)">Weekdays Late Night (9 PM - Midnight)</Option>
                  <Option value="Weekends Morning (9 AM - 1 PM)">Weekends Morning (9 AM - 1 PM)</Option>
                  <Option value="Weekends All Day">Weekends All Day</Option>
                  <Option value="Flexible / On Demand">Flexible / On Demand</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Button 
            type="primary" 
            htmlType="submit" 
            size="large" 
            loading={loading} 
            icon={<SaveOutlined />}
            style={{ marginTop: 8, height: 44, fontWeight: 700 }}
            block
          >
            Save Updated Academic Profile
          </Button>
        </Form>
      </Card>
    </div>
  );
}

// ============================================================================
// 3. NOTIFICATIONS PAGE COMPONENT
// ============================================================================
export function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearAll
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('ALL');
  const navigate = useNavigate();

  // Helper to format timestamps relative to now
  const formatTime = (dateInput) => {
    if (!dateInput) return 'Recently';
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Get icon and tag config per notification type
  const getTypeConfig = (type) => {
    switch (type) {
      case 'SESSION_REMINDER':
        return {
          icon: <ClockCircleOutlined style={{ fontSize: 20, color: '#d97706' }} />,
          bg: '#fffbeb',
          tag: 'Session Reminder',
          color: 'orange'
        };
      case 'SESSION':
        return {
          icon: <CalendarOutlined style={{ fontSize: 20, color: '#1d4ed8' }} />,
          bg: '#eff6ff',
          tag: 'New Session',
          color: 'blue'
        };
      case 'MEMBER_JOINED':
        return {
          icon: <UsergroupAddOutlined style={{ fontSize: 20, color: '#16a34a' }} />,
          bg: '#f0fdf4',
          tag: 'Member Joined',
          color: 'green'
        };
      case 'JOIN':
      case 'JOIN_REQUEST':
        return {
          icon: <CheckCircleOutlined style={{ fontSize: 20, color: '#16a34a' }} />,
          bg: '#f0fdf4',
          tag: 'Group Enrollment',
          color: 'green'
        };
      case 'PARTNER_MATCH':
      case 'INVITATION':
        return {
          icon: <ThunderboltOutlined style={{ fontSize: 20, color: '#0284c7' }} />,
          bg: '#f0f9ff',
          tag: 'Study Partner',
          color: 'cyan'
        };
      case 'GROUP_UPDATE':
        return {
          icon: <NotificationOutlined style={{ fontSize: 20, color: '#7c3aed' }} />,
          bg: '#faf5ff',
          tag: 'Group Update',
          color: 'purple'
        };
      default:
        return {
          icon: <InfoCircleOutlined style={{ fontSize: 20, color: '#2563eb' }} />,
          bg: '#f8fafc',
          tag: 'General Alert',
          color: 'default'
        };
    }
  };

  // Filter list by tab
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'UNREAD') return !n.read;
    if (activeTab === 'SESSIONS') return ['SESSION', 'SESSION_REMINDER'].includes(n.type);
    if (activeTab === 'GROUPS') return ['GROUP_UPDATE', 'MEMBER_JOINED', 'JOIN', 'JOIN_REQUEST'].includes(n.type);
    if (activeTab === 'PARTNERS') return ['PARTNER_MATCH', 'INVITATION'].includes(n.type);
    return true;
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Title level={2} style={{ color: '#1e3a8a', margin: 0, fontWeight: 800 }}>
              Notifications
            </Title>
            {unreadCount > 0 && (
              <Badge 
                count={`${unreadCount} unread`} 
                style={{ backgroundColor: '#1d4ed8', fontWeight: 700, padding: '0 8px' }} 
              />
            )}
          </div>
          <Paragraph style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
            Study group updates, session alerts, partner invitations, and reminders
          </Paragraph>
        </div>

        <Space wrap>
          {unreadCount > 0 && (
            <Button 
              type="primary" 
              icon={<CheckOutlined />}
              onClick={markAllAsRead}
            >
              Mark All as Read
            </Button>
          )}

          {notifications.length > 0 && (
            <Popconfirm
              title="Clear all notifications?"
              description="This will permanently delete all notification alerts from your inbox."
              onConfirm={clearAll}
              okText="Yes, Clear"
              cancelText="Cancel"
            >
              <Button icon={<DeleteOutlined />} danger>
                Clear All
              </Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      {/* Filter Tabs */}
      <Card className="academic-card" style={{ marginBottom: 20, padding: '0 16px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'ALL',
              label: (
                <span>
                  All Notifications <Tag color="blue">{notifications.length}</Tag>
                </span>
              )
            },
            {
              key: 'UNREAD',
              label: (
                <span>
                  Unread {unreadCount > 0 && <Badge count={unreadCount} size="small" style={{ marginLeft: 6 }} />}
                </span>
              )
            },
            {
              key: 'SESSIONS',
              label: (
                <span>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  Sessions & Reminders
                </span>
              )
            },
            {
              key: 'GROUPS',
              label: (
                <span>
                  <UsergroupAddOutlined style={{ marginRight: 4 }} />
                  Groups & Members
                </span>
              )
            },
            {
              key: 'PARTNERS',
              label: (
                <span>
                  <ThunderboltOutlined style={{ marginRight: 4 }} />
                  Study Partners
                </span>
              )
            }
          ]}
        />
      </Card>

      {/* Notification Cards List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="academic-card" style={{ textAlign: 'center', padding: 48 }}>
          <Empty 
            description={
              <div>
                <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: 16, marginBottom: 4 }}>
                  No notifications in this category
                </div>
                <div style={{ color: '#64748b', fontSize: 13 }}>
                  When study groups update, sessions are scheduled, or peers connect, alerts will appear here.
                </div>
              </div>
            }
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredNotifications.map((notif) => {
            const config = getTypeConfig(notif.type);
            const isUnread = !notif.read;

            return (
              <Card
                key={notif._id || notif.id}
                className="academic-card"
                style={{
                  borderLeft: isUnread ? '4px solid #1d4ed8' : '1px solid #e2e8f0',
                  background: isUnread ? '#ffffff' : '#fcfdfd',
                  padding: '12px 18px',
                  boxShadow: isUnread ? '0 2px 8px rgba(29, 78, 216, 0.08)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  {/* Left: Icon & Content */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: config.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2
                      }}
                    >
                      {config.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <Text strong style={{ color: isUnread ? '#0f172a' : '#334155', fontSize: 15 }}>
                          {notif.title || config.tag}
                        </Text>
                        <Tag color={config.color} style={{ margin: 0, fontSize: 11, fontWeight: 600 }}>
                          {config.tag}
                        </Tag>
                        {isUnread && (
                          <Badge status="processing" color="#1d4ed8" text={<span style={{ color: '#1d4ed8', fontWeight: 700, fontSize: 11 }}>NEW</span>} />
                        )}
                      </div>

                      <Paragraph style={{ color: '#475569', fontSize: 13, margin: '2px 0 6px', lineHeight: 1.5 }}>
                        {notif.message}
                      </Paragraph>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#94a3b8' }}>
                        <span>
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    {isUnread ? (
                      <Button
                        size="small"
                        type="default"
                        icon={<CheckOutlined />}
                        onClick={() => markAsRead(notif._id || notif.id)}
                        style={{ fontSize: 12 }}
                      >
                        Mark Read
                      </Button>
                    ) : (
                      <Tag color="default" style={{ margin: 0, fontSize: 11 }}>
                        Read ✓
                      </Tag>
                    )}

                    {/* Quick navigation actions based on type */}
                    {['SESSION', 'SESSION_REMINDER'].includes(notif.type) && (
                      <Button
                        size="small"
                        type="link"
                        onClick={() => navigate('/scheduler')}
                        style={{ padding: 0, fontSize: 12 }}
                      >
                        View Schedule →
                      </Button>
                    )}

                    {['PARTNER_MATCH', 'INVITATION'].includes(notif.type) && (
                      <Button
                        size="small"
                        type="link"
                        onClick={() => navigate('/chats')}
                        style={{ padding: 0, fontSize: 12 }}
                      >
                        Open Chats →
                      </Button>
                    )}

                    {['GROUP_UPDATE', 'MEMBER_JOINED', 'JOIN'].includes(notif.type) && (
                      <Button
                        size="small"
                        type="link"
                        onClick={() => navigate('/groups')}
                        style={{ padding: 0, fontSize: 12 }}
                      >
                        View Groups →
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
