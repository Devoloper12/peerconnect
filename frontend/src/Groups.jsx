import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Select,
  Button,
  Tag,
  Modal,
  message as antMessage,
  Empty,
  Spin,
  Space,
  Progress,
  Form,
  Divider,
  DatePicker,
  TimePicker,
  Tabs,
  Badge,
  List,
  Tooltip,
  Image,
  Popconfirm,
  Avatar
} from 'antd';
import {
  SearchOutlined,
  TeamOutlined,
  PlusCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  PlusOutlined,
  CalendarOutlined,
  DeleteOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  SendOutlined,
  UserOutlined,
  PaperClipOutlined,
  DownloadOutlined,
  CloseCircleOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FileZipOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getGroupsApi,
  joinGroupApi,
  createGroupApi,
  getMyGroupsApi,
  leaveGroupApi,
  createSessionApi,
  getSessionsApi,
  getConversationsApi,
  getMessagesApi,
  sendMessageApi
} from './api/client';
import { useAuth } from './context/AuthContext';
import { ACADEMIC_INTERESTS, DEPARTMENTS, SEMESTERS } from './constants/academicData';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ============================================================================
// 1. STUDY GROUP EXPLORER & JOIN COMPONENT
// ============================================================================
export function StudyGroupPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('ALL');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, [search, subject]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (subject !== 'ALL') params.subject = subject;

      const res = await getGroupsApi(params);
      setGroups(res.data?.groups || []);
    } catch (err) {
      console.warn('Failed to fetch groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (groupId) => {
    if (!user) {
      antMessage.warning('Please log in first to join study groups.');
      navigate('/login');
      return;
    }
    try {
      await joinGroupApi(groupId);
      antMessage.success('Joined study group successfully!');
      fetchGroups();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not join group.';
      antMessage.error(msg);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return '#16a34a'; // green
    if (score >= 60) return '#2563eb'; // blue
    return '#d97706'; // amber
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={2} style={{ color: '#1e3a8a', margin: 0, fontWeight: 800 }}>
            Join Study Groups
          </Title>
          <Paragraph style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
            Student matching based on Department, Semester, Academic Interests & Learning Preferences
          </Paragraph>
        </div>

        {user && (
          <Button 
            type="primary" 
            icon={<PlusCircleOutlined />} 
            onClick={() => navigate('/create-group')}
          >
            Create New Group
          </Button>
        )}
      </div>

      {/* Clean Academic Filter Bar */}
      <Card className="academic-card" style={{ marginBottom: 24, padding: '4px 8px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={14}>
            <Input 
              placeholder="Search groups by topic or keywords..." 
              size="large"
              prefix={<SearchOutlined style={{ color: '#94a3b8', marginRight: 6 }} />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={10}>
            <Select 
              size="large" 
              style={{ width: '100%' }} 
              value={subject} 
              onChange={setSubject}
            >
              <Option value="ALL">All Subjects</Option>
              {Array.from(new Set([...ACADEMIC_INTERESTS, ...groups.map(g => g.subject).filter(Boolean)])).map(s => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Groups Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
      ) : groups.length === 0 ? (
        <Card className="academic-card" style={{ textAlign: 'center', padding: 40 }}>
          <Empty description="No study groups found matching your search.">
            {user && (
              <Button type="primary" onClick={() => navigate('/create-group')}>
                Create First Group
              </Button>
            )}
          </Empty>
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {groups.map(grp => {
            const memberCount = (grp.members || []).length;
            const maxCount = grp.maxMembers || 8;
            const isFull = grp.isFull || memberCount >= maxCount;
            const isMember = user && (grp.members || []).some(m => {
              const mId = m._id || m.id || m;
              return mId.toString() === (user.id || user._id || '').toString();
            });
            const matchScore = grp.matchScore || 75;

            return (
              <Col xs={24} sm={12} lg={8} key={grp._id || grp.id}>
                <Card 
                  className="academic-card" 
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '8px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Tag color="blue" style={{ fontWeight: 600 }}>
                        {grp.subject}
                      </Tag>

                      {user && (
                        <Tag 
                          style={{
                            color: getMatchColor(matchScore),
                            borderColor: getMatchColor(matchScore),
                            background: '#f8fafc',
                            fontWeight: 700,
                            borderRadius: 12
                          }}
                        >
                          <ThunderboltOutlined style={{ marginRight: 3 }} />
                          {matchScore}% Match
                        </Tag>
                      )}
                    </div>

                    <Title level={4} style={{ color: '#1e3a8a', margin: '4px 0 8px', fontSize: 16 }}>
                      {grp.groupName}
                    </Title>

                    <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                      <Tag color="cyan" style={{ fontSize: 11 }}>{grp.semester || 'S3'}</Tag>
                      <Tag color="geekblue" style={{ fontSize: 11 }}>{grp.department || 'Computer Science & Engineering'}</Tag>
                    </div>

                    <Paragraph ellipsis={{ rows: 3 }} style={{ color: '#475569', fontSize: 13, minHeight: 56 }}>
                      {grp.description}
                    </Paragraph>
                  </div>

                  <div style={{ marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                      <span>Led by: <strong>{grp.createdBy?.name || 'Student'}</strong></span>
                      <span><strong>{memberCount} / {maxCount}</strong> Enrolled</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button 
                        style={{ flex: 1 }} 
                        size="small"
                        onClick={() => setSelectedGroup(grp)}
                      >
                        Details
                      </Button>

                      <Button 
                        type={isMember ? "default" : "primary"} 
                        size="small" 
                        style={{ 
                          flex: 1,
                          borderColor: isMember ? '#1d4ed8' : undefined,
                          color: isMember ? '#1d4ed8' : undefined,
                          fontWeight: isMember ? 700 : 500
                        }} 
                        disabled={!isMember && isFull}
                        onClick={() => {
                          if (isMember) {
                            navigate(`/chats?type=GROUP&id=${grp._id || grp.id}`);
                          } else {
                            handleJoin(grp._id || grp.id);
                          }
                        }}
                      >
                        {isMember ? '💬 Open Chat' : isFull ? 'Full' : 'Join Group'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Details Modal */}
      {selectedGroup && (
        <Modal
          title={
            <div style={{ color: '#1e3a8a', fontWeight: 700 }}>
              📘 {selectedGroup.groupName}
            </div>
          }
          open={!!selectedGroup}
          onCancel={() => setSelectedGroup(null)}
          footer={[
            user && (selectedGroup.members || []).some(m => ((m._id || m.id || m).toString() === (user.id || user._id || '').toString())) && (
              <Button
                key="chat"
                type="primary"
                icon={<MessageOutlined />}
                onClick={() => {
                  const gId = selectedGroup._id || selectedGroup.id;
                  setSelectedGroup(null);
                  navigate(`/chats?type=GROUP&id=${gId}`);
                }}
              >
                Open Group Chat
              </Button>
            ),
            <Button key="close" type="default" onClick={() => setSelectedGroup(null)}>
              Close
            </Button>
          ]}
        >
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <Tag color="blue">{selectedGroup.subject}</Tag>
            <Tag color="cyan">{selectedGroup.semester || 'S3'}</Tag>
            <Tag color="geekblue">{selectedGroup.department || 'Computer Science & Engineering'}</Tag>
            {user && (
              <Tag color="green" style={{ fontWeight: 700 }}>
                {selectedGroup.matchScore || 75}% Compatibility Match
              </Tag>
            )}
          </div>

          <Paragraph style={{ color: '#334155', fontSize: 14 }}>
            {selectedGroup.description}
          </Paragraph>

          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginTop: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#475569', fontSize: 13, marginBottom: 6 }}>
              <strong>Enrolled Students:</strong> {(selectedGroup.members || []).length} of {selectedGroup.maxMembers || 8}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(selectedGroup.members || []).map((m, idx) => (
                <Tag key={idx} color="default">
                  👤 {m.name || 'Member'}
                </Tag>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================================
// 2. CREATE STUDY GROUP COMPONENT
// ============================================================================
export function CreateGroupPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Subject Options with custom add support
  const [subjectOptions, setSubjectOptions] = useState(
    Array.from(new Set([...ACADEMIC_INTERESTS, ...(user?.academicInterests || []), ...(user?.subjects || [])]))
      .map(s => ({ label: s, value: s }))
  );
  const [customSubjectInput, setCustomSubjectInput] = useState('');

  const handleAddCustomSubject = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = customSubjectInput.trim();
    if (!trimmed) {
      antMessage.warning('Please enter a subject name');
      return;
    }
    if (!subjectOptions.some(opt => opt.value.toLowerCase() === trimmed.toLowerCase())) {
      setSubjectOptions(prev => [...prev, { label: trimmed, value: trimmed }]);
    }
    form.setFieldsValue({ subject: trimmed });
    setCustomSubjectInput('');
    antMessage.success(`Subject "${trimmed}" added and selected!`);
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await createGroupApi({
        groupName: values.groupName,
        subject: values.subject,
        department: values.department,
        semester: values.semester,
        description: values.description,
        maxMembers: values.maxMembers
      });
      antMessage.success(`Study group "${values.groupName}" created successfully!`);
      navigate('/groups');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create group.';
      antMessage.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '20px auto' }}>
      <Card 
        className="academic-card"
        style={{ padding: '16px 20px', borderTop: '4px solid #1d4ed8' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1e3a8a', marginBottom: 6, fontWeight: 800 }}>
            Create Study Group
          </Title>
          <Paragraph style={{ color: '#64748b', fontSize: 14 }}>
            Form a focused study circle for your semester courses with peer matching
          </Paragraph>
        </div>

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish} 
          initialValues={{ 
            department: user?.department || 'Computer Science & Engineering',
            semester: user?.semester || 'S3',
            maxMembers: 8 
          }}
        >
          <Form.Item 
            label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Study Group Title</span>} 
            name="groupName" 
            rules={[{ required: true, min: 3, message: 'Please provide a group title' }]}
          >
            <Input size="large" placeholder="e.g. Data Structures Exam Preparation Circle" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Academic Subject (Select or add custom)</span>} 
                name="subject" 
                rules={[{ required: true, message: 'Please select or add a subject' }]}
              >
                <Select 
                  size="large" 
                  placeholder="Select or add Subject"
                  showSearch
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
                            placeholder="e.g. Cloud Computing"
                            value={customSubjectInput}
                            onChange={(e) => setCustomSubjectInput(e.target.value)}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Enter') handleAddCustomSubject(e);
                            }}
                            size="middle"
                          />
                          <Button type="primary" size="middle" icon={<PlusOutlined />} onClick={handleAddCustomSubject}>
                            Add
                          </Button>
                        </Space.Compact>
                      </div>
                    </div>
                  )}
                />
              </Form.Item>
            </Col>

            <Col xs={12} sm={6}>
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
                label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Semester</span>} 
                name="semester"
              >
                <Select size="large">
                  {SEMESTERS.map(s => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Group Description & Learning Goals</span>} 
            name="description" 
            rules={[{ required: true, min: 10, message: 'Please provide a short description (min 10 characters)' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Outline what syllabus topics you will revise, coding problems to solve, or group discussion plans..." 
            />
          </Form.Item>

          <Form.Item 
            label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Maximum Member Limit</span>} 
            name="maxMembers"
          >
            <Select size="large">
              <Option value={4}>4 Members (Intensive Pod)</Option>
              <Option value={6}>6 Members (Standard Group)</Option>
              <Option value={8}>8 Members (Class Section)</Option>
              <Option value={12}>12 Members (Extended Circle)</Option>
            </Select>
          </Form.Item>

          <Space style={{ marginTop: 12, width: '100%', justifyContent: 'space-between' }}>
            <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => navigate('/groups')}>
              Back to Groups
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              loading={loading} 
              icon={<PlusCircleOutlined />}
              style={{ fontWeight: 700 }}
            >
              Create Study Group
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}

// ============================================================================
// 3. MY GROUPS COMPONENT
// ============================================================================
export function MyGroupsPage() {
  const [createdGroups, setCreatedGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      const res = await getMyGroupsApi();
      setCreatedGroups(res.data?.groupsCreated || []);
      setJoinedGroups(res.data?.groupsJoined || []);
    } catch (err) {
      console.warn('Failed to fetch my groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (groupId) => {
    try {
      await leaveGroupApi(groupId);
      antMessage.success('You have left the study group.');
      fetchMyGroups();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to leave group.';
      antMessage.error(msg);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ color: '#1e3a8a', margin: 0, fontWeight: 800 }}>
            My Study Groups
          </Title>
          <Paragraph style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
            Manage study circles you lead or participate in
          </Paragraph>
        </div>

        <Button 
          type="primary" 
          size="large" 
          icon={<PlusCircleOutlined />} 
          onClick={() => navigate('/create-group')}
        >
          Create New Group
        </Button>
      </div>

      <Tabs
        defaultActiveKey="joined"
        size="large"
        items={[
          {
            key: 'joined',
            label: `Groups Enrolled (${joinedGroups.length})`,
            children: (
              <div style={{ marginTop: 16 }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
                ) : joinedGroups.length === 0 ? (
                  <Card className="academic-card" style={{ textAlign: 'center', padding: 40 }}>
                    <Empty description={<span style={{ color: '#64748b' }}>You have not joined any study groups yet.</span>}>
                      <Button type="primary" onClick={() => navigate('/groups')}>
                        Explore Study Groups
                      </Button>
                    </Empty>
                  </Card>
                ) : (
                  <Row gutter={[20, 20]}>
                    {joinedGroups.map(grp => (
                      <Col xs={24} sm={12} lg={8} key={grp._id || grp.id}>
                        <Card 
                          className="academic-card"
                          style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <Tag color="blue" style={{ marginBottom: 8 }}>{grp.subject}</Tag>
                            <Title level={4} style={{ color: '#1e3a8a', margin: '4px 0 8px' }}>{grp.groupName}</Title>
                            <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#475569', fontSize: 13 }}>
                              {grp.description}
                            </Paragraph>
                          </div>

                          <div style={{ marginTop: 20 }}>
                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                              👥 {(grp.members || []).length} / {grp.maxMembers || 10} members enrolled
                            </div>
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                              <Button 
                                type="primary" 
                                size="small" 
                                icon={<CalendarOutlined />}
                                onClick={() => navigate('/scheduler')}
                              >
                                Schedule
                              </Button>

                              <Popconfirm
                                title="Leave Study Group"
                                description="Are you sure you want to leave this group?"
                                onConfirm={() => handleLeave(grp._id || grp.id)}
                                okText="Yes, Leave"
                                cancelText="Stay"
                              >
                                <Button size="small" danger icon={<LogoutOutlined />}>
                                  Leave
                                </Button>
                              </Popconfirm>
                            </Space>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            )
          },
          {
            key: 'created',
            label: `Groups I Lead (${createdGroups.length})`,
            children: (
              <div style={{ marginTop: 16 }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
                ) : createdGroups.length === 0 ? (
                  <Card className="academic-card" style={{ textAlign: 'center', padding: 40 }}>
                    <Empty description={<span style={{ color: '#64748b' }}>You have not created any study groups yet.</span>}>
                      <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => navigate('/create-group')}>
                        Create Group
                      </Button>
                    </Empty>
                  </Card>
                ) : (
                  <Row gutter={[20, 20]}>
                    {createdGroups.map(grp => (
                      <Col xs={24} sm={12} lg={8} key={grp._id || grp.id}>
                        <Card 
                          className="academic-card"
                          style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <Tag color="gold" style={{ marginBottom: 8 }}>★ Group Leader</Tag>
                            <Tag color="blue" style={{ marginBottom: 8 }}>{grp.subject}</Tag>
                            <Title level={4} style={{ color: '#1e3a8a', margin: '4px 0 8px' }}>{grp.groupName}</Title>
                            <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#475569', fontSize: 13 }}>
                              {grp.description}
                            </Paragraph>
                          </div>

                          <div style={{ marginTop: 20 }}>
                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                              👥 {(grp.members || []).length} / {grp.maxMembers || 10} members enrolled
                            </div>
                            <Button 
                              type="primary" 
                              size="small" 
                              block
                              icon={<CalendarOutlined />}
                              onClick={() => navigate('/scheduler')}
                            >
                              Schedule Group Walkthrough
                            </Button>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            )
          }
        ]}
      />
    </div>
  );
}

// ============================================================================
// 4. SESSION SCHEDULER COMPONENT
// ============================================================================
export function SessionSchedulerPage() {
  const [sessions, setSessions] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form] = Form.useForm();

  // Custom Time Slot Options
  const [timeOptions, setTimeOptions] = useState([
    { label: '10:00 AM', value: '10:00 AM' },
    { label: '11:30 AM', value: '11:30 AM' },
    { label: '02:00 PM', value: '2:00 PM' },
    { label: '04:30 PM', value: '4:30 PM' },
    { label: '06:30 PM', value: '6:30 PM' },
    { label: '08:00 PM', value: '8:00 PM' }
  ]);
  const [customTimeInput, setCustomTimeInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setFetching(true);
      const [sRes, gRes] = await Promise.allSettled([
        getSessionsApi(),
        getMyGroupsApi()
      ]);
      if (sRes.status === 'fulfilled') setSessions(sRes.value.data?.sessions || []);
      if (gRes.status === 'fulfilled') setUserGroups(gRes.value.data?.groupsJoined || []);
    } catch (err) {
      console.warn('Scheduler data notice:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleAddCustomTime = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = customTimeInput.trim();
    if (!trimmed) {
      antMessage.warning('Please enter a time value (e.g. 5:00 PM)');
      return;
    }

    if (!timeOptions.some((opt) => opt.value.toLowerCase() === trimmed.toLowerCase())) {
      const newOpt = { label: trimmed, value: trimmed };
      setTimeOptions((prev) => [...prev, newOpt]);
    }
    form.setFieldsValue({ time: trimmed });
    setCustomTimeInput('');
    antMessage.success(`Time slot "${trimmed}" added and selected!`);
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const dateStr = values.date && typeof values.date.format === 'function'
        ? values.date.format('YYYY-MM-DD')
        : values.date;
      const timeStr = values.time && typeof values.time.format === 'function'
        ? values.time.format('h:mm A')
        : values.time;

      await createSessionApi({
        groupId: values.groupId,
        topic: values.topic,
        date: dateStr,
        time: timeStr
      });
      antMessage.success('Study session scheduled successfully!');
      form.resetFields();
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to schedule session.';
      antMessage.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={2} style={{ color: '#1e3a8a', margin: 0, fontWeight: 800 }}>
          Session Scheduling
        </Title>
        <Paragraph style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
          Organize group revision walkthroughs and topic discussions
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* Schedule Form */}
        <Col xs={24} lg={10}>
          <Card 
            className="academic-card" 
            title={<span style={{ color: '#1e3a8a' }}>🗓️ Create New Session</span>}
          >
            {userGroups.length === 0 && !fetching ? (
              <Empty description="You must join or create a study group first before scheduling a session." />
            ) : (
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item 
                  label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Select Study Group</span>} 
                  name="groupId" 
                  rules={[{ required: true, message: 'Please select a group' }]}
                >
                  <Select size="large" placeholder="Choose your group">
                    {userGroups.map(g => (
                      <Option key={g._id || g.id} value={g._id || g.id}>
                        {g.groupName} ({g.subject})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item 
                  label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Topic to Revise</span>} 
                  name="topic" 
                  rules={[{ required: true, message: 'Please enter topic' }]}
                >
                  <Input size="large" placeholder="e.g. Dijkstra and Graph Algorithms Revision" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item 
                      label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Date (YYYY-MM-DD)</span>} 
                      name="date" 
                      rules={[{ required: true, message: 'Please select session date' }]}
                    >
                      <DatePicker 
                        size="large" 
                        format="YYYY-MM-DD" 
                        style={{ width: '100%' }} 
                        placeholder="Select date" 
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Time Slot</span>} 
                      name="time" 
                      rules={[{ required: true, message: 'Please select or add time' }]}
                    >
                      <Select
                        size="large"
                        placeholder="Select or add time slot"
                        showSearch
                        options={timeOptions}
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        dropdownRender={(menu) => (
                          <div>
                            {menu}
                            <Divider style={{ margin: '8px 0' }} />
                            <div style={{ padding: '4px 8px 6px' }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#1e3a8a', marginBottom: 6, textTransform: 'uppercase' }}>
                                + Add Custom Time
                              </div>
                              <Space.Compact style={{ width: '100%' }}>
                                <Input
                                  placeholder="e.g. 5:15 PM"
                                  value={customTimeInput}
                                  onChange={(e) => setCustomTimeInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    e.stopPropagation();
                                    if (e.key === 'Enter') handleAddCustomTime(e);
                                  }}
                                  size="middle"
                                />
                                <Button type="primary" size="middle" icon={<PlusOutlined />} onClick={handleAddCustomTime}>
                                  Add
                                </Button>
                              </Space.Compact>

                              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>Or clock picker:</Text>
                                <TimePicker
                                  size="small"
                                  use12Hours
                                  format="h:mm A"
                                  minuteStep={5}
                                  placeholder="Pick clock time"
                                  onChange={(time, timeString) => {
                                    if (timeString) {
                                      if (!timeOptions.some(opt => opt.value === timeString)) {
                                        setTimeOptions(prev => [...prev, { label: timeString, value: timeString }]);
                                      }
                                      form.setFieldsValue({ time: timeString });
                                      antMessage.success(`Selected time: ${timeString}`);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  block 
                  loading={loading} 
                  icon={<PlusCircleOutlined />}
                  style={{ marginTop: 8 }}
                >
                  Schedule Session
                </Button>
              </Form>
            )}
          </Card>
        </Col>

        {/* Scheduled Sessions List */}
        <Col xs={24} lg={14}>
          <Card 
            className="academic-card" 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#1e3a8a' }}>📅 Upcoming Scheduled Sessions</span>
                <Tag color="blue">{sessions.length} Sessions</Tag>
              </div>
            }
          >
            {fetching ? (
              <div style={{ textAlign: 'center', padding: 30 }}><Spin /></div>
            ) : sessions.length === 0 ? (
              <Empty description="No upcoming study sessions scheduled yet." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sessions.map(s => (
                  <div 
                    key={s._id || s.id}
                    style={{ 
                      background: '#f8fafc', 
                      padding: '14px 16px', 
                      borderRadius: 8,
                      borderLeft: '4px solid #1d4ed8',
                      borderTop: '1px solid #e2e8f0',
                      borderRight: '1px solid #e2e8f0',
                      borderBottom: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Tag color="blue">{s.groupId?.groupName || 'Study Group'}</Tag>
                      <Tag color="cyan">📅 {s.date ? new Date(s.date).toLocaleDateString() : ''}</Tag>
                    </div>

                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, margin: '8px 0 4px' }}>
                      {s.topic}
                    </div>

                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      ⏰ Scheduled Time: <strong>{s.time}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

// ============================================================================
// 5. CHAT SYSTEM COMPONENT (PEER-TO-PEER & GROUP CHATS WITH ATTACHMENTS)
// ============================================================================

// Helper to format file sizes nicely
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Helper to choose file icon based on file name or mime type
const getFileIcon = (fileName = '', fileType = '') => {
  const lowerName = fileName.toLowerCase();
  if (fileType.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(lowerName)) {
    return <FileImageOutlined />;
  }
  if (lowerName.endsWith('.pdf')) {
    return <FilePdfOutlined />;
  }
  if (/\.(zip|rar|tar|gz|7z)$/i.test(lowerName)) {
    return <FileZipOutlined />;
  }
  if (/\.(txt|md|csv|log|java|py|cpp|c|js|jsx|ts|tsx|html|css|json)$/i.test(lowerName)) {
    return <FileTextOutlined />;
  }
  return <FileOutlined />;
};

export function ChatsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Conversations state
  const [personalChats, setPersonalChats] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [availablePeers, setAvailablePeers] = useState([]);
  const [activeTab, setActiveTab] = useState('PERSONAL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);

  // Active chat state
  const [activeChat, setActiveChat] = useState(null); // { chatType: 'PERSONAL'|'GROUP', targetId, title, subtitle }
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  // Attachment state
  const [selectedAttachment, setSelectedAttachment] = useState(null); // { name, fileType, size, dataUrl }
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const fileInputRef = useRef(null);

  // New Chat Modal state
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);

  // Auto-scroll ref
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Safe helpers for conversation previews and times
  const getConvPreview = (conv, defaultFallback) => {
    if (!conv) return defaultFallback || '';
    if (typeof conv.lastMessage === 'string' && conv.lastMessage.trim()) return conv.lastMessage;
    if (conv.lastMessage && typeof conv.lastMessage === 'object' && conv.lastMessage.text) return conv.lastMessage.text;
    if (typeof conv.lastMessageText === 'string' && conv.lastMessageText.trim()) return conv.lastMessageText;
    return defaultFallback || '';
  };

  const getConvTime = (conv) => {
    if (!conv) return null;
    if (conv.lastMessageTime) return conv.lastMessageTime;
    if (conv.lastMessage && typeof conv.lastMessage === 'object' && conv.lastMessage.createdAt) {
      return conv.lastMessage.createdAt;
    }
    return null;
  };

  // Load conversations list
  const loadConversations = async (autoSelectParams = true) => {
    try {
      setLoadingConv(true);
      const res = await getConversationsApi();
      const pChats = res.data?.personalChats || res.data?.personalConversations || [];
      const gChats = res.data?.groupChats || res.data?.groupConversations || [];
      const peers = res.data?.availablePeers || [];

      setPersonalChats(pChats);
      setGroupChats(gChats);
      setAvailablePeers(peers);

      // Check query params if user clicked "Chat" from another page
      if (autoSelectParams) {
        const queryType = searchParams.get('type');
        const queryId = searchParams.get('id');

        if (queryType === 'GROUP' && queryId) {
          const targetGrp = gChats.find(g => (g.id || g._id) === queryId);
          setActiveTab('GROUP');
          if (targetGrp) {
            selectChat('GROUP', targetGrp.id || targetGrp._id, targetGrp.title || targetGrp.name, targetGrp.subtitle);
          } else {
            selectChat('GROUP', queryId, 'Study Group', 'Academic Group Chat');
          }
        } else if (queryType === 'PERSONAL' && queryId) {
          const targetPeer = pChats.find(p => (p.id || p._id) === queryId) || peers.find(p => (p.id || p._id) === queryId);
          setActiveTab('PERSONAL');
          if (targetPeer) {
            selectChat('PERSONAL', targetPeer.id || targetPeer._id, targetPeer.name || targetPeer.title, `${targetPeer.department || 'Student'} • ${targetPeer.semester || 'S3'}`);
          } else {
            selectChat('PERSONAL', queryId, 'Peer Student', 'Study Partner');
          }
        } else if (!activeChat) {
          // Default: open first conversation if available
          if (pChats.length > 0) {
            setActiveTab('PERSONAL');
            const first = pChats[0];
            selectChat('PERSONAL', first.id || first._id, first.name || first.title, `${first.department || 'Student'} • ${first.semester || 'S3'}`);
          } else if (gChats.length > 0) {
            setActiveTab('GROUP');
            const first = gChats[0];
            selectChat('GROUP', first.id || first._id, first.title || first.name, first.subtitle);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    loadConversations(true);
  }, [searchParams]);

  // Select a chat and fetch its messages
  const selectChat = async (chatType, targetId, title, subtitle) => {
    if (!targetId || targetId === 'undefined' || targetId === 'null') return;
    const cleanId = String(targetId);
    const cleanTitle = title || (chatType === 'GROUP' ? 'Study Group' : 'Peer Student');
    const newChat = { chatType, targetId: cleanId, title: cleanTitle, subtitle: subtitle || '' };
    setActiveChat(newChat);
    try {
      setLoadingMessages(true);
      const res = await getMessagesApi({ chatType, targetId: cleanId });
      setMessages(res.data?.messages || []);
    } catch (err) {
      console.warn('Failed to fetch messages:', err);
      if (err.response && err.response.status !== 404) {
        antMessage.error(err.response?.data?.message || 'Could not load messages.');
      } else {
        setMessages([]);
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  // Poll for latest messages every 4 seconds when in active chat
  useEffect(() => {
    if (!activeChat || !activeChat.targetId) return;
    const interval = setInterval(async () => {
      try {
        const res = await getMessagesApi({ chatType: activeChat.chatType, targetId: activeChat.targetId });
        if (res.data?.messages) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        // silent background refresh
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeChat?.chatType, activeChat?.targetId]);

  // Handle file attachment selection via input element
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 10MB
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      antMessage.error('File size exceeds 10MB limit. Please attach a smaller file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setAttachmentLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedAttachment({
        name: file.name,
        fileType: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl: reader.result
      });
      setAttachmentLoading(false);
      antMessage.success(`Attached "${file.name}" (${formatFileSize(file.size)})`);
    };
    reader.onerror = () => {
      antMessage.error('Failed to read the file.');
      setAttachmentLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Remove the currently attached file before sending
  const handleRemoveAttachment = () => {
    setSelectedAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Download attachment helper
  const handleDownloadAttachment = (att) => {
    if (!att || !att.dataUrl) return;
    const link = document.createElement('a');
    link.href = att.dataUrl;
    link.download = att.name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Send message with optional attachment
  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed && !selectedAttachment) return;
    if (!activeChat || !activeChat.targetId) {
      antMessage.warning('Please select a conversation to send a message.');
      return;
    }

    try {
      setSending(true);
      const payload = {
        chatType: activeChat.chatType,
        targetId: activeChat.targetId,
        recipientId: activeChat.targetId,
        groupId: activeChat.targetId,
        message: trimmed,
        text: trimmed
      };

      // Attach file if selected
      if (selectedAttachment) {
        payload.attachment = {
          name: selectedAttachment.name,
          fileType: selectedAttachment.fileType,
          size: selectedAttachment.size,
          dataUrl: selectedAttachment.dataUrl
        };
      }

      const res = await sendMessageApi(payload);
      if (res.data && (res.data.message || res.data.success)) {
        const newMsg = res.data.message;
        if (newMsg) {
          setMessages((prev) => [...prev, newMsg]);
        }
        setInputText('');
        handleRemoveAttachment();
        loadConversations(false);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      const msg = err.response?.data?.message || 'Failed to send message. Please try again.';
      antMessage.error(msg);
    } finally {
      setSending(false);
    }
  };

  // Helper relative time
  const formatMsgTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filter conversations safely
  const filteredPersonal = personalChats.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const name = (c.name || c.title || '').toLowerCase();
    const dept = (c.department || '').toLowerCase();
    return name.includes(term) || dept.includes(term);
  });

  const filteredGroup = groupChats.filter((g) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const title = (g.title || g.name || '').toLowerCase();
    const sub = (g.subtitle || '').toLowerCase();
    return title.includes(term) || sub.includes(term);
  });

  return (
    <div style={{ height: 'calc(100vh - 150px)', minHeight: 600 }}>
      {/* Hidden File Input for Attachments */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <Card
        className="academic-card"
        bodyStyle={{ padding: 0, height: '100%', display: 'flex' }}
        style={{ height: '100%', overflow: 'hidden' }}
      >
        {/* LEFT COLUMN: CONVERSATION LIST */}
        <div
          style={{
            width: 340,
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: '#ffffff'
          }}
        >
          {/* Header & New Chat button */}
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageOutlined style={{ fontSize: 20, color: '#1d4ed8' }} />
                <Title level={4} style={{ margin: 0, color: '#1e3a8a', fontWeight: 800 }}>
                  Messages
                </Title>
              </div>

              <Tooltip title="Start conversation with a classmate">
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setNewChatModalOpen(true)}
                  style={{ fontWeight: 600 }}
                >
                  New Chat
                </Button>
              </Tooltip>
            </div>

            {/* Search Input */}
            <Input
              placeholder="Search conversations..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="middle"
              allowClear
            />
          </div>

          {/* Conversation Tabs: Personal vs Groups */}
          <div style={{ padding: '0 16px', borderBottom: '1px solid #f1f5f9' }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'PERSONAL',
                  label: (
                    <span>
                      <UserOutlined /> Direct Peers ({personalChats.length})
                    </span>
                  )
                },
                {
                  key: 'GROUP',
                  label: (
                    <span>
                      <TeamOutlined /> Study Groups ({groupChats.length})
                    </span>
                  )
                }
              ]}
            />
          </div>

          {/* Conversations Scrollable List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingConv ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin />
              </div>
            ) : activeTab === 'PERSONAL' ? (
              filteredPersonal.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No direct conversations yet"
                  >
                    <Button
                      size="small"
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setNewChatModalOpen(true)}
                    >
                      Find Classmates
                    </Button>
                  </Empty>
                </div>
              ) : (
                filteredPersonal.map((chat) => {
                  const chatId = chat.id || chat._id;
                  const chatName = chat.name || chat.title || 'Classmate';
                  const isSelected =
                    activeChat?.chatType === 'PERSONAL' && (activeChat?.targetId === chatId || activeChat?.targetId === chat._id || activeChat?.targetId === chat.id);
                  const msgTime = getConvTime(chat);

                  return (
                    <div
                      key={chatId}
                      onClick={() =>
                        selectChat(
                          'PERSONAL',
                          chatId,
                          chatName,
                          `${chat.department || 'Student'} • ${chat.semester || 'S3'}`
                        )
                      }
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        cursor: 'pointer',
                        borderBottom: '1px solid #f8fafc',
                        background: isSelected ? '#eff6ff' : '#ffffff',
                        borderLeft: isSelected ? '4px solid #1d4ed8' : '4px solid transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <Avatar
                        style={{
                          backgroundColor: isSelected ? '#1d4ed8' : '#3b82f6',
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        {chatName.charAt(0).toUpperCase()}
                      </Avatar>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 2
                          }}
                        >
                          <span
                            style={{
                              fontWeight: isSelected ? 800 : 700,
                              color: '#0f172a',
                              fontSize: 14,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {chatName}
                          </span>
                          {msgTime && (
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>
                              {formatMsgTime(msgTime)}
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            color: '#64748b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {getConvPreview(chat, `${chat.department || 'Student'} • ${chat.semester || 'S3'}`)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : filteredGroup.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No study group chats yet"
                >
                  <Button size="small" type="primary" onClick={() => navigate('/groups')}>
                    Browse Groups
                  </Button>
                </Empty>
              </div>
            ) : (
              filteredGroup.map((grp) => {
                const groupId = grp.id || grp._id;
                const grpTitle = grp.title || grp.name || 'Study Group';
                const isSelected =
                  activeChat?.chatType === 'GROUP' && (activeChat?.targetId === groupId || activeChat?.targetId === grp._id || activeChat?.targetId === grp.id);
                const msgTime = getConvTime(grp);

                return (
                  <div
                    key={groupId}
                    onClick={() => selectChat('GROUP', groupId, grpTitle, grp.subtitle)}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      borderBottom: '1px solid #f8fafc',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      borderLeft: isSelected ? '4px solid #1d4ed8' : '4px solid transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <Avatar
                      style={{
                        backgroundColor: '#1e3a8a',
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                      icon={<TeamOutlined />}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 2
                        }}
                      >
                        <span
                          style={{
                            fontWeight: isSelected ? 800 : 700,
                            color: '#0f172a',
                            fontSize: 14,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {grpTitle}
                        </span>
                        {msgTime && (
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>
                            {formatMsgTime(msgTime)}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: '#64748b',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {getConvPreview(grp, `${grp.subtitle || 'Study Group'} • ${grp.membersCount || 1} members`)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT WINDOW */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: '#f8fafc'
          }}
        >
          {activeChat ? (
            <>
              {/* Chat Top Header */}
              <div
                style={{
                  padding: '14px 20px',
                  background: '#ffffff',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar
                    style={{
                      backgroundColor: activeChat.chatType === 'GROUP' ? '#1e3a8a' : '#1d4ed8',
                      fontWeight: 700
                    }}
                    icon={activeChat.chatType === 'GROUP' ? <TeamOutlined /> : null}
                  >
                    {activeChat.chatType === 'PERSONAL' &&
                      (activeChat.title ? activeChat.title.charAt(0).toUpperCase() : 'U')}
                  </Avatar>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                        {activeChat.title}
                      </span>
                      <Tag
                        color={activeChat.chatType === 'GROUP' ? 'blue' : 'cyan'}
                        style={{ fontSize: 11, margin: 0, fontWeight: 600 }}
                      >
                        {activeChat.chatType === 'GROUP' ? 'Study Group' : 'Peer Student'}
                      </Tag>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{activeChat.subtitle}</div>
                  </div>
                </div>

                {activeChat.chatType === 'GROUP' && (
                  <Button size="small" type="default" onClick={() => navigate('/scheduler')}>
                    🗓️ Schedule Session
                  </Button>
                )}
              </div>

              {/* Message History Feed */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                {loadingMessages ? (
                  <div style={{ textAlign: 'center', padding: 60 }}>
                    <Spin />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 360 }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        fontSize: 24
                      }}
                    >
                      <MessageOutlined />
                    </div>
                    <Title level={5} style={{ color: '#1e3a8a', margin: '0 0 6px' }}>
                      Start the Academic Discussion!
                    </Title>
                    <Paragraph style={{ color: '#64748b', fontSize: 13 }}>
                      Share study notes, clarify concepts, discuss upcoming assignments, or attach reference files.
                    </Paragraph>
                  </div>
                ) : (
                  messages.map((m) => {
                    const senderId = m.sender?._id || m.sender?.id || m.sender;
                    const currentUserId = user?._id || user?.id;
                    const isMe = Boolean(m.isMine || (senderId && currentUserId && String(senderId) === String(currentUserId)));
                    const senderName = m.sender?.name || 'Classmate';
                    const hasAttachment = Boolean(m.attachment && m.attachment.dataUrl);

                    return (
                      <div
                        key={String(m._id || m.id || Math.random())}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start'
                        }}
                      >
                        {/* Group Sender Label */}
                        {!isMe && activeChat.chatType === 'GROUP' && (
                          <span
                            style={{
                              fontSize: 11,
                              color: '#64748b',
                              fontWeight: 700,
                              marginBottom: 2,
                              marginLeft: 4
                            }}
                          >
                            {senderName}
                          </span>
                        )}

                        {/* Message Bubble */}
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '10px 14px',
                            borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                            background: isMe ? '#1d4ed8' : '#ffffff',
                            color: isMe ? '#ffffff' : '#0f172a',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                            border: isMe ? 'none' : '1px solid #e2e8f0',
                            fontSize: 14,
                            lineHeight: 1.5,
                            wordBreak: 'break-word'
                          }}
                        >
                          {/* Attachment Display */}
                          {hasAttachment && (
                            <div
                              style={{
                                marginBottom: (m.message || m.text) ? 8 : 0,
                                padding: 8,
                                background: isMe ? 'rgba(255, 255, 255, 0.15)' : '#f1f5f9',
                                borderRadius: 8,
                                border: isMe ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #cbd5e1'
                              }}
                            >
                              {/* If image, display inline thumbnail with lightbox preview */}
                              {m.attachment.fileType?.startsWith('image/') ||
                              /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(m.attachment.name || '') ? (
                                <div>
                                  <Image
                                    src={m.attachment.dataUrl}
                                    alt={m.attachment.name}
                                    style={{
                                      maxHeight: 180,
                                      maxWidth: '100%',
                                      borderRadius: 6,
                                      objectFit: 'cover'
                                    }}
                                  />
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      marginTop: 6,
                                      fontSize: 11,
                                      color: isMe ? '#e0e7ff' : '#64748b'
                                    }}
                                  >
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                                      {m.attachment.name}
                                    </span>
                                    <Button
                                      size="small"
                                      type="link"
                                      icon={<DownloadOutlined />}
                                      onClick={() => handleDownloadAttachment(m.attachment)}
                                      style={{ color: isMe ? '#ffffff' : '#1d4ed8', padding: 0, height: 'auto', fontSize: 11 }}
                                    >
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                /* Non-image document card with download button */
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 12
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                    <span style={{ fontSize: 22, color: isMe ? '#ffffff' : '#1d4ed8' }}>
                                      {getFileIcon(m.attachment.name, m.attachment.fileType)}
                                    </span>
                                    <div style={{ minWidth: 0 }}>
                                      <div
                                        style={{
                                          fontWeight: 700,
                                          fontSize: 12,
                                          color: isMe ? '#ffffff' : '#0f172a',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          maxWidth: 180
                                        }}
                                        title={m.attachment.name}
                                      >
                                        {m.attachment.name}
                                      </div>
                                      <div style={{ fontSize: 10, color: isMe ? '#cbd5e1' : '#64748b' }}>
                                        {formatFileSize(m.attachment.size)}
                                      </div>
                                    </div>
                                  </div>

                                  <Button
                                    size="small"
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={() => handleDownloadAttachment(m.attachment)}
                                    style={{
                                      fontSize: 11,
                                      background: isMe ? '#ffffff' : '#1d4ed8',
                                      color: isMe ? '#1d4ed8' : '#ffffff',
                                      borderColor: 'transparent',
                                      fontWeight: 600
                                    }}
                                  >
                                    Save
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Message Text */}
                          {(m.message || m.text) && <div>{m.message || m.text}</div>}

                          {/* Timestamp */}
                          <div
                            style={{
                              fontSize: 10,
                              textAlign: 'right',
                              marginTop: 4,
                              color: isMe ? 'rgba(255, 255, 255, 0.75)' : '#94a3b8'
                            }}
                          >
                            {formatMsgTime(m.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Pending Attachment Preview Banner */}
              {selectedAttachment && (
                <div
                  style={{
                    padding: '8px 20px',
                    background: '#eff6ff',
                    borderTop: '1px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <span style={{ fontSize: 20, color: '#1d4ed8' }}>
                      {getFileIcon(selectedAttachment.name, selectedAttachment.fileType)}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: '#1e3a8a',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'inline-block',
                          maxWidth: 240
                        }}
                      >
                        {selectedAttachment.name}
                      </span>
                      <span style={{ fontSize: 11, color: '#64748b', marginLeft: 8 }}>
                        ({formatFileSize(selectedAttachment.size)})
                      </span>
                    </div>
                  </div>

                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<CloseCircleOutlined />}
                    onClick={handleRemoveAttachment}
                    title="Remove attachment"
                  >
                    Remove
                  </Button>
                </div>
              )}

              {/* Chat Input Bar */}
              <div
                style={{
                  padding: '14px 20px',
                  background: '#ffffff',
                  borderTop: selectedAttachment ? 'none' : '1px solid #e2e8f0',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-end'
                }}
              >
                {/* Paperclip Button for file upload */}
                <Tooltip title="Attach notes, PDF, or screenshot (max 10MB)">
                  <Button
                    icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
                    size="large"
                    loading={attachmentLoading}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      borderColor: selectedAttachment ? '#1d4ed8' : '#cbd5e1',
                      color: selectedAttachment ? '#1d4ed8' : '#64748b'
                    }}
                  />
                </Tooltip>

                <TextArea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    selectedAttachment
                      ? 'Add a caption for your attachment... (press Enter to send)'
                      : 'Type a message... (press Enter to send)'
                  }
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  style={{ borderRadius: 8, fontSize: 14 }}
                />

                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="large"
                  loading={sending}
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() && !selectedAttachment}
                  style={{ fontWeight: 700 }}
                >
                  Send
                </Button>
              </div>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', padding: 40 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 32
                }}
              >
                <MessageOutlined />
              </div>
              <Title level={3} style={{ color: '#1e3a8a', marginBottom: 8, fontWeight: 800 }}>
                PeerConnect Academic Chat
              </Title>
              <Paragraph style={{ color: '#64748b', maxWidth: 440, fontSize: 14 }}>
                Select an existing conversation on the left or click <strong>New Chat</strong> to connect with study partners and course circles.
              </Paragraph>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setNewChatModalOpen(true)}
                style={{ marginTop: 8 }}
              >
                Start New Chat
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* NEW CHAT / PEER SELECTOR MODAL */}
      <Modal
        title={
          <div style={{ color: '#1e3a8a', fontWeight: 800 }}>
            💬 Start Academic Conversation
          </div>
        }
        open={newChatModalOpen}
        onCancel={() => setNewChatModalOpen(false)}
        footer={null}
        width={560}
      >
        <Paragraph style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
          Choose a recommended peer or study group to initiate collaboration.
        </Paragraph>

        <Tabs
          defaultActiveKey="PEERS"
          items={[
            {
              key: 'PEERS',
              label: (
                <span>
                  <UserOutlined /> Recommended Peers ({availablePeers.length})
                </span>
              ),
              children: (
                <div style={{ maxHeight: 380, overflowY: 'auto', paddingTop: 8 }}>
                  {availablePeers.length === 0 ? (
                    <Empty description="No classmates found. Ensure your department & subjects are set in your profile." />
                  ) : (
                    <List
                      dataSource={availablePeers}
                      renderItem={(peer) => (
                        <List.Item
                          actions={[
                            <Button
                              type="primary"
                              size="small"
                              icon={<MessageOutlined />}
                              onClick={() => {
                                setNewChatModalOpen(false);
                                setActiveTab('PERSONAL');
                                selectChat(
                                  'PERSONAL',
                                  peer.id || peer._id,
                                  peer.name,
                                  `${peer.department} • ${peer.semester}`
                                );
                              }}
                            >
                              Chat
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar style={{ backgroundColor: '#1d4ed8', fontWeight: 700 }}>
                                {peer.name ? peer.name.charAt(0).toUpperCase() : 'S'}
                              </Avatar>
                            }
                            title={<span style={{ fontWeight: 700, color: '#0f172a' }}>{peer.name}</span>}
                            description={
                              <div>
                                <span style={{ fontSize: 12, color: '#64748b' }}>
                                  {peer.department} • {peer.semester}
                                </span>
                                {peer.academicInterests && peer.academicInterests.length > 0 && (
                                  <div style={{ marginTop: 4 }}>
                                    {peer.academicInterests.slice(0, 3).map((subj) => (
                                      <Tag key={subj} color="blue" style={{ fontSize: 10, margin: '2px 3px' }}>
                                        {subj}
                                      </Tag>
                                    ))}
                                  </div>
                                )}
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </div>
              )
            },
            {
              key: 'GROUPS',
              label: (
                <span>
                  <TeamOutlined /> My Study Groups ({groupChats.length})
                </span>
              ),
              children: (
                <div style={{ maxHeight: 380, overflowY: 'auto', paddingTop: 8 }}>
                  {groupChats.length === 0 ? (
                    <Empty description="You haven't joined any study groups yet.">
                      <Button size="small" type="primary" onClick={() => { setNewChatModalOpen(false); navigate('/groups'); }}>
                        Explore Groups
                      </Button>
                    </Empty>
                  ) : (
                    <List
                      dataSource={groupChats}
                      renderItem={(grp) => (
                        <List.Item
                          actions={[
                            <Button
                              type="primary"
                              size="small"
                              icon={<TeamOutlined />}
                              onClick={() => {
                                setNewChatModalOpen(false);
                                setActiveTab('GROUP');
                                selectChat('GROUP', grp.id || grp._id, grp.title, grp.subtitle);
                              }}
                            >
                              Open Room
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar style={{ backgroundColor: '#1e3a8a' }} icon={<TeamOutlined />} />}
                            title={<span style={{ fontWeight: 700, color: '#0f172a' }}>{grp.title}</span>}
                            description={
                              <span style={{ fontSize: 12, color: '#64748b' }}>
                                {grp.subtitle} • {grp.membersCount} enrolled members
                              </span>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </div>
              )
            }
          ]}
        />
      </Modal>
    </div>
  );
}

export default StudyGroupPage;
