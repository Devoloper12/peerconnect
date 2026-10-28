/**
 * ============================================================================
 * PeerConnect — Student Study Group Management System Backend
 * B.Tech S3 OOP Project • Group 1
 * 
 * Project Credits & Team Contributions:
 * - HIMASANKAR V: Project Integration & Full Stack Development
 * - AAKIFA SHERIN: MongoDB Database Design
 * - GOURI S UNNI: Group Management System
 * - GAYATHRI DAS R: Notification System & Testing
 * - AALIYA NOUSHAD: User Interface Design & Documentation
 * 
 * Architecture:
 * - Object-Oriented Programming (OOP): Abstraction, Inheritance, Encapsulation, Polymorphism
 * - Database: MongoDB Atlas (Mongoose ODM)
 * - Security: JWT Authentication & bcryptjs Password Hashing
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// ============================================================================
// 1. MONGODB DATABASE CONNECTION
// ============================================================================
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in your .env file.');
    }
    const conn = await mongoose.connect(mongoURI, {
      dbName: 'peerconnect',
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Initialize Database Connection
connectDB();

// ============================================================================
// 2. MONGODB MODELS
// ============================================================================
const Student = require('./models/Student');
const Group = require('./models/Group');
const Message = require('./models/Message');
const Session = require('./models/Session');
const Notification = require('./models/Notification');

// ============================================================================
// 3. OBJECT-ORIENTED PROGRAMMING (OOP) CORE ARCHITECTURE
// ============================================================================

/**
 * Abstract Base Class: User
 * Demonstrates:
 * 1. Abstraction (cannot be directly instantiated)
 * 2. Encapsulation (ES6 private fields # for sensitive properties)
 */
class User {
  #id;
  #name;
  #email;
  #passwordHash;
  #role;
  #createdAt;

  constructor({ id, name, email, passwordHash, role = 'student', createdAt = new Date() }) {
    if (new.target === User) {
      throw new TypeError("Abstraction Error: Cannot instantiate abstract class User directly. Instantiate a specialized subclass like StudentUser or AdminUser.");
    }
    if (!email || !name) {
      throw new Error("Validation Error: User must have a valid name and email address.");
    }

    this.#id = id || null;
    this.#name = name.trim();
    this.#email = email.trim().toLowerCase();
    this.#passwordHash = passwordHash || null;
    this.#role = role;
    this.#createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
  }

  get id() { return this.#id; }
  get name() { return this.#name; }
  get email() { return this.#email; }
  get role() { return this.#role; }
  get createdAt() { return this.#createdAt; }

  set name(newName) {
    if (!newName || typeof newName !== 'string' || newName.trim().length < 2) {
      throw new Error("Validation Error: Name must be at least 2 characters long.");
    }
    this.#name = newName.trim();
  }

  set email(newEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      throw new Error("Validation Error: Invalid email address format.");
    }
    this.#email = newEmail.trim().toLowerCase();
  }

  setPasswordHash(hash) {
    if (!hash || typeof hash !== 'string') {
      throw new Error("Validation Error: Password hash must be a non-empty string.");
    }
    this.#passwordHash = hash;
  }

  getPasswordHash() {
    return this.#passwordHash;
  }

  hasAccessToGroup(groupId, memberList = []) {
    return memberList.some(memberId => memberId.toString() === (this.#id ? this.#id.toString() : ''));
  }

  // Abstract Methods enforced on derived classes (Polymorphism)
  getDashboardMetrics(systemContext = {}) {
    throw new Error("Abstract Method getDashboardMetrics() must be implemented by subclass.");
  }

  canCreateSession(group) {
    throw new Error("Abstract Method canCreateSession() must be implemented by subclass.");
  }

  toSafeJSON() {
    return {
      id: this.#id,
      name: this.#name,
      email: this.#email,
      role: this.#role,
      createdAt: this.#createdAt
    };
  }
}

/**
 * Derived Class: StudentUser
 * Demonstrates:
 * 1. Inheritance (extends User)
 * 2. Encapsulation (encapsulates academic profile with getters/setters)
 * 3. Polymorphism (overrides getDashboardMetrics and canCreateSession with student-specific behaviors)
 */
class StudentUser extends User {
  #department;
  #year;
  #semester;
  #academicInterests;
  #personalInterests;
  #learningPreferences;
  #subjects;
  #interests;
  #availability;
  #learningPreference;

  constructor(data) {
    super({
      id: data._id || data.id,
      name: data.name,
      email: data.email,
      passwordHash: data.password,
      role: 'student',
      createdAt: data.createdAt
    });

    this.#department = data.department || 'Computer Science & Engineering';
    this.#year = data.year || '2nd Year';
    this.#semester = data.semester || 'S3';

    this.#academicInterests = Array.isArray(data.academicInterests)
      ? [...data.academicInterests]
      : (Array.isArray(data.subjects) ? [...data.subjects] : []);

    this.#personalInterests = Array.isArray(data.personalInterests)
      ? [...data.personalInterests]
      : (Array.isArray(data.interests) ? [...data.interests] : []);

    this.#learningPreferences = Array.isArray(data.learningPreferences)
      ? [...data.learningPreferences]
      : (data.learningPreference ? [data.learningPreference] : ['Group Discussion', 'Problem Solving']);

    this.#subjects = [...this.#academicInterests];
    this.#interests = [...this.#personalInterests];
    this.#availability = data.availability || 'Evenings 6 PM - 9 PM';
    this.#learningPreference = this.#learningPreferences.join(', ');
  }

  get department() { return this.#department; }
  set department(val) { if (val && typeof val === 'string') this.#department = val.trim(); }

  get year() { return this.#year; }
  set year(val) { if (val && typeof val === 'string') this.#year = val.trim(); }

  get semester() { return this.#semester; }
  set semester(val) { if (val && typeof val === 'string') this.#semester = val.trim(); }

  get academicInterests() { return [...this.#academicInterests]; }
  set academicInterests(list) {
    if (Array.isArray(list)) {
      this.#academicInterests = list.map(item => String(item).trim()).filter(Boolean);
      this.#subjects = [...this.#academicInterests];
    }
  }

  get personalInterests() { return [...this.#personalInterests]; }
  set personalInterests(list) {
    if (Array.isArray(list)) {
      this.#personalInterests = list.map(item => String(item).trim()).filter(Boolean);
      this.#interests = [...this.#personalInterests];
    }
  }

  get learningPreferences() { return [...this.#learningPreferences]; }
  set learningPreferences(list) {
    if (Array.isArray(list)) {
      this.#learningPreferences = list.map(item => String(item).trim()).filter(Boolean);
      this.#learningPreference = this.#learningPreferences.join(', ');
    }
  }

  get subjects() { return [...this.#academicInterests]; }
  get interests() { return [...this.#personalInterests]; }
  get availability() { return this.#availability; }
  get learningPreference() { return this.#learningPreference; }

  set subjects(newSubjects) { this.academicInterests = newSubjects; }
  set interests(newInterests) { this.personalInterests = newInterests; }

  set availability(newAvailability) {
    if (!newAvailability || typeof newAvailability !== 'string') {
      throw new Error("Validation Error: Availability must be a descriptive string.");
    }
    this.#availability = newAvailability.trim();
  }

  set learningPreference(newPreference) {
    if (!newPreference || typeof newPreference !== 'string') {
      throw new Error("Validation Error: Learning Preference must be specified.");
    }
    this.#learningPreference = newPreference.trim();
  }

  getDashboardMetrics({ userGroups = [], upcomingSessions = [], notifications = [] } = {}) {
    const activeGroupsCount = userGroups.length;
    const pendingSessionsCount = upcomingSessions.filter(s => new Date(s.date) >= new Date()).length;
    const unreadNotifications = notifications.filter(n => !n.read).length;
    const subjectDiversity = new Set(userGroups.map(g => g.subject)).size;

    return {
      type: 'STUDENT_ANALYTICS',
      role: 'student',
      studentName: this.name,
      metrics: {
        totalJoinedGroups: activeGroupsCount,
        upcomingStudySessions: pendingSessionsCount,
        unreadNotificationsCount: unreadNotifications,
        academicInterestsCount: this.#academicInterests.length,
        personalInterestsCount: this.#personalInterests.length,
        department: this.#department,
        semester: this.#semester,
        year: this.#year,
        subjectDiversityScore: subjectDiversity,
        learningPreferences: this.#learningPreferences,
        availabilityWindow: this.#availability
      },
      recommendedStudyAction: pendingSessionsCount > 0 
        ? `You have ${pendingSessionsCount} upcoming study session(s). Check your schedule!` 
        : 'Explore groups to schedule your next peer collaboration session!'
    };
  }

  canCreateSession(group) {
    if (!group) return false;
    const studentIdStr = this.id ? this.id.toString() : '';
    const isMember = (group.members || []).some(m => {
      const mId = m._id ? m._id.toString() : m.toString();
      return mId === studentIdStr;
    });
    const isCreator = group.createdBy && (group.createdBy._id || group.createdBy).toString() === studentIdStr;
    return isMember || isCreator;
  }

  toSafeJSON() {
    return {
      ...super.toSafeJSON(),
      department: this.#department,
      year: this.#year,
      semester: this.#semester,
      academicInterests: this.#academicInterests,
      personalInterests: this.#personalInterests,
      learningPreferences: this.#learningPreferences,
      subjects: this.#academicInterests,
      interests: this.#personalInterests,
      availability: this.#availability,
      learningPreference: this.#learningPreference
    };
  }
}

/**
 * Derived Class: AdminUser
 * Demonstrates:
 * 1. Inheritance (extends User)
 * 2. Polymorphism (overrides getDashboardMetrics and canCreateSession with administrative authority)
 */
class AdminUser extends User {
  #adminDepartment;
  #accessPermissions;

  constructor(data) {
    super({
      id: data._id || data.id,
      name: data.name,
      email: data.email,
      passwordHash: data.password,
      role: 'admin',
      createdAt: data.createdAt
    });

    this.#adminDepartment = data.adminDepartment || 'Academic Affairs / CSE Dept';
    this.#accessPermissions = data.accessPermissions || ['MANAGE_USERS', 'MANAGE_GROUPS', 'SYSTEM_AUDIT'];
  }

  get adminDepartment() { return this.#adminDepartment; }
  get accessPermissions() { return [...this.#accessPermissions]; }

  getDashboardMetrics({ totalStudents = 0, totalGroups = 0, totalSessions = 0 } = {}) {
    return {
      type: 'ADMIN_ANALYTICS',
      role: 'admin',
      adminName: this.name,
      department: this.#adminDepartment,
      metrics: {
        totalRegisteredStudents: totalStudents,
        totalActiveGroups: totalGroups,
        totalScheduledSessions: totalSessions,
        systemHealth: 'Optimal (MongoDB Atlas Connected)',
        moderationQueueSize: 0
      },
      recommendedStudyAction: 'System running smoothly. Monitor group creation rates and student engagement.'
    };
  }

  canCreateSession(group) {
    return true; // Superuser permission across all groups
  }

  toSafeJSON() {
    return {
      ...super.toSafeJSON(),
      adminDepartment: this.#adminDepartment,
      accessPermissions: this.#accessPermissions
    };
  }
}

/**
 * Domain Service: GroupManager
 * Encapsulates study group capacity logic & 4-Factor Matching Algorithm
 */
class GroupManager {
  static isGroupAtCapacity(group) {
    if (!group) return true;
    const max = group.maxMembers || 8;
    const current = (group.members || []).length;
    return current >= max;
  }

  static isStudentMember(group, studentId) {
    if (!group || !studentId) return false;
    const idStr = studentId.toString();
    return (group.members || []).some(m => {
      const memberId = m._id ? m._id.toString() : m.toString();
      return memberId === idStr;
    });
  }

  static calculateCompatibility(studentProfile, group) {
    if (!studentProfile || !group) return 50;
    let score = 10;

    // 1. Department Match (Weight: 25%)
    const studentDept = (studentProfile.department || '').toLowerCase().trim();
    const groupDept = (group.department || '').toLowerCase().trim();
    if (studentDept && groupDept && (studentDept === groupDept || studentDept.includes(groupDept) || groupDept.includes(studentDept))) {
      score += 25;
    } else if (!groupDept || groupDept === 'all departments') {
      score += 15;
    }

    // 2. Semester Match (Weight: 25%)
    const studentSem = (studentProfile.semester || 'S3').toUpperCase().trim();
    const groupSem = (group.semester || 'S3').toUpperCase().trim();
    if (studentSem === groupSem) {
      score += 25;
    } else {
      score += 5;
    }

    // 3. Academic Interests Match (Weight: 35%)
    const academicInterests = [
      ...(studentProfile.academicInterests || []),
      ...(studentProfile.subjects || [])
    ].map(s => s.toLowerCase().trim());

    const groupSubject = (group.subject || '').toLowerCase().trim();

    if (academicInterests.some(item => item === groupSubject || groupSubject.includes(item) || item.includes(groupSubject))) {
      score += 35;
    } else {
      const desc = `${group.groupName || ''} ${group.description || ''}`.toLowerCase();
      const hasKeyword = academicInterests.some(item => desc.includes(item));
      if (hasKeyword) score += 20;
    }

    // 4. Learning Preferences Match (Weight: 15%)
    const learningPrefs = [
      ...(studentProfile.learningPreferences || []),
      ...(studentProfile.learningPreference ? [studentProfile.learningPreference] : [])
    ].map(p => p.toLowerCase().trim());

    const combinedGroupText = `${group.groupName || ''} ${group.description || ''}`.toLowerCase();
    let prefMatched = false;
    for (const pref of learningPrefs) {
      if (pref.includes('group') || pref.includes('discussion')) {
        if (combinedGroupText.includes('discussion') || combinedGroupText.includes('collaborat') || combinedGroupText.includes('group')) {
          prefMatched = true; break;
        }
      }
      if (pref.includes('problem') || pref.includes('solving')) {
        if (combinedGroupText.includes('problem') || combinedGroupText.includes('code') || combinedGroupText.includes('lab') || combinedGroupText.includes('dsa') || combinedGroupText.includes('project')) {
          prefMatched = true; break;
        }
      }
      if (pref.includes('exam') || pref.includes('preparation')) {
        if (combinedGroupText.includes('exam') || combinedGroupText.includes('test') || combinedGroupText.includes('revision') || combinedGroupText.includes('prep')) {
          prefMatched = true; break;
        }
      }
    }

    if (prefMatched || learningPrefs.length > 0) score += 15;
    return Math.min(Math.max(score, 30), 100);
  }

  static calculatePeerMatch(studentA, studentB) {
    if (!studentA || !studentB) return 50;
    let score = 0;

    // 1. Same Department (25%)
    const deptA = (studentA.department || '').toLowerCase().trim();
    const deptB = (studentB.department || '').toLowerCase().trim();
    if (deptA && deptB && deptA === deptB) {
      score += 25;
    } else if (deptA && deptB && (deptA.includes(deptB) || deptB.includes(deptA))) {
      score += 15;
    }

    // 2. Same Semester (25%)
    const semA = (studentA.semester || 'S3').toUpperCase().trim();
    const semB = (studentB.semester || 'S3').toUpperCase().trim();
    if (semA === semB) {
      score += 25;
    } else {
      score += 5;
    }

    // 3. Academic Interests Overlap (35%)
    const interestsA = [
      ...(studentA.academicInterests || []),
      ...(studentA.subjects || [])
    ].map(s => s.toLowerCase().trim());

    const interestsB = [
      ...(studentB.academicInterests || []),
      ...(studentB.subjects || [])
    ].map(s => s.toLowerCase().trim());

    if (interestsA.length > 0 && interestsB.length > 0) {
      const common = interestsA.filter(item => interestsB.includes(item));
      if (common.length > 0) {
        const ratio = common.length / Math.max(interestsA.length, 1);
        score += Math.min(35, Math.round(ratio * 25) + 10);
      } else {
        score += 5;
      }
    } else {
      score += 10;
    }

    // 4. Learning Preferences Overlap (15%)
    const prefsA = [
      ...(studentA.learningPreferences || []),
      ...(studentA.learningPreference ? [studentA.learningPreference] : [])
    ].map(p => p.toLowerCase().trim());

    const prefsB = [
      ...(studentB.learningPreferences || []),
      ...(studentB.learningPreference ? [studentB.learningPreference] : [])
    ].map(p => p.toLowerCase().trim());

    if (prefsA.length > 0 && prefsB.length > 0) {
      const hasMatch = prefsA.some(pa => prefsB.some(pb => pb.includes(pa) || pa.includes(pb)));
      if (hasMatch) score += 15;
      else score += 5;
    } else {
      score += 10;
    }

    return Math.min(Math.max(score, 30), 100);
  }
}

/**
 * Domain Service: SessionScheduler
 */
class SessionScheduler {
  static validateSessionTiming(date, time) {
    if (!date) throw new Error("Validation Error: Session date is required.");
    if (!time) throw new Error("Validation Error: Session time is required.");

    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime())) {
      throw new Error("Validation Error: Invalid date format provided.");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compareDate = new Date(sessionDate);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate < today) {
      throw new Error("Validation Error: Cannot schedule study sessions in the past.");
    }
    return true;
  }

  static parseSessionDateTime(dateVal, timeStr = '') {
    if (!dateVal) return null;
    let year, monthIndex, day;

    const str = dateVal instanceof Date ? dateVal.toISOString() : String(dateVal);
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      year = parseInt(match[1], 10);
      monthIndex = parseInt(match[2], 10) - 1;
      day = parseInt(match[3], 10);
    } else {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return null;
      year = d.getFullYear();
      monthIndex = d.getMonth();
      day = d.getDate();
    }

    let hours = 23;
    let minutes = 59;
    if (timeStr && typeof timeStr === 'string' && timeStr.trim().length > 0) {
      const trimmed = timeStr.trim().toUpperCase();
      const isPM = trimmed.includes('PM');
      const isAM = trimmed.includes('AM');
      const cleaned = trimmed.replace(/[APM\s]/g, '');
      const parts = cleaned.split(':');
      if (parts.length >= 2) {
        let h = parseInt(parts[0], 10) || 0;
        const m = parseInt(parts[1], 10) || 0;
        if (isPM && h < 12) h += 12;
        else if (isAM && h === 12) h = 0;
        hours = h;
        minutes = m;
      }
    }

    return new Date(year, monthIndex, day, hours, minutes, 0, 0);
  }

  static isSessionExpired(session) {
    if (!session || !session.date) return true;
    const sessionDt = SessionScheduler.parseSessionDateTime(session.date, session.time);
    if (!sessionDt) return true;
    return sessionDt.getTime() < Date.now();
  }

  static parseTimePart(timeStr = '') {
    let hours = 23;
    let minutes = 59;
    if (timeStr && typeof timeStr === 'string' && timeStr.trim().length > 0) {
      const trimmed = timeStr.trim().toUpperCase();
      const isPM = trimmed.includes('PM');
      const isAM = trimmed.includes('AM');
      const cleaned = trimmed.replace(/[APM\s]/g, '');
      const parts = cleaned.split(':');
      if (parts.length >= 2) {
        let h = parseInt(parts[0], 10) || 0;
        const m = parseInt(parts[1], 10) || 0;
        if (isPM && h < 12) h += 12;
        else if (isAM && h === 12) h = 0;
        hours = h;
        minutes = m;
      }
    }
    return { hours, minutes };
  }

  static parseNotificationDateTime(msg) {
    if (!msg || typeof msg !== 'string') return null;

    // Pattern 1: "scheduled for 10/28/2026 at 8:00 AM"
    let m = msg.match(/scheduled for\s+([^\s]+)\s+at\s+([^.]+)/i);
    if (m) {
      const dateStr = m[1].trim();
      const timeStr = m[2].trim();
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const { hours, minutes } = SessionScheduler.parseTimePart(timeStr);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes, 0, 0);
      }
    }

    // Pattern 2: "on Wed, Oct 28, 2026 at 8:00 AM." or "on Mon, Oct 26, 2026 at 5:15."
    m = msg.match(/on\s+(?:[A-Za-z]+,\s*)?([A-Za-z]+\s+\d{1,2},\s*\d{4})\s+at\s+([^.]+)/i);
    if (m) {
      const dateStr = m[1].trim();
      const timeStr = m[2].trim();
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const { hours, minutes } = SessionScheduler.parseTimePart(timeStr);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes, 0, 0);
      }
    }

    // Pattern 3: General fallback "on <datePart> at <timePart>"
    m = msg.match(/on\s+([^.]+?)\s+at\s+([^.]+)/i);
    if (m) {
      const dateStr = m[1].trim().replace(/^[A-Za-z]+,\s*/, '');
      const timeStr = m[2].trim();
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const { hours, minutes } = SessionScheduler.parseTimePart(timeStr);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes, 0, 0);
      }
    }

    return null;
  }

  static isNotificationExpired(notif, activeSessionIds = null) {
    if (!notif) return false;
    if (!['SESSION', 'SESSION_REMINDER'].includes(notif.type)) return false;

    if (notif.sessionId && activeSessionIds) {
      if (!activeSessionIds.has(String(notif.sessionId))) {
        return true;
      }
    }

    const dt = SessionScheduler.parseNotificationDateTime(notif.message);
    if (dt) {
      return dt.getTime() < Date.now();
    }
    return false;
  }

  static formatDisplay(date, time) {
    try {
      const d = new Date(date);
      const dateStr = d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      return `${dateStr} at ${time}`;
    } catch {
      return `${date} at ${time}`;
    }
  }
}

/**
 * Chat Classes (OOP Encapsulation, Polymorphism & Attachments)
 */
class ChatAttachment {
  #name;
  #fileType;
  #size;
  #dataUrl;

  constructor(attachment = {}) {
    this.#name = attachment.name ? String(attachment.name).trim() : '';
    this.#fileType = attachment.fileType ? String(attachment.fileType).trim() : 'application/octet-stream';
    this.#size = Number(attachment.size) || 0;
    this.#dataUrl = attachment.dataUrl ? String(attachment.dataUrl) : '';
  }

  get name() { return this.#name; }
  get fileType() { return this.#fileType; }
  get size() { return this.#size; }
  get dataUrl() { return this.#dataUrl; }
  get isValid() { return Boolean(this.#name && this.#dataUrl); }

  validate() {
    if (!this.isValid) return null;
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (this.#size > maxSizeBytes) {
      throw new Error(`Attachment exceeds maximum allowable size of 10MB (${(this.#size / (1024 * 1024)).toFixed(2)} MB).`);
    }
    return {
      name: this.#name,
      fileType: this.#fileType,
      size: this.#size,
      dataUrl: this.#dataUrl
    };
  }
}

class BaseChatHandler {
  constructor(senderId, senderName) {
    if (new.target === BaseChatHandler) {
      throw new TypeError('Cannot construct BaseChatHandler instances directly (Abstract Class).');
    }
    this._senderId = senderId;
    this._senderName = senderName;
  }

  get senderId() { return this._senderId; }
  get senderName() { return this._senderName; }

  validateMessageAndAttachment(text, rawAttachment) {
    let attachment = null;
    if (rawAttachment && (rawAttachment.dataUrl || rawAttachment.name)) {
      const attachmentEntity = new ChatAttachment(rawAttachment);
      attachment = attachmentEntity.validate();
    }

    const cleanText = text && typeof text === 'string' ? text.trim() : '';
    if (!cleanText && !attachment) {
      throw new Error('Message cannot be empty. Please enter text or attach a file.');
    }
    if (cleanText.length > 2000) {
      throw new Error('Message text exceeds maximum length of 2000 characters.');
    }
    return { message: cleanText, attachment };
  }

  async authorizeAndPrepare(targetId, messageText, rawAttachment, Model) {
    throw new Error('Abstract method "authorizeAndPrepare()" must be implemented by subclass.');
  }
}

class PersonalChatHandler extends BaseChatHandler {
  constructor(senderId, senderName) {
    super(senderId, senderName);
    this._chatType = 'PERSONAL';
  }

  async authorizeAndPrepare(targetId, messageText, rawAttachment, StudentModel) {
    const { message, attachment } = this.validateMessageAndAttachment(messageText, rawAttachment);
    if (!targetId) throw new Error('Recipient student ID is required for personal chat.');
    if (targetId.toString() === this.senderId.toString()) {
      throw new Error('Students cannot send direct messages to themselves.');
    }

    const recipient = await StudentModel.findById(targetId);
    if (!recipient) throw new Error('Target student not found.');

    return {
      chatType: 'PERSONAL',
      sender: this.senderId,
      recipient: recipient._id,
      message,
      attachment,
      recipientName: recipient.name
    };
  }
}

class GroupChatHandler extends BaseChatHandler {
  constructor(senderId, senderName) {
    super(senderId, senderName);
    this._chatType = 'GROUP';
  }

  async authorizeAndPrepare(targetId, messageText, rawAttachment, GroupModel) {
    const { message, attachment } = this.validateMessageAndAttachment(messageText, rawAttachment);
    if (!targetId) throw new Error('Study group ID is required for group chat.');

    const group = await GroupModel.findById(targetId);
    if (!group) throw new Error('Study group not found.');

    const isMember = (group.members || []).some(mId => {
      const idStr = mId._id ? mId._id.toString() : mId.toString();
      return idStr === this.senderId.toString();
    });
    if (!isMember) {
      throw new Error('Access denied: You must be an enrolled member of this study group to participate in the group chat.');
    }

    return {
      chatType: 'GROUP',
      sender: this.senderId,
      groupId: group._id,
      message,
      attachment,
      groupName: group.groupName
    };
  }
}

class ChatManager {
  static getHandler(type, senderId, senderName) {
    switch (type) {
      case 'GROUP': return new GroupChatHandler(senderId, senderName);
      case 'PERSONAL':
      default: return new PersonalChatHandler(senderId, senderName);
    }
  }

  static formatMessageForClient(msg, currentUserId) {
    const sender = msg.sender || {};
    const senderId = sender._id ? sender._id.toString() : (typeof sender === 'string' ? sender : '');
    const isMine = currentUserId && senderId ? senderId === currentUserId.toString() : false;

    return {
      _id: msg._id ? msg._id.toString() : String(Math.random()),
      id: msg._id ? msg._id.toString() : String(Math.random()),
      chatType: msg.chatType,
      sender: {
        _id: senderId,
        id: senderId,
        name: sender.name || 'Anonymous Student',
        department: sender.department || 'Student',
        semester: sender.semester || 'S3'
      },
      message: msg.message || '',
      text: msg.message || '',
      attachment: msg.attachment && msg.attachment.dataUrl ? {
        name: msg.attachment.name,
        fileType: msg.attachment.fileType,
        size: msg.attachment.size,
        dataUrl: msg.attachment.dataUrl
      } : null,
      createdAt: msg.createdAt || new Date().toISOString(),
      isMine
    };
  }
}

// ============================================================================
// 4. AUTHENTICATION & ERROR HANDLING MIDDLEWARE
// ============================================================================
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'peerconnect_academic_jwt_secret_key_2026',
    { expiresIn: '30d' }
  );
};

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'peerconnect_academic_jwt_secret_key_2026'
    );
    const student = await Student.findById(decoded.id);
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'The student account linked to this token no longer exists.'
      });
    }

    req.student = student;
    req.oopUser = student.role === 'admin' ? new AdminUser(student) : new StudentUser(student);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed: Invalid or expired token.',
      error: error.message
    });
  }
};

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') {
    message = `Resource not found with identifier: ${err.value}`;
    statusCode = 404;
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value: An account with this ${field} already exists.`;
    statusCode = 400;
  }
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ');
    statusCode = 400;
  }
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid authentication token signature.';
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

// ============================================================================
// 5. CONTROLLER HANDLERS
// ============================================================================

// --- 5.1 Auth Controllers ---
const registerStudent = async (req, res, next) => {
  try {
    const {
      name, email, password, department, year, semester,
      academicInterests, personalInterests, learningPreferences,
      subjects, interests, availability, learningPreference, role
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password.'
      });
    }

    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'A student account with this email address already exists.'
      });
    }

    const academicList = Array.isArray(academicInterests)
      ? academicInterests
      : (Array.isArray(subjects) ? subjects : (subjects ? [subjects] : []));

    const personalList = Array.isArray(personalInterests)
      ? personalInterests
      : (Array.isArray(interests) ? interests : (interests ? [interests] : []));

    const learningList = Array.isArray(learningPreferences)
      ? learningPreferences
      : (learningPreference ? [learningPreference] : ['Group Discussion', 'Problem Solving']);

    const tempStudentOOP = new StudentUser({
      name,
      email,
      password,
      department: department || 'Computer Science & Engineering',
      year: year || '2nd Year',
      semester: semester || 'S3',
      academicInterests: academicList,
      personalInterests: personalList,
      learningPreferences: learningList,
      availability: availability || 'Evenings 6 PM - 9 PM',
      learningPreference: learningList.join(', ')
    });

    const student = await Student.create({
      name: tempStudentOOP.name,
      email: tempStudentOOP.email,
      password,
      department: tempStudentOOP.department,
      year: tempStudentOOP.year,
      semester: tempStudentOOP.semester,
      academicInterests: tempStudentOOP.academicInterests,
      personalInterests: tempStudentOOP.personalInterests,
      learningPreferences: tempStudentOOP.learningPreferences,
      subjects: tempStudentOOP.academicInterests,
      interests: tempStudentOOP.personalInterests,
      availability: tempStudentOOP.availability,
      learningPreference: tempStudentOOP.learningPreference,
      role: role === 'admin' ? 'admin' : 'student'
    });

    await Notification.create({
      studentId: student._id,
      message: `Welcome to PeerConnect, ${student.name}! Start by exploring study groups or creating one.`,
      type: 'WELCOME',
      read: false
    });

    const token = generateToken(student._id);
    const oopStudent = new StudentUser(student);

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      token,
      user: oopStudent.toSafeJSON()
    });
  } catch (error) {
    next(error);
  }
};

const loginStudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const student = await Student.findOne({ email: email.toLowerCase() }).select('+password');
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No student account found with this email.'
      });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password does not match.'
      });
    }

    const oopUser = student.role === 'admin' ? new AdminUser(student) : new StudentUser(student);
    const token = generateToken(student._id);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${student.name}!`,
      token,
      user: oopUser.toSafeJSON()
    });
  } catch (error) {
    next(error);
  }
};

// --- 5.2 Profile Controllers ---
const getProfile = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    const userGroups = await Group.find({ members: studentId }).populate('createdBy', 'name email');
    
    // Automatically clear expired sessions
    const allSessions = await Session.find({
      groupId: { $in: userGroups.map(g => g._id) }
    }).sort({ date: 1, time: 1 });

    const expiredIds = [];
    const upcomingSessions = [];
    for (const s of allSessions) {
      if (SessionScheduler.isSessionExpired(s)) {
        expiredIds.push(s._id);
      } else {
        upcomingSessions.push(s);
      }
    }

    if (expiredIds.length > 0) {
      await Session.deleteMany({ _id: { $in: expiredIds } });
    }

    // Clean ended session reminders and notifications for this student
    const activeSessionIds = new Set(upcomingSessions.map(s => String(s._id)));
    const studentSessionNotifs = await Notification.find({
      studentId,
      type: { $in: ['SESSION', 'SESSION_REMINDER'] }
    });
    const expiredNotifIds = studentSessionNotifs
      .filter(n => SessionScheduler.isNotificationExpired(n, activeSessionIds))
      .map(n => n._id);

    if (expiredNotifIds.length > 0) {
      await Notification.deleteMany({ _id: { $in: expiredNotifIds } });
    }

    const notifications = await Notification.find({ studentId }).sort({ createdAt: -1 });

    const dashboardMetrics = req.oopUser.getDashboardMetrics({
      userGroups,
      upcomingSessions,
      notifications
    });

    return res.status(200).json({
      success: true,
      user: req.oopUser.toSafeJSON(),
      dashboard: dashboardMetrics,
      myGroupsCount: userGroups.length,
      upcomingSessionsCount: upcomingSessions.length
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    const {
      name, department, year, semester, academicInterests,
      personalInterests, learningPreferences, subjects,
      interests, availability, learningPreference
    } = req.body;

    const oopValidator = new StudentUser(student);
    if (name !== undefined) oopValidator.name = name;
    if (department !== undefined) oopValidator.department = department;
    if (year !== undefined) oopValidator.year = year;
    if (semester !== undefined) oopValidator.semester = semester;

    const academicList = academicInterests !== undefined ? academicInterests : subjects;
    if (academicList !== undefined) {
      oopValidator.academicInterests = Array.isArray(academicList) ? academicList : [academicList];
    }

    const personalList = personalInterests !== undefined ? personalInterests : interests;
    if (personalList !== undefined) {
      oopValidator.personalInterests = Array.isArray(personalList) ? personalList : [personalList];
    }

    const learningList = learningPreferences !== undefined 
      ? learningPreferences 
      : (learningPreference ? [learningPreference] : undefined);
    if (learningList !== undefined) {
      oopValidator.learningPreferences = Array.isArray(learningList) ? learningList : [learningList];
    }

    if (availability !== undefined) oopValidator.availability = availability;

    student.name = oopValidator.name;
    student.department = oopValidator.department;
    student.year = oopValidator.year;
    student.semester = oopValidator.semester;
    student.academicInterests = oopValidator.academicInterests;
    student.personalInterests = oopValidator.personalInterests;
    student.learningPreferences = oopValidator.learningPreferences;
    student.subjects = oopValidator.academicInterests;
    student.interests = oopValidator.personalInterests;
    student.availability = oopValidator.availability;
    student.learningPreference = oopValidator.learningPreference;

    await student.save();

    await Notification.create({
      studentId: student._id,
      message: 'Your academic profile and learning preferences were successfully updated.',
      type: 'GENERAL',
      read: false
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: oopValidator.toSafeJSON()
    });
  } catch (error) {
    next(error);
  }
};

// --- 5.3 Groups Controllers ---
const getGroups = async (req, res, next) => {
  try {
    const { search, subject } = req.query;
    const query = {};

    if (subject && subject !== 'ALL') {
      query.subject = { $regex: new RegExp(`^${subject}$`, 'i') };
    }

    if (search) {
      query.$or = [
        { groupName: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const groups = await Group.find(query)
      .populate('createdBy', 'name email department semester')
      .populate('members', 'name email department semester academicInterests subjects interests learningPreferences')
      .sort({ createdAt: -1 });

    const studentProfile = req.student ? {
      department: req.student.department || 'Computer Science & Engineering',
      semester: req.student.semester || 'S3',
      academicInterests: req.student.academicInterests || req.student.subjects || [],
      personalInterests: req.student.personalInterests || req.student.interests || [],
      learningPreferences: req.student.learningPreferences || (req.student.learningPreference ? [req.student.learningPreference] : []),
      subjects: req.student.subjects || req.student.academicInterests || [],
      interests: req.student.interests || req.student.personalInterests || [],
      availability: req.student.availability,
      learningPreference: req.student.learningPreference
    } : null;

    const enrichedGroups = groups.map(grp => {
      const gObj = grp.toObject();
      const memberCount = gObj.members ? gObj.members.length : 0;
      const isMember = req.student ? (
        GroupManager.isStudentMember(gObj, req.student._id) ||
        (gObj.createdBy && gObj.createdBy._id && gObj.createdBy._id.toString() === req.student._id.toString())
      ) : false;

      gObj.memberCount = memberCount;
      gObj.isFull = GroupManager.isGroupAtCapacity(gObj);
      gObj.isMember = isMember;
      gObj.isCreator = req.student ? (gObj.createdBy && gObj.createdBy._id.toString() === req.student._id.toString()) : false;
      gObj.matchScore = studentProfile ? GroupManager.calculateCompatibility(studentProfile, gObj) : 75;

      // Privacy Enforcement: Only group members can view the member list
      if (!isMember) {
        gObj.members = []; // Hide member list from non-members
        gObj.isMembersVisible = false;
        gObj.privacyNotice = 'Member list visible after joining the group.';
      } else {
        gObj.isMembersVisible = true;
        gObj.members = (gObj.members || []).map(m => ({
          _id: m._id,
          name: m.name,
          email: m.email,
          department: m.department || gObj.department || 'Computer Science & Engineering',
          semester: m.semester || gObj.semester || 'S3',
          academicInterests: (m.academicInterests && m.academicInterests.length > 0) ? m.academicInterests : (m.subjects || []),
          isCreator: gObj.createdBy && (gObj.createdBy._id ? gObj.createdBy._id.toString() : gObj.createdBy.toString()) === m._id.toString()
        }));
      }

      return gObj;
    });

    return res.status(200).json({
      success: true,
      count: enrichedGroups.length,
      groups: enrichedGroups
    });
  } catch (error) {
    next(error);
  }
};

const createGroup = async (req, res, next) => {
  try {
    const { groupName, subject, department, semester, description, maxMembers } = req.body;
    const studentId = req.student._id;

    if (!groupName || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide group name, subject, and description.'
      });
    }

    const group = await Group.create({
      groupName: groupName.trim(),
      subject: subject.trim(),
      department: (department || req.student.department || 'Computer Science & Engineering').trim(),
      semester: (semester || req.student.semester || 'S3').trim(),
      description: description.trim(),
      maxMembers: maxMembers ? parseInt(maxMembers, 10) : 8,
      createdBy: studentId,
      members: [studentId]
    });

    await group.populate('createdBy', 'name email');

    await Notification.create({
      studentId,
      title: 'Study Group Created',
      message: `You created study group "${group.groupName}" for ${group.subject}.`,
      type: 'GROUP_UPDATE',
      read: false
    });

    return res.status(201).json({
      success: true,
      message: 'Study group created successfully!',
      group
    });
  } catch (error) {
    next(error);
  }
};

const joinGroup = async (req, res, next) => {
  try {
    const { groupId } = req.body;
    const studentId = req.student._id;

    if (!groupId) {
      return res.status(400).json({ success: false, message: 'Please provide groupId to join.' });
    }

    const group = await Group.findById(groupId).populate('createdBy', 'name email');
    if (!group) {
      return res.status(404).json({ success: false, message: 'Study group not found.' });
    }

    if (GroupManager.isGroupAtCapacity(group)) {
      return res.status(400).json({
        success: false,
        message: `This study group has reached its maximum capacity of ${group.maxMembers} members.`
      });
    }

    if (GroupManager.isStudentMember(group, studentId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this study group.'
      });
    }

    group.members.push(studentId);
    await group.save();
    await group.populate('createdBy', 'name email department semester');
    await group.populate('members', 'name email department semester academicInterests subjects');

    const gObj = group.toObject();
    gObj.memberCount = gObj.members ? gObj.members.length : 0;
    gObj.isMember = true;
    gObj.isMembersVisible = true;
    gObj.members = (gObj.members || []).map(m => ({
      _id: m._id,
      name: m.name,
      email: m.email,
      department: m.department || gObj.department || 'Computer Science & Engineering',
      semester: m.semester || gObj.semester || 'S3',
      academicInterests: (m.academicInterests && m.academicInterests.length > 0) ? m.academicInterests : (m.subjects || []),
      isCreator: gObj.createdBy && (gObj.createdBy._id ? gObj.createdBy._id.toString() : gObj.createdBy.toString()) === m._id.toString()
    }));

    await Notification.create({
      studentId,
      title: 'Group Enrollment Confirmed',
      message: `You successfully joined the study group "${group.groupName}".`,
      type: 'JOIN',
      read: false
    });

    const existingMembers = (group.members || []).filter(m => {
      const mId = m._id ? m._id.toString() : m.toString();
      return mId !== studentId.toString();
    });
    for (const m of existingMembers) {
      const mId = m._id || m;
      await Notification.create({
        studentId: mId,
        title: 'New Member Joined Group',
        message: `👥 ${req.student.name} joined your study group "${group.groupName}" (${group.subject}).`,
        type: 'MEMBER_JOINED',
        read: false
      });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully joined ${group.groupName}!`,
      group: gObj
    });
  } catch (error) {
    next(error);
  }
};

const leaveGroup = async (req, res, next) => {
  try {
    const { groupId } = req.body;
    const studentId = req.student._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Study group not found.' });
    }

    if (!GroupManager.isStudentMember(group, studentId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this study group.'
      });
    }

    group.members = group.members.filter(m => m.toString() !== studentId.toString());
    await group.save();

    await Notification.create({
      studentId,
      message: `You left the study group "${group.groupName}".`,
      type: 'GROUP_UPDATE',
      read: false
    });

    return res.status(200).json({
      success: true,
      message: `You have left ${group.groupName}.`,
      group
    });
  } catch (error) {
    next(error);
  }
};

const getMyGroups = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    const groupsCreated = await Group.find({ createdBy: studentId })
      .populate('createdBy', 'name email department semester')
      .populate('members', 'name email department semester academicInterests subjects')
      .sort({ createdAt: -1 });

    const groupsJoined = await Group.find({ members: studentId })
      .populate('createdBy', 'name email department semester')
      .populate('members', 'name email department semester academicInterests subjects')
      .sort({ createdAt: -1 });

    const formatGroup = (grp) => {
      const gObj = grp.toObject();
      gObj.memberCount = gObj.members ? gObj.members.length : 0;
      gObj.isMember = true;
      gObj.isMembersVisible = true;
      gObj.members = (gObj.members || []).map(m => ({
        _id: m._id,
        name: m.name,
        email: m.email,
        department: m.department || gObj.department || 'Computer Science & Engineering',
        semester: m.semester || gObj.semester || 'S3',
        academicInterests: (m.academicInterests && m.academicInterests.length > 0) ? m.academicInterests : (m.subjects || []),
        isCreator: gObj.createdBy && (gObj.createdBy._id ? gObj.createdBy._id.toString() : gObj.createdBy.toString()) === m._id.toString()
      }));
      return gObj;
    };

    const formattedCreated = groupsCreated.map(formatGroup);
    const formattedJoined = groupsJoined.map(formatGroup);

    return res.status(200).json({
      success: true,
      createdCount: formattedCreated.length,
      joinedCount: formattedJoined.length,
      groups: formattedJoined,
      groupsCreated: formattedCreated,
      groupsJoined: formattedJoined
    });
  } catch (error) {
    next(error);
  }
};

// --- Group Member Privacy Controller ---
const getGroupMembers = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const studentId = req.student._id;

    const group = await Group.findById(groupId)
      .populate('createdBy', 'name email department semester')
      .populate('members', 'name email department semester academicInterests subjects');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Study group not found.' });
    }

    const isMember = GroupManager.isStudentMember(group, studentId) ||
      (group.createdBy && (group.createdBy._id ? group.createdBy._id.toString() : group.createdBy.toString()) === studentId.toString());

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Member list visible after joining the group.'
      });
    }

    const members = (group.members || []).map(m => ({
      _id: m._id,
      name: m.name,
      email: m.email,
      department: m.department || group.department || 'Computer Science & Engineering',
      semester: m.semester || group.semester || 'S3',
      academicInterests: (m.academicInterests && m.academicInterests.length > 0) ? m.academicInterests : (m.subjects || []),
      isCreator: group.createdBy && (group.createdBy._id ? group.createdBy._id.toString() : group.createdBy.toString()) === m._id.toString()
    }));

    return res.status(200).json({
      success: true,
      count: members.length,
      groupName: group.groupName,
      subject: group.subject,
      department: group.department,
      semester: group.semester,
      maxMembers: group.maxMembers,
      members
    });
  } catch (error) {
    next(error);
  }
};

// --- 5.4 Sessions Controllers ---
const createSession = async (req, res, next) => {
  try {
    let { topic, title, date, time, groupId } = req.body;
    topic = topic || title;
    time = time || '17:00';
    const studentId = req.student._id;

    if (!topic || !date || !groupId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide session details: topic (or title), date, and groupId.'
      });
    }

    SessionScheduler.validateSessionTiming(date, time);

    const group = await Group.findById(groupId).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ success: false, message: 'Target study group not found.' });
    }

    if (!req.oopUser.canCreateSession(group)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: You must be a member of this group to schedule a study session.'
      });
    }

    const session = await Session.create({
      topic: topic.trim(),
      date: new Date(date),
      time: time.trim(),
      groupId,
      createdBy: studentId
    });

    await session.populate('groupId', 'groupName subject');

    const memberIds = (group.members || []).map(m => m._id);
    const notifications = memberIds.map(mId => ({
      studentId: mId,
      sessionId: session._id,
      title: 'New Study Session Scheduled',
      message: `📅 New session scheduled in "${group.groupName}": "${session.topic}" on ${SessionScheduler.formatDisplay(date, time)}.`,
      type: 'SESSION',
      read: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return res.status(201).json({
      success: true,
      message: 'Study session created successfully!',
      session
    });
  } catch (error) {
    next(error);
  }
};

const getSessions = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    const userGroups = await Group.find({ members: studentId }).select('_id');
    const groupIds = userGroups.map(g => g._id);

    // Fetch all sessions belonging to student's groups
    const allSessions = await Session.find({ groupId: { $in: groupIds } })
      .populate('groupId', 'groupName subject')
      .populate('createdBy', 'name email');

    const expiredIds = [];
    const upcomingSessions = [];

    // Automatically detect and clear sessions after their date and time
    for (const s of allSessions) {
      if (SessionScheduler.isSessionExpired(s)) {
        expiredIds.push(s._id);
      } else {
        upcomingSessions.push(s);
      }
    }

    if (expiredIds.length > 0) {
      await Session.deleteMany({ _id: { $in: expiredIds } });
      console.log(`[Auto-Clean] Successfully cleared ${expiredIds.length} expired study session(s) after their date & time.`);
    }

    // Sort upcoming sessions chronologically
    upcomingSessions.sort((a, b) => {
      const tA = SessionScheduler.parseSessionDateTime(a.date, a.time)?.getTime() || 0;
      const tB = SessionScheduler.parseSessionDateTime(b.date, b.time)?.getTime() || 0;
      return tA - tB;
    });

    return res.status(200).json({
      success: true,
      count: upcomingSessions.length,
      clearedExpiredCount: expiredIds.length,
      sessions: upcomingSessions
    });
  } catch (error) {
    next(error);
  }
};

const clearExpiredSessions = async (req, res, next) => {
  try {
    const allSessions = await Session.find({});
    const expiredIds = allSessions
      .filter(s => SessionScheduler.isSessionExpired(s))
      .map(s => s._id);

    if (expiredIds.length > 0) {
      await Session.deleteMany({ _id: { $in: expiredIds } });
    }

    const remainingSessions = await Session.find({});
    const activeSessionIds = new Set(remainingSessions.map(s => String(s._id)));

    // Purge ended session reminders and notifications
    const sessionNotifs = await Notification.find({
      type: { $in: ['SESSION', 'SESSION_REMINDER'] }
    });
    const expiredNotifIds = sessionNotifs
      .filter(n => SessionScheduler.isNotificationExpired(n, activeSessionIds))
      .map(n => n._id);

    if (expiredNotifIds.length > 0) {
      await Notification.deleteMany({ _id: { $in: expiredNotifIds } });
    }

    return res.status(200).json({
      success: true,
      message: `Cleared ${expiredIds.length} expired session(s) and ${expiredNotifIds.length} ended session reminder(s).`,
      clearedSessionsCount: expiredIds.length,
      clearedRemindersCount: expiredNotifIds.length
    });
  } catch (error) {
    next(error);
  }
};

// Background recurring task: Automatically clears expired sessions and ended reminders from MongoDB
const runExpiredSessionsCleaner = async () => {
  try {
    const allSessions = await Session.find({});
    const expiredIds = allSessions
      .filter(s => SessionScheduler.isSessionExpired(s))
      .map(s => s._id);

    if (expiredIds.length > 0) {
      await Session.deleteMany({ _id: { $in: expiredIds } });
      console.log(`[Scheduled Cleaner] Automatically purged ${expiredIds.length} expired study session(s) past date & time.`);
    }

    const remainingSessions = await Session.find({});
    const activeSessionIds = new Set(remainingSessions.map(s => String(s._id)));

    // Clear ended session reminders and session notifications
    const sessionNotifs = await Notification.find({
      type: { $in: ['SESSION', 'SESSION_REMINDER'] }
    });
    const expiredNotifIds = sessionNotifs
      .filter(n => SessionScheduler.isNotificationExpired(n, activeSessionIds))
      .map(n => n._id);

    if (expiredNotifIds.length > 0) {
      await Notification.deleteMany({ _id: { $in: expiredNotifIds } });
      console.log(`[Scheduled Cleaner] Automatically purged ${expiredNotifIds.length} ended session reminder(s)/notification(s).`);
    }
  } catch (err) {
    console.error('[Scheduled Cleaner Error]', err.message);
  }
};

if (mongoose.connection.readyState === 1) {
  runExpiredSessionsCleaner();
} else {
  mongoose.connection.once('open', runExpiredSessionsCleaner);
}
setInterval(runExpiredSessionsCleaner, 2 * 60 * 1000);

// --- 5.5 Notifications Controllers ---
const getNotifications = async (req, res, next) => {
  try {
    const student = req.student;
    const studentId = student._id;

    // Automatic Session Reminder Trigger within next 48 hours
    try {
      const userGroups = await Group.find({ members: studentId }).select('_id groupName');
      const groupIds = userGroups.map(g => g._id);

      if (groupIds.length > 0) {
        const now = new Date();
        const twoDaysLater = new Date(Date.now() + 48 * 60 * 60 * 1000);

        const upcomingSessions = await Session.find({
          groupId: { $in: groupIds },
          date: { $gte: new Date(now.setHours(0, 0, 0, 0)), $lte: twoDaysLater }
        }).populate('groupId', 'groupName');

        for (const sess of upcomingSessions) {
          // Never create reminders for sessions that have already ended
          if (SessionScheduler.isSessionExpired(sess)) continue;

          const sessDateStr = new Date(sess.date).toLocaleDateString();
          const existingReminder = await Notification.findOne({
            studentId,
            type: 'SESSION_REMINDER',
            message: { $regex: sess.topic, $options: 'i' }
          });

          if (!existingReminder) {
            await Notification.create({
              studentId,
              sessionId: sess._id,
              title: 'Upcoming Session Reminder',
              message: `⏰ Reminder: Study session on "${sess.topic}" (${sess.groupId?.groupName || 'Group'}) is scheduled for ${sessDateStr} at ${sess.time}.`,
              type: 'SESSION_REMINDER',
              read: false
            });
          }
        }
      }
    } catch (err) {
      console.warn('Session reminder check notice:', err.message);
    }

    // Proactively purge ended session reminders for this student before returning list
    try {
      const activeSessions = await Session.find({});
      const activeSessionIds = new Set(activeSessions.map(s => String(s._id)));
      const studentSessionNotifs = await Notification.find({
        studentId,
        type: { $in: ['SESSION', 'SESSION_REMINDER'] }
      });
      const expiredNotifIds = studentSessionNotifs
        .filter(n => SessionScheduler.isNotificationExpired(n, activeSessionIds))
        .map(n => n._id);

      if (expiredNotifIds.length > 0) {
        await Notification.deleteMany({ _id: { $in: expiredNotifIds } });
      }
    } catch (purgeErr) {
      console.warn('Purge notice in getNotifications:', purgeErr.message);
    }

    const notifications = await Notification.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(60);

    const unreadCount = notifications.filter(n => !n.read).length;
    const stats = {
      groupUpdates: notifications.filter(n => ['GROUP_UPDATE', 'JOIN_REQUEST'].includes(n.type)).length,
      sessions: notifications.filter(n => ['SESSION', 'SESSION_REMINDER'].includes(n.type)).length,
      partnerMatches: notifications.filter(n => ['PARTNER_MATCH', 'INVITATION'].includes(n.type)).length,
      memberJoined: notifications.filter(n => ['MEMBER_JOINED', 'JOIN'].includes(n.type)).length
    };

    return res.status(200).json({
      success: true,
      unreadCount,
      stats,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.student._id;

    if (id === 'all') {
      await Notification.updateMany({ studentId }, { read: true });
      return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    }

    const notification = await Notification.findOne({ _id: id, studentId });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

const clearNotifications = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    await Notification.deleteMany({ studentId });
    return res.status(200).json({ success: true, message: 'All notifications cleared.' });
  } catch (error) {
    next(error);
  }
};

// --- 5.6 Recommended Peers & Invitations Controllers ---
const getRecommendedStudents = async (req, res, next) => {
  try {
    const currentStudent = req.student;
    const otherStudents = await Student.find({ _id: { $ne: currentStudent._id } })
      .select('-password')
      .sort({ createdAt: -1 });

    const currentAcademic = Array.from(new Set([
      ...(currentStudent.academicInterests || []),
      ...(currentStudent.subjects || [])
    ])).map(s => s.toLowerCase().trim());

    const scoredStudents = otherStudents.map(peer => {
      const pObj = peer.toObject();
      const matchScore = GroupManager.calculatePeerMatch(currentStudent, pObj);

      const peerAcademic = Array.from(new Set([
        ...(pObj.academicInterests || []),
        ...(pObj.subjects || [])
      ]));

      const commonInterests = peerAcademic.filter(subj => 
        currentAcademic.includes(subj.toLowerCase().trim())
      );

      return {
        id: pObj._id,
        _id: pObj._id,
        name: pObj.name,
        email: pObj.email,
        department: pObj.department || 'Computer Science & Engineering',
        year: pObj.year || '2nd Year',
        semester: pObj.semester || 'S3',
        academicInterests: peerAcademic,
        personalInterests: pObj.personalInterests || pObj.interests || [],
        learningPreferences: pObj.learningPreferences || (pObj.learningPreference ? [pObj.learningPreference] : []),
        availability: pObj.availability || 'Evenings 6 PM - 9 PM',
        matchScore,
        commonInterests
      };
    });

    scoredStudents.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      count: scoredStudents.length,
      students: scoredStudents,
      recommendations: scoredStudents
    });
  } catch (error) {
    next(error);
  }
};

const sendStudyInvitation = async (req, res, next) => {
  try {
    const { recipientId, groupId, customMessage } = req.body;
    const sender = req.student;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient student ID is required.' });
    }

    const recipient = await Student.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient student account not found.' });
    }

    let notificationText = '';
    if (groupId) {
      const group = await Group.findById(groupId);
      if (group) {
        notificationText = `📩 ${sender.name} (${sender.department}, ${sender.semester}) invited you to join study group "${group.groupName}" for ${group.subject}!`;
      }
    }

    if (!notificationText) {
      notificationText = `👋 ${sender.name} (${sender.department}, ${sender.semester}) sent you a study partner connection invitation!`;
    }

    if (customMessage && customMessage.trim()) {
      notificationText += ` Note: "${customMessage.trim()}"`;
    }

    const notification = await Notification.create({
      studentId: recipient._id,
      title: 'Study Partner Invitation',
      message: notificationText,
      type: 'INVITATION',
      read: false
    });

    return res.status(200).json({
      success: true,
      message: `Invitation successfully sent to ${recipient.name}!`,
      notification
    });
  } catch (error) {
    next(error);
  }
};

// --- 5.7 Chat Controllers (Peer-to-Peer & Group Chats with Attachments) ---
const formatPreviewText = (msg) => {
  if (!msg) return '';
  if (msg.message && msg.message.trim()) {
    return msg.attachment?.name ? `${msg.message} (📎 ${msg.attachment.name})` : msg.message;
  }
  if (msg.attachment?.name) {
    return `📎 ${msg.attachment.name}`;
  }
  return '';
};

const getConversations = async (req, res, next) => {
  try {
    const studentId = req.student._id;

    // 1. Group Conversations
    const myGroups = await Group.find({ members: studentId })
      .select('groupName subject department semester members maxMembers')
      .lean();

    const groupConversations = await Promise.all(
      myGroups.map(async (grp) => {
        const lastMsg = await Message.findOne({
          chatType: 'GROUP',
          groupId: grp._id
        })
          .sort({ createdAt: -1 })
          .populate('sender', 'name')
          .lean();

        const previewText = lastMsg ? formatPreviewText(lastMsg) : '';
        const msgTime = lastMsg ? lastMsg.createdAt : null;

        return {
          id: grp._id,
          _id: grp._id,
          chatType: 'GROUP',
          title: grp.groupName,
          name: grp.groupName,
          subtitle: `${grp.subject} • ${grp.semester}`,
          department: grp.department,
          membersCount: (grp.members || []).length,
          lastMessage: previewText,
          lastMessageText: previewText,
          lastMessageTime: msgTime,
          lastMessageDetails: lastMsg
            ? {
                text: previewText,
                senderName: lastMsg.sender?.name || 'Member',
                createdAt: msgTime
              }
            : null
        };
      })
    );

    // 2. Personal Conversations
    const personalMessages = await Message.find({
      chatType: 'PERSONAL',
      $or: [{ sender: studentId }, { recipient: studentId }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name department semester')
      .populate('recipient', 'name department semester')
      .lean();

    const partnerMap = new Map();

    for (const msg of personalMessages) {
      if (!msg.sender || !msg.recipient) continue;
      const senderIdStr = (msg.sender._id || msg.sender).toString();
      const isSender = senderIdStr === studentId.toString();
      const partner = isSender ? msg.recipient : msg.sender;
      if (!partner || !partner._id) continue;
      const partnerIdStr = (partner._id || partner).toString();

      if (!partnerMap.has(partnerIdStr)) {
        const previewText = formatPreviewText(msg);
        partnerMap.set(partnerIdStr, {
          id: partner._id,
          _id: partner._id,
          chatType: 'PERSONAL',
          title: partner.name || 'Classmate',
          name: partner.name || 'Classmate',
          subtitle: `${partner.department || 'Student'} • ${partner.semester || 'S3'}`,
          department: partner.department || 'Student',
          semester: partner.semester || 'S3',
          lastMessage: previewText,
          lastMessageText: previewText,
          lastMessageTime: msg.createdAt,
          lastMessageDetails: {
            text: previewText,
            senderName: msg.sender?.name || 'Student',
            createdAt: msg.createdAt,
            isMine: isSender
          }
        });
      }
    }

    // 3. Recommended Peers
    const otherStudents = await Student.find({ _id: { $ne: studentId } })
      .select('name department semester academicInterests')
      .limit(10)
      .lean();

    const availablePeers = otherStudents.map((s) => ({
      id: s._id,
      _id: s._id,
      name: s.name,
      department: s.department,
      semester: s.semester,
      academicInterests: s.academicInterests || [],
      hasChatted: partnerMap.has(s._id.toString())
    }));

    const personalConversations = Array.from(partnerMap.values());

    return res.status(200).json({
      success: true,
      personalConversations,
      personalChats: personalConversations,
      groupConversations,
      groupChats: groupConversations,
      availablePeers
    });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const studentId = req.student._id;
    let { chatType, targetId, recipientId, groupId } = req.query;
    targetId = targetId || recipientId || groupId;
    chatType = (chatType || (groupId ? 'GROUP' : 'PERSONAL')).toUpperCase();

    if (!targetId || targetId === 'undefined' || targetId === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter targetId (or recipientId/groupId) is required.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid target identifier: "${targetId}".`
      });
    }

    let filter = {};
    let targetDetails = null;

    if (chatType === 'GROUP') {
      const group = await Group.findById(targetId).select('groupName subject department semester members');
      if (!group) {
        return res.status(404).json({ success: false, message: 'Study group not found.' });
      }

      const isMember = (group.members || []).some((mId) => {
        const idStr = mId._id ? mId._id.toString() : mId.toString();
        return idStr === studentId.toString();
      });
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You must be an enrolled member of this study group to view its chat messages.'
        });
      }

      filter = { chatType: 'GROUP', groupId: targetId };
      targetDetails = {
        id: group._id,
        _id: group._id,
        chatType: 'GROUP',
        title: group.groupName,
        name: group.groupName,
        subtitle: `${group.subject} • ${group.semester}`,
        department: group.department,
        membersCount: group.members.length
      };
    } else {
      const partner = await Student.findById(targetId).select('name department semester email');
      if (!partner) {
        return res.status(404).json({ success: false, message: 'Recipient student not found.' });
      }

      filter = {
        chatType: 'PERSONAL',
        $or: [
          { sender: studentId, recipient: targetId },
          { sender: targetId, recipient: studentId }
        ]
      };
      targetDetails = {
        id: partner._id,
        _id: partner._id,
        chatType: 'PERSONAL',
        title: partner.name,
        name: partner.name,
        subtitle: `${partner.department || 'Student'} • ${partner.semester || 'S3'}`,
        department: partner.department,
        semester: partner.semester
      };
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: 1 })
      .populate('sender', 'name department semester')
      .lean();

    const formattedMessages = messages.map((m) =>
      ChatManager.formatMessageForClient(m, studentId)
    );

    return res.status(200).json({
      success: true,
      targetDetails,
      count: formattedMessages.length,
      messages: formattedMessages
    });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const student = req.student;
    let { chatType, targetId, recipientId, groupId, message, text, attachment } = req.body;
    targetId = targetId || recipientId || groupId;
    message = (message !== undefined ? message : text) || '';
    chatType = (chatType || (groupId ? 'GROUP' : 'PERSONAL')).toUpperCase();

    if (!targetId || targetId === 'undefined' || targetId === 'null') {
      return res.status(400).json({
        success: false,
        message: 'targetId (or recipientId/groupId) is required to send a message.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid target identifier: "${targetId}".`
      });
    }

    const handler = ChatManager.getHandler(chatType, student._id, student.name);

    let preparedPayload;
    if (chatType === 'GROUP') {
      preparedPayload = await handler.authorizeAndPrepare(targetId, message, attachment, Group);
    } else {
      preparedPayload = await handler.authorizeAndPrepare(targetId, message, attachment, Student);
    }

    const savedMsg = await Message.create({
      chatType: preparedPayload.chatType,
      sender: preparedPayload.sender,
      recipient: preparedPayload.recipient || null,
      groupId: preparedPayload.groupId || null,
      message: preparedPayload.message || '',
      attachment: preparedPayload.attachment || null
    });

    await savedMsg.populate('sender', 'name department semester');

    if (chatType === 'PERSONAL' && preparedPayload.recipient) {
      try {
        let preview = preparedPayload.message || '';
        if (!preview && preparedPayload.attachment?.name) {
          preview = `📎 Attachment: ${preparedPayload.attachment.name}`;
        } else if (preparedPayload.attachment?.name) {
          preview = `${preview} (📎 ${preparedPayload.attachment.name})`;
        }
        if (preview.length > 60) preview = `${preview.substring(0, 60)}...`;

        await Notification.create({
          studentId: preparedPayload.recipient,
          title: `New Message from ${student.name}`,
          message: `💬 ${student.name}: "${preview}"`,
          type: 'PARTNER_MATCH',
          read: false
        });
      } catch (notifErr) {
        console.warn('Chat notification notice:', notifErr.message);
      }
    }

    const formatted = ChatManager.formatMessageForClient(savedMsg, student._id);
    return res.status(201).json({
      success: true,
      message: formatted
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 6. EXPRESS APPLICATION & ROUTE DEFINITIONS
// ============================================================================
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with 15MB limit to support chat attachments (PDFs, notes, images)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// --- Direct Root Routes (as specified in academic requirements) ---
app.post('/register', registerStudent);
app.post('/login', loginStudent);

app.get('/profile', protect, getProfile);
app.put('/profile', protect, updateProfile);

app.get('/groups', optionalAuth, getGroups);
app.get('/groups/:groupId/members', protect, getGroupMembers);
app.post('/groups', protect, createGroup);
app.post('/groups/join', protect, joinGroup);
app.post('/groups/leave', protect, leaveGroup);
app.get('/my-groups', protect, getMyGroups);

app.post('/session/create', protect, createSession);
app.get('/sessions', protect, getSessions);
app.delete('/sessions/expired', protect, clearExpiredSessions);

app.get('/notifications', protect, getNotifications);
app.put('/notifications/:id/read', protect, markAsRead);
app.delete('/notifications/clear', protect, clearNotifications);

app.get('/students/recommended', protect, getRecommendedStudents);
app.post('/students/invite', protect, sendStudyInvitation);

app.get('/chats/conversations', protect, getConversations);
app.get('/chats/messages', protect, getMessages);
app.post('/chats/messages', protect, sendMessage);

// --- Standard API Prefixed Routes (full backwards compatibility) ---
app.post('/api/auth/register', registerStudent);
app.post('/api/auth/login', loginStudent);

app.get('/api/profile', protect, getProfile);
app.put('/api/profile', protect, updateProfile);

app.get('/api/groups', optionalAuth, getGroups);
app.get('/api/groups/:groupId/members', protect, getGroupMembers);
app.post('/api/groups', protect, createGroup);
app.post('/api/groups/join', protect, joinGroup);
app.post('/api/groups/leave', protect, leaveGroup);
app.get('/api/my-groups', protect, getMyGroups);

app.post('/api/sessions', protect, createSession);
app.post('/api/sessions/create', protect, createSession);
app.get('/api/sessions', protect, getSessions);
app.delete('/api/sessions/expired', protect, clearExpiredSessions);

app.get('/api/notifications', protect, getNotifications);
app.put('/api/notifications/:id/read', protect, markAsRead);
app.delete('/api/notifications/clear', protect, clearNotifications);

app.get('/api/students/recommended', protect, getRecommendedStudents);
app.post('/api/students/invite', protect, sendStudyInvitation);

app.get('/api/chats/conversations', protect, getConversations);
app.get('/api/chats/messages', protect, getMessages);
app.post('/api/chats/messages', protect, sendMessage);

// System Health and OOP Metrics Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'PeerConnect Study Group Management Engine',
    project: 'B.Tech S3 OOP Project • Group 1',
    credits: [
      { name: 'HIMASANKAR V', contribution: 'Project Integration & Full Stack Development' },
      { name: 'AAKIFA SHERIN', contribution: 'MongoDB Database Design' },
      { name: 'GOURI S UNNI', contribution: 'Group Management System' },
      { name: 'GAYATHRI DAS R', contribution: 'Notification System & Testing' },
      { name: 'AALIYA NOUSHAD', contribution: 'User Interface Design & Documentation' }
    ],
    oopArchitecture: {
      abstraction: 'Abstract User Base Class',
      inheritance: 'StudentUser & AdminUser extend User',
      encapsulation: 'Private ES6 fields with domain validation',
      polymorphism: 'Dynamic dashboard metrics & session scheduling rules'
    },
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static build if present
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendBuildPath));

// Centralized Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` PeerConnect Backend Server running on port: ${PORT}`);
  console.log(` OOP Model: Abstraction | Inheritance | Encapsulation | Polymorphism`);
  console.log(` MongoDB Atlas Endpoint: ${process.env.MONGODB_URI ? 'Configured' : 'Using Local/Fallback'}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

module.exports = app;
