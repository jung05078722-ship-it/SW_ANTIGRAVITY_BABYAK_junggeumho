// ==========================================================================
// state.js - LocalStorage State Management & Mock Data Initializer
// ==========================================================================

const STATE_KEY = 'BABYAK_APP_STATE';

// Initial Mock Users
const MOCK_USERS = [
  {
    id: 'user_minsoo',
    nickname: '민수킴',
    email: 'minsoo@univ.ac.kr',
    dept: '컴퓨터공학과',
    grade: '2학년',
    tags: ['한식', '가성비', '빠른식사'],
    mannerScore: 38.5,
    avatar: 'M'
  },
  {
    id: 'user_yoonji',
    nickname: '윤지츄',
    email: 'yoonji@univ.ac.kr',
    dept: '경영학과',
    grade: '1학년',
    tags: ['일식', '수다왕', '디저트'],
    mannerScore: 36.5,
    avatar: 'Y'
  },
  {
    id: 'user_jihoon',
    nickname: '지훈보이',
    email: 'jihoon@univ.ac.kr',
    dept: '음악학과',
    grade: '3학년',
    tags: ['양식', '마라탕', '맛집탐방'],
    mannerScore: 41.2,
    avatar: 'J'
  }
];

// Initial Mock Posts
const getMockPosts = (users) => [
  {
    id: 'post_1',
    title: '오늘 점심 학식 같이 먹을 분!',
    menu: '제육볶음',
    dateTime: '2026-06-20T12:30',
    location: '학생식당',
    capacity: 3,
    joinedCount: 1,
    genderCondition: '무관',
    status: 'recruiting',
    authorId: 'user_yoonji',
    participantIds: ['user_yoonji'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'post_2',
    title: '신촌 마라탕 팟 구합니다 (혼밥 탈출)',
    menu: '마라탕',
    dateTime: '2026-06-21T18:00',
    location: '대학가 마라탕집',
    capacity: 4,
    joinedCount: 2,
    genderCondition: '동성만',
    status: 'recruiting',
    authorId: 'user_jihoon',
    participantIds: ['user_jihoon', 'user_minsoo'], // Minsoo already joined
    createdAt: new Date().toISOString()
  }
];

// Initial Mock Chats
const getMockChats = () => [
  {
    id: 'post_2', // Chat rooms map 1:1 with postIds
    postId: 'post_2',
    participantIds: ['user_jihoon', 'user_minsoo'],
    ended: false,
    messages: [
      {
        id: 'msg_1',
        senderId: 'system',
        senderName: '시스템',
        content: '밥약 매칭이 성사되어 채팅방이 개설되었습니다!',
        timestamp: '2026-06-19T20:00:00Z',
        isSystem: true
      },
      {
        id: 'msg_2',
        senderId: 'user_jihoon',
        senderName: '지훈보이',
        content: '안녕하세요! 마라탕 매운 단계 몇단계 드시나요?',
        timestamp: '2026-06-19T20:02:00Z',
        isSystem: false
      },
      {
        id: 'msg_3',
        senderId: 'user_minsoo',
        senderName: '민수킴',
        content: '안녕하세요~ 전 보통 2단계 먹어요 ㅎㅎ!',
        timestamp: '2026-06-19T20:05:00Z',
        isSystem: false
      }
    ]
  }
];

// Initial Mock Applications
const getMockApplications = () => [
  {
    id: 'app_1',
    postId: 'post_1',
    applicantId: 'user_minsoo',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

// Initialize State Object
let state = {
  users: [...MOCK_USERS],
  posts: [],
  applications: [],
  chats: [],
  currentUser: null // Will be set to one of the users or null
};

// Load state from localStorage or initialize with mocks
export function initializeState() {
  const savedState = localStorage.getItem(STATE_KEY);
  if (savedState) {
    try {
      state = JSON.parse(savedState);
      // Ensure users are present
      if (!state.users || state.users.length === 0) {
        state.users = [...MOCK_USERS];
      }
    } catch (e) {
      console.error("Failed to parse local storage state, resetting.", e);
      resetState();
    }
  } else {
    resetState();
  }
  return state;
}

function resetState() {
  state.users = [...MOCK_USERS];
  state.posts = getMockPosts(state.users);
  state.applications = getMockApplications();
  state.chats = getMockChats();
  state.currentUser = state.users[0]; // Default to Minsoo
  saveState();
}

export function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

// User Helpers
export function getCurrentUser() {
  return state.currentUser;
}

export function setCurrentUser(userId) {
  const user = state.users.find(u => u.id === userId);
  if (user) {
    state.currentUser = user;
    saveState();
    return user;
  }
  return null;
}

export function registerUser(userData) {
  const newId = 'user_' + Date.now();
  const newUser = {
    id: newId,
    nickname: userData.nickname,
    email: userData.email,
    dept: userData.dept,
    grade: userData.grade,
    tags: userData.tags || [],
    mannerScore: 36.5,
    avatar: userData.nickname.charAt(0).toUpperCase()
  };
  state.users.push(newUser);
  state.currentUser = newUser;
  saveState();
  return newUser;
}

export function getUsers() {
  return state.users;
}

export function getUser(userId) {
  return state.users.find(u => u.id === userId);
}

// Post Helpers
export function getPosts() {
  return state.posts;
}

export function getPost(postId) {
  return state.posts.find(p => p.id === postId);
}

export function createPost(postData) {
  const newPost = {
    id: 'post_' + Date.now(),
    title: postData.title,
    menu: postData.menu,
    dateTime: postData.dateTime,
    location: postData.location,
    capacity: parseInt(postData.capacity, 10),
    joinedCount: 1,
    genderCondition: postData.genderCondition,
    status: 'recruiting',
    authorId: state.currentUser.id,
    participantIds: [state.currentUser.id],
    createdAt: new Date().toISOString()
  };
  
  state.posts.unshift(newPost);
  saveState();
  return newPost;
}

// Application Helpers
export function getApplications() {
  return state.applications;
}

export function applyToPost(postId) {
  const user = getCurrentUser();
  if (!user) return { success: false, message: '로그인이 필요합니다.' };
  
  const post = getPost(postId);
  if (!post) return { success: false, message: '글을 찾을 수 없습니다.' };
  
  if (post.authorId === user.id) {
    return { success: false, message: '본인이 쓴 글에는 신청할 수 없습니다.' };
  }
  
  if (post.participantIds.includes(user.id)) {
    return { success: false, message: '이미 참여 중인 밥약입니다.' };
  }
  
  // Check gender condition
  if (post.genderCondition === '동성만') {
    const author = getUser(post.authorId);
    // Rough gender check by avatar or simulation (just a mock rule: minsoo=M, yoonji=F, jihoon=M)
    const isMale = (u) => u.id === 'user_minsoo' || u.id === 'user_jihoon';
    if (isMale(author) !== isMale(user)) {
      return { success: false, message: '성별 조건(동성만)에 맞지 않습니다.' };
    }
  }

  // Check if already applied
  const existingApp = state.applications.find(
    a => a.postId === postId && a.applicantId === user.id
  );
  if (existingApp) {
    if (existingApp.status === 'pending') {
      return { success: false, message: '이미 수락 대기 중인 신청입니다.' };
    } else if (existingApp.status === 'accepted') {
      return { success: false, message: '이미 수락 완료되었습니다.' };
    } else {
      return { success: false, message: '이전에 거절된 밥약입니다.' };
    }
  }

  const newApp = {
    id: 'app_' + Date.now(),
    postId,
    applicantId: user.id,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  state.applications.push(newApp);
  saveState();
  return { success: true, application: newApp };
}

export function respondToApplication(appId, status) {
  const app = state.applications.find(a => a.id === appId);
  if (!app) return { success: false, message: '신청 내역을 찾을 수 없습니다.' };
  
  app.status = status;
  
  if (status === 'accepted') {
    const post = getPost(app.postId);
    if (post) {
      if (post.joinedCount >= post.capacity) {
        app.status = 'pending'; // revert
        return { success: false, message: '이미 모집 정원이 마감되었습니다.' };
      }
      
      post.participantIds.push(app.applicantId);
      post.joinedCount = post.participantIds.length;
      
      if (post.joinedCount >= post.capacity) {
        post.status = 'closed';
      }
      
      // Sync chat room participants
      let chat = state.chats.find(c => c.postId === post.id);
      if (!chat) {
        // Create new chat room
        chat = {
          id: post.id,
          postId: post.id,
          participantIds: [...post.participantIds],
          ended: false,
          messages: [
            {
              id: 'msg_sys_' + Date.now(),
              senderId: 'system',
              senderName: '시스템',
              content: '밥약 매칭이 성사되어 채팅방이 개설되었습니다!',
              timestamp: new Date().toISOString(),
              isSystem: true
            }
          ]
        };
        state.chats.push(chat);
      } else {
        chat.participantIds = [...post.participantIds];
        chat.messages.push({
          id: 'msg_sys_' + Date.now(),
          senderId: 'system',
          senderName: '시스템',
          content: `${getUser(app.applicantId).nickname}님이 합류하셨습니다.`,
          timestamp: new Date().toISOString(),
          isSystem: true
        });
      }
    }
  }
  
  saveState();
  return { success: true };
}

// Chat Helpers
export function getChats() {
  const user = getCurrentUser();
  if (!user) return [];
  // Return chats that the user is participating in
  return state.chats.filter(c => c.participantIds.includes(user.id));
}

export function getChat(chatId) {
  return state.chats.find(c => c.id === chatId);
}

export function sendChatMessage(chatId, content) {
  const user = getCurrentUser();
  if (!user) return null;
  
  const chat = getChat(chatId);
  if (!chat) return null;
  if (chat.ended) return null;

  const newMsg = {
    id: 'msg_' + Date.now(),
    senderId: user.id,
    senderName: user.nickname,
    content: content,
    timestamp: new Date().toISOString(),
    isSystem: false
  };

  chat.messages.push(newMsg);
  saveState();
  return newMsg;
}

export function endChatRoom(chatId) {
  const chat = getChat(chatId);
  if (!chat) return false;
  
  chat.ended = true;
  chat.messages.push({
    id: 'msg_sys_' + Date.now(),
    senderId: 'system',
    senderName: '시스템',
    content: '식사가 마쳐져 채팅방이 종료되었습니다. 멤버들의 리뷰를 남겨주세요!',
    timestamp: new Date().toISOString(),
    isSystem: true
  });
  
  // Set post status to closed just in case
  const post = getPost(chat.postId);
  if (post) {
    post.status = 'closed';
  }
  
  saveState();
  return true;
}

// Manner Score & Review
export function rateParticipant(postId, targetUserId, rating) {
  const targetUser = getUser(targetUserId);
  if (!targetUser) return false;
  
  // Rating translation to Karrot-style manner score adjustments
  // 5 stars -> +0.5, 4 stars -> +0.2, 3 stars -> 0, 2 stars -> -0.2, 1 star -> -0.5
  let diff = 0;
  if (rating === 5) diff = 0.5;
  else if (rating === 4) diff = 0.2;
  else if (rating === 3) diff = 0;
  else if (rating === 2) diff = -0.2;
  else if (rating === 1) diff = -0.5;
  
  targetUser.mannerScore = Math.max(0, Math.min(99.0, parseFloat((targetUser.mannerScore + diff).toFixed(1))));
  saveState();
  return true;
}

// Demoware reset
export function resetAppToDefault() {
  resetState();
  return state;
}
