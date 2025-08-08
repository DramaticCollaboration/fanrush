export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
}

export interface TabItem {
  name: string;
  path: string;
  content?: string;
}



export interface BuildStatus {
  id: string;
  projectId: string;
  status: 'queued' | 'running' | 'success' | 'failed';
  logs: string[];
  startTime: string;
  endTime?: string;
  deploymentUrl?: string;
  tlsStatus?: 'pending' | 'active' | 'failed';
  errorMessage?: string;
  previewImageUrl?: string;
}

export interface ShareTarget {
  platform: 'twitter' | 'facebook' | 'kkumz';
  url: string;
}



export type UserRole = 'owner' | 'editor' | 'viewer';

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  joinedAt: string;
}

export interface ProjectScreen {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

export interface ProjectIssue {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'closed';
  assignee?: TeamMember;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id?: string;
  name: string;
  summary: string;
  description: string; // HTML 문자열
  specification: string;
  screens: ProjectScreen[];
  team: TeamMember[];
  chat: ChatMessage[];
  issues: ProjectIssue[];
}


export interface ProjectInvitation {
  id: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface ProjectActivity {
  id: string;
  type: 'member_joined' | 'issue_created' | 'issue_closed' | 'screen_added';
  description: string;
  timestamp: string;
  user: TeamMember;
}




export interface FeedItem {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  thumbnail: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  tags: string[];
  isPublic: boolean;
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

export type FeedType = 'all' | 'following' | 'trending';




export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  bio: string;
  createdAt: string;
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  push: boolean;
  projectUpdates: boolean;
  teamInvites: boolean;
  comments: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  expiry?: string;
  isDefault: boolean;
}

export interface ActivityLog {
  id: string;
  type: 'project_create' | 'project_update' | 'team_join' | 'comment' | 'like';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}



export interface Report {
  id: string;
  type: 'post' | 'project' | 'comment' | 'user';
  targetId: string;
  reporterId: string;
  reason: string;
  description: string;
  status: 'pending' | 'in_review' | 'resolved' | 'dismissed';
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  violationType?: 'inappropriate' | 'copyright' | 'illegal' | 'spam';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator';
  avatar: string;
  lastActive: string;
}

export interface ContentFilterRule {
  id: string;
  type: 'keyword' | 'regex' | 'ai';
  pattern: string;
  action: 'flag' | 'block' | 'delete';
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface UserViolation {
  id: string;
  userId: string;
  type: 'inappropriate' | 'copyright' | 'illegal' | 'spam';
  count: number;
  lastViolation: string;
  status: 'warning' | 'temporary_ban' | 'permanent_ban';
}
