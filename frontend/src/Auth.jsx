import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Typography,
  message,
  Divider,
  Space,
  Tag
} from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  LoginOutlined,
  TeamOutlined,
  RocketOutlined,
  SearchOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  BookOutlined,
  BulbOutlined,
  BankOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { loginApi, registerApi } from './api/client';
import { useAuth } from './context/AuthContext';
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
// 1. LANDING PAGE COMPONENT
// ============================================================================
export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div>
      {/* Clean Academic Hero Section with Updated Branding */}
      <Card 
        className="academic-card" 
        style={{ 
          textAlign: 'center', 
          padding: '48px 24px',
          background: 'linear-gradient(180deg, #ffffff 0%, #f0f7ff 100%)',
          borderColor: '#bfdbfe',
          marginBottom: 32
        }}
      >
        <div 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 72, 
            height: 72, 
            borderRadius: 20, 
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', 
            color: '#ffffff', 
            fontSize: 34, 
            marginBottom: 16, 
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.22)' 
          }}
        >
          <TeamOutlined />
        </div>

        <Title style={{ color: '#1e3a8a', fontSize: '2.8rem', fontWeight: 800, margin: '4px 0 6px', letterSpacing: -0.5 }}>
          PeerConnect
        </Title>

        <Title level={3} style={{ color: '#1d4ed8', fontWeight: 700, margin: '0 0 16px', fontSize: '1.4rem' }}>
          Student Study Group Management System
        </Title>

        <div style={{ marginBottom: 24 }}>
          <Tag 
            color="blue" 
            style={{ 
              fontSize: 13, 
              padding: '5px 20px', 
              fontWeight: 700, 
              borderRadius: 20, 
              borderColor: '#93c5fd', 
              background: '#eff6ff', 
              color: '#1e40af' 
            }}
          >
            B.Tech S3 OOP Project • Group 1
          </Tag>
        </div>

        <Paragraph style={{ color: '#475569', fontSize: 16, maxWidth: 720, margin: '0 auto 28px', lineHeight: 1.6 }}>
          An academic study group management system for engineering students to organize syllabus-aligned peer study circles and schedule revision sessions.
        </Paragraph>

        <Space size="middle" wrap style={{ justifyContent: 'center' }}>
          <Button 
            type="primary" 
            size="large" 
            icon={<RocketOutlined />}
            style={{ height: 46, padding: '0 28px' }}
            onClick={() => navigate(user ? '/dashboard' : '/register')}
          >
            {user ? 'Go to Dashboard' : 'Student Registration'}
          </Button>

          <Button 
            size="large" 
            icon={<SearchOutlined />}
            style={{ height: 46, padding: '0 24px' }}
            onClick={() => navigate('/groups')}
          >
            Explore Study Groups
          </Button>
        </Space>
      </Card>

      {/* 3 Core Academic Modules */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} md={8}>
          <Card className="academic-card" style={{ height: '100%' }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>
              <TeamOutlined />
            </div>
            <Title level={4} style={{ color: '#1e3a8a', marginBottom: 8 }}>
              Study Group Formation
            </Title>
            <Paragraph style={{ color: '#64748b', fontSize: 14 }}>
              Students can create or join study groups based on semester subjects (DSA, OS, DBMS) with capacity limits.
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="academic-card" style={{ height: '100%' }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>
              <CalendarOutlined />
            </div>
            <Title level={4} style={{ color: '#1e3a8a', marginBottom: 8 }}>
              Session Scheduling
            </Title>
            <Paragraph style={{ color: '#64748b', fontSize: 14 }}>
              Coordinate revision sessions with specific dates, time slots, and topics to avoid timetable conflicts.
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="academic-card" style={{ height: '100%' }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: '#faf5ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>
              <UsergroupAddOutlined />
            </div>
            <Title level={4} style={{ color: '#1e3a8a', marginBottom: 8 }}>
              Peer Study Partners
            </Title>
            <Paragraph style={{ color: '#64748b', fontSize: 14 }}>
              Discover matching classmates by department, semester, and academic interests for collaborative study.
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

// ============================================================================
// 2. LOGIN PAGE COMPONENT
// ============================================================================
export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await loginApi(values);
      if (res.data && res.data.token) {
        saveAuth(res.data.user, res.data.token);
        message.success(`Welcome back, ${res.data.user.name}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 440, margin: '40px auto' }}>
      <Card 
        className="academic-card"
        style={{ padding: '16px 20px', borderTop: '4px solid #1d4ed8' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div 
            className="academic-logo-badge" 
            style={{ 
              margin: '0 auto 12px', 
              width: 54, 
              height: 54, 
              borderRadius: 14, 
              fontSize: 26,
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)'
            }}
          >
            <TeamOutlined />
          </div>
          <Title level={3} style={{ color: '#1e3a8a', marginBottom: 2, fontWeight: 800 }}>
            PeerConnect
          </Title>
          <div style={{ color: '#1d4ed8', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
            Student Study Group Management System
          </div>
          <div style={{ marginBottom: 12 }}>
            <Tag color="blue" style={{ fontSize: 11, fontWeight: 700, borderRadius: 12, padding: '1px 10px', borderColor: '#93c5fd', background: '#eff6ff', color: '#1e40af' }}>
              B.Tech S3 OOP Project • Group 1
            </Tag>
          </div>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item 
            label={<span style={{ fontWeight: 600, color: '#1e293b' }}>College Email</span>} 
            name="email" 
            rules={[{ required: true, type: 'email', message: 'Please enter your email' }]}
          >
            <Input 
              size="large" 
              placeholder="student@college.edu" 
              prefix={<MailOutlined style={{ color: '#94a3b8', marginRight: 6 }} />} 
            />
          </Form.Item>

          <Form.Item 
            label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Password</span>} 
            name="password" 
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password 
              size="large" 
              placeholder="••••••••" 
              prefix={<LockOutlined style={{ color: '#94a3b8', marginRight: 6 }} />} 
            />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            size="large" 
            block 
            loading={loading} 
            icon={<LoginOutlined />}
            style={{ marginTop: 8 }}
          >
            Sign In
          </Button>
        </Form>

        <Divider style={{ margin: '20px 0', borderColor: '#e2e8f0' }} />

        <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13 }}>
          New student?{' '}
          <Link to="/register" style={{ color: '#1d4ed8', fontWeight: 700 }}>
            Register Account →
          </Link>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// 3. REGISTER PAGE COMPONENT
// ============================================================================
export function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Dynamic Subject Options (Users can pick or add new subjects)
  const [subjectOptions, setSubjectOptions] = useState(
    ACADEMIC_INTERESTS.map((s) => ({ label: s, value: s }))
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

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        department: values.department,
        year: values.year,
        semester: values.semester,
        academicInterests: values.academicInterests || [],
        personalInterests: [],
        learningPreferences: values.learningPreferences || [],
        subjects: values.academicInterests || [],
        interests: [],
        learningPreference: (values.learningPreferences || []).join(', ') || 'Group Discussion',
        availability: values.availability || 'Evenings 6 PM - 9 PM'
      };

      const res = await registerApi(payload);
      if (res.data && res.data.token) {
        saveAuth(res.data.user, res.data.token);
        message.success('Student account registered successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check inputs.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '24px auto' }}>
      <Card 
        className="academic-card"
        style={{ padding: '20px 24px', borderTop: '4px solid #1d4ed8' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div 
            className="academic-logo-badge" 
            style={{ 
              margin: '0 auto 12px', 
              width: 54, 
              height: 54, 
              borderRadius: 14, 
              fontSize: 26,
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)'
            }}
          >
            <TeamOutlined />
          </div>
          <Title level={2} style={{ color: '#1e3a8a', marginBottom: 2, fontWeight: 800 }}>
            PeerConnect
          </Title>
          <div style={{ color: '#1d4ed8', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
            Student Study Group Management System
          </div>
          <div style={{ marginBottom: 12 }}>
            <Tag color="blue" style={{ fontSize: 11, fontWeight: 700, borderRadius: 12, padding: '1px 12px', borderColor: '#93c5fd', background: '#eff6ff', color: '#1e40af' }}>
              B.Tech S3 OOP Project • Group 1
            </Tag>
          </div>
          <Paragraph style={{ color: '#64748b', fontSize: 13, margin: '6px 0 0' }}>
            Register your academic profile to participate in course study groups
          </Paragraph>
        </div>

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish}
          initialValues={{
            department: 'Computer Science & Engineering',
            year: '2nd Year',
            semester: 'S3',
            academicInterests: [],
            learningPreferences: [],
            availability: 'Evenings 6 PM - 9 PM'
          }}
        >
          {/* SECTION 1: Personal Details */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <UserOutlined style={{ color: '#1d4ed8', fontSize: 16 }} />
              <Text strong style={{ color: '#1e3a8a', fontSize: 15, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                1. Personal Details
              </Text>
            </div>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item 
                  label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Full Name</span>} 
                  name="name" 
                  rules={[{ required: true, message: 'Please enter your full name' }]}
                >
                  <Input 
                    size="large" 
                    placeholder="e.g. Rahul Sharma" 
                    prefix={<UserOutlined style={{ color: '#94a3b8', marginRight: 6 }} />} 
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item 
                  label={<span style={{ fontWeight: 600, color: '#1e293b' }}>College Email</span>} 
                  name="email" 
                  rules={[{ required: true, type: 'email', message: 'Enter a valid college email' }]}
                >
                  <Input 
                    size="large" 
                    placeholder="student@college.edu" 
                    prefix={<MailOutlined style={{ color: '#94a3b8', marginRight: 6 }} />} 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item 
              label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Password</span>} 
              name="password" 
              rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}
            >
              <Input.Password 
                size="large" 
                placeholder="••••••••" 
                prefix={<LockOutlined style={{ color: '#94a3b8', marginRight: 6 }} />} 
              />
            </Form.Item>
          </div>

          <Divider style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />

          {/* SECTION 2: Academic Details */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <BankOutlined style={{ color: '#1d4ed8', fontSize: 16 }} />
              <Text strong style={{ color: '#1e3a8a', fontSize: 15, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                2. Academic Details
              </Text>
            </div>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item 
                  label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Department</span>} 
                  name="department" 
                  rules={[{ required: true, message: 'Please select department' }]}
                >
                  <Select size="large" placeholder="Select Department">
                    {DEPARTMENTS.map(dept => (
                      <Option key={dept} value={dept}>{dept}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={12} sm={6}>
                <Form.Item 
                  label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Year</span>} 
                  name="year" 
                  rules={[{ required: true, message: 'Select year' }]}
                >
                  <Select size="large">
                    {YEARS.map(yr => (
                      <Option key={yr} value={yr}>{yr}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={12} sm={6}>
                <Form.Item 
                  label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Semester</span>} 
                  name="semester" 
                  rules={[{ required: true, message: 'Select semester' }]}
                >
                  <Select size="large">
                    {SEMESTERS.map(sem => (
                      <Option key={sem} value={sem}>{sem}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />

          {/* SECTION 3: Academic Interests */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <BookOutlined style={{ color: '#1d4ed8', fontSize: 16 }} />
              <Text strong style={{ color: '#1e3a8a', fontSize: 15, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                3. Academic Interests
              </Text>
            </div>

            <Form.Item 
              name="academicInterests" 
              label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Subjects & Courses of Interest (Choose from syllabus or add your own)</span>}
              rules={[{ required: true, message: 'Please select or add at least one subject' }]}
            >
              <Select 
                mode="tags" 
                size="large" 
                placeholder="Select or type to add subjects (e.g. Cloud Computing)..."
                style={{ width: '100%' }}
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
          </div>

          <Divider style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />

          {/* SECTION 4: Learning Preferences */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <BulbOutlined style={{ color: '#d97706', fontSize: 16 }} />
              <Text strong style={{ color: '#1e3a8a', fontSize: 15, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                4. Learning Preferences
              </Text>
            </div>

            <Form.Item 
              name="learningPreferences" 
              label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Preferred Study Method (Used for Student Matching)</span>}
              rules={[{ required: true, message: 'Please select at least one learning preference' }]}
            >
              <Select 
                mode="multiple" 
                size="large" 
                placeholder="Select learning style"
                style={{ width: '100%' }}
              >
                {LEARNING_PREFERENCES.map(pref => (
                  <Option key={pref} value={pref}>{pref}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item 
              label={<span style={{ fontWeight: 600, color: '#1e293b' }}>Weekly Study Availability Window</span>} 
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
          </div>

          <Button 
            type="primary" 
            htmlType="submit" 
            size="large" 
            block 
            loading={loading} 
            icon={<RocketOutlined />}
            style={{ height: 48, fontSize: 16, fontWeight: 700, marginTop: 8 }}
          >
            Complete Registration & Join PeerConnect
          </Button>
        </Form>

        <Divider style={{ margin: '20px 0', borderColor: '#e2e8f0' }} />

        <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1d4ed8', fontWeight: 700 }}>
            Sign In Here →
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;
