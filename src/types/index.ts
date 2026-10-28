export type TaskCategory = 
  | 'all'
  | 'excel'
  | 'translate'
  | 'design'
  | 'coding'
  | 'errand'
  | 'store';

export type TaskStatus = 'open' | 'matched' | 'in_progress' | 'submitted' | 'completed';

export type DeliveryMethod = 'online' | 'campus_pickup';

export interface Review {
  id: string;
  fromUserName: string;
  rating: number; // 1 to 5
  comment: string;
  badges: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  categoryLabel: string;
  reward: number; // in KRW (e.g. 10000)
  platformFee: number; // e.g. 800
  isUrgent: boolean; // "급구 상단 고정" (+1,000원)
  deadline: string; // e.g. "오늘 21:00" or "30분 이내"
  deadlineTimestamp: number;
  deliveryMethod: DeliveryMethod;
  locationDetails?: string; // e.g. "중앙도서관 1층 -> 4층"
  status: TaskStatus;
  
  // Requester Info
  requesterId: string;
  requesterName: string;
  requesterCampus: string; // e.g. "숭실대 경제학과"
  requesterMannerTemp: number; // e.g. 37.8
  
  // Performer Info (if matched)
  performerId?: string;
  performerName?: string;
  performerCampus?: string;
  performerMannerTemp?: number;
  
  // Submission
  submissionContent?: string;
  submittedAt?: string;
  
  createdAt: string;
  reviews?: Review[];
}

export interface ChatMessage {
  id: string;
  taskId: string;
  senderId: string;
  senderName: string;
  senderRole: 'requester' | 'performer' | 'system';
  text: string;
  timestamp: string;
  fileAttachment?: {
    name: string;
    size: string;
    url?: string;
  };
}

export interface CurrentUser {
  id: string;
  name: string;
  campus: string;
  department: string;
  studentIdPrefix: string; // "22학번"
  isVerified: boolean;
  mannerTemp: number;
  role: 'requester' | 'performer';
  balance: number; // KRW
  completedTasksCount: number;
  freeCouponAvailable: boolean; // 첫 의뢰 무료 (수수료 800원 할인)
}

export interface LeanCanvasMetrics {
  weeklyRequests: number;
  weeklyGoal: number; // 30
  acceptanceRate: number; // %
  monthlyRetention: number; // %
  averageMatchTimeSeconds: number; // e.g. 252 (4분 12초)
  monthlyTransactions: number;
  bepMonthlyTarget: number; // 690
  fixedMonthlyCost: number; // 550,000 KRW
  feePerTransaction: number; // 800 KRW
}
