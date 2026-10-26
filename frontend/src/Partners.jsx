import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Input, Select, Button, Tag, Avatar, Modal, message, Empty, Spin, Space, Form } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  UsergroupAddOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  MailOutlined,
  CheckCircleOutlined,
  BookOutlined,
  BankOutlined,
  BulbOutlined,
  SendOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { getRecommendedStudentsApi, sendStudyInvitationApi, getMyGroupsApi } from './api/client';
import { useAuth } from './context/AuthContext';
import { DEPARTMENTS, SEMESTERS } from './constants/academicData';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ============================================================================
// FIND PARTNERS & RECOMMENDATIONS COMPONENT
// ============================================================================
export function FindPartnersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recRes, grpRes] = await Promise.allSettled([
        getRecommendedStudentsApi(),
        getMyGroupsApi()
      ]);

      if (recRes.status === 'fulfilled' && recRes.value?.data) {
        setStudents(recRes.value.data.students || []);
      }
      if (grpRes.status === 'fulfilled' && grpRes.value?.data) {
        setMyGroups(grpRes.value.data.groupsJoined || []);
      }
    } catch (err) {
      console.warn('Failed to load study partners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInvite = (student) => {
    setSelectedStudent(student);
    setInviteModalOpen(true);
    form.resetFields();
  };

  const handleSendInvite = async (values) => {
    if (!selectedStudent) return;
    try {
      setSendingInvite(true);
      await sendStudyInvitationApi({
        recipientId: selectedStudent.id || selectedStudent._id,
        groupId: values.groupId || null,
        customMessage: values.customMessage || ''
      });
      message.success(`Study invitation sent to ${selectedStudent.name}!`);
      setInviteModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send invitation.';
      message.error(msg);
    } finally {
      setSendingInvite(false);
    }
  };

  // Client-side filtering
  const filteredStudents = students.filter(s => {
    const matchesSearch = !search || 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.academicInterests || []).some(sub => sub.toLowerCase().includes(search.toLowerCase()));

    const matchesDept = deptFilter === 'ALL' || s.department === deptFilter;

    return matchesSearch && matchesDept;
  });

  const getMatchColor = (score) => {
    if (score >= 85) return '#16a34a'; // green
    if (score >= 65) return '#2563eb'; // blue
    return '#d97706'; // amber
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Title level={2} style={{ color: '#1e3a8a', margin: 0, fontWeight: 800 }}>
          Find Study Partners
        </Title>
        <Paragraph style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
          Connect with peers matched by Department, Semester, Academic Interests, and Learning Preferences
        </Paragraph>
      </div>

      {/* Filter and Search Bar */}
      <Card className="academic-card" style={{ marginBottom: 24, padding: '4px 8px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={14}>
            <Input 
              placeholder="Search peers by name or subject (e.g. Data Structures, Java)..." 
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
              value={deptFilter} 
              onChange={setDeptFilter}
            >
              <Option value="ALL">All Departments</Option>
              {DEPARTMENTS.map(d => <Option key={d} value={d}>{d}</Option>)}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Grid of Recommended Students */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
      ) : filteredStudents.length === 0 ? (
        <Card className="academic-card" style={{ textAlign: 'center', padding: 40 }}>
          <Empty description="No recommended study partners found matching your search." />
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {filteredStudents.map(peer => {
            const matchScore = peer.matchScore || 50;
            const matchColor = getMatchColor(matchScore);

            return (
              <Col xs={24} sm={12} lg={8} key={peer.id || peer._id}>
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
                    {/* Top Row: Avatar & Match Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar size={48} style={{ backgroundColor: '#1d4ed8', fontSize: 18, fontWeight: 700 }}>
                          {peer.name ? peer.name.charAt(0).toUpperCase() : 'P'}
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: 16 }}>
                            {peer.name}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            {peer.semester || 'S3'} • {peer.year || '2nd Year'}
                          </div>
                        </div>
                      </div>

                      <Tag 
                        style={{
                          color: matchColor,
                          borderColor: matchColor,
                          background: '#f8fafc',
                          fontWeight: 800,
                          fontSize: 13,
                          padding: '2px 8px',
                          borderRadius: 12
                        }}
                      >
                        <ThunderboltOutlined style={{ marginRight: 4 }} />
                        {matchScore}% Match
                      </Tag>
                    </div>

                    {/* Department Tag */}
                    <div style={{ marginBottom: 10 }}>
                      <Tag color="geekblue" style={{ fontSize: 11, fontWeight: 600 }}>
                        <BankOutlined style={{ marginRight: 4 }} />
                        {peer.department}
                      </Tag>
                    </div>

                    {/* Academic Interests Tags */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Academic Interests:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(peer.academicInterests || []).map(subj => {
                          const isShared = (peer.commonInterests || []).includes(subj);
                          return (
                            <Tag 
                              key={subj} 
                              color={isShared ? 'blue' : 'default'} 
                              style={{ 
                                margin: 0, 
                                fontSize: 11,
                                fontWeight: isShared ? 700 : 500
                              }}
                            >
                              {subj} {isShared && '✓'}
                            </Tag>
                          );
                        })}
                      </div>
                    </div>

                    {/* Learning Preferences */}
                    {(peer.learningPreferences || []).length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                          Study Style:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {peer.learningPreferences.map(pref => (
                            <Tag key={pref} color="green" style={{ margin: 0, fontSize: 11 }}>
                              {pref}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 12, display: 'flex', gap: 8 }}>
                    <Button 
                      type="default"
                      icon={<MessageOutlined />}
                      onClick={() => navigate(`/chats?type=PERSONAL&id=${peer.id || peer._id}`)}
                      style={{ flex: 1, fontWeight: 600 }}
                    >
                      Chat
                    </Button>
                    <Button 
                      type="primary" 
                      icon={<UsergroupAddOutlined />}
                      onClick={() => handleOpenInvite(peer)}
                      style={{ flex: 1, fontWeight: 600 }}
                    >
                      Invite
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Send Study Invitation Modal */}
      <Modal
        title={
          <div style={{ color: '#1e3a8a', fontWeight: 700 }}>
            📩 Send Study Group Invitation to {selectedStudent?.name}
          </div>
        }
        open={inviteModalOpen}
        onCancel={() => setInviteModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Paragraph style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
          Invite {selectedStudent?.name} to collaborate with you on your semester subjects.
        </Paragraph>

        <Form form={form} layout="vertical" onFinish={handleSendInvite}>
          <Form.Item 
            label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Select Study Group (Optional)</span>} 
            name="groupId"
          >
            <Select size="large" placeholder="Choose a group or send direct study partner invite" allowClear>
              {myGroups.map(g => (
                <Option key={g._id || g.id} value={g._id || g.id}>
                  {g.groupName} ({g.subject})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Personal Note (Optional)</span>} 
            name="customMessage"
          >
            <TextArea 
              rows={3} 
              placeholder="e.g. Hi! Noticed we both have Data Structures and prefer group discussions. Let's study together!" 
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={sendingInvite}
              icon={<SendOutlined />}
              style={{ fontWeight: 700 }}
            >
              Send Invitation
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default FindPartnersPage;
