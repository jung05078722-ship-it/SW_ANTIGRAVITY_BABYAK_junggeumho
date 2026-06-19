// ==========================================================================
// main.js - Core Routing & Application Bootstrapper
// ==========================================================================

import * as db from './src/state.js';
import * as views from './src/views.js';

// Global router state
let currentView = 'splash';
let currentParams = {};

const appContainer = document.getElementById('app');
const bottomNav = document.getElementById('bottom-nav');

// Router navigation function
export function navigate(viewName, params = {}) {
  currentView = viewName;
  currentParams = params;
  
  // Clean up any view transition indicators
  appContainer.className = 'app-content animate-fade-in';
  
  // Determine Bottom Navigation visibility
  // Hide bottom nav for splash, auth, create-post, post-detail, and chat-room for native feel
  const hideNavViews = ['splash', 'auth', 'create-post', 'detail', 'chat-room'];
  if (hideNavViews.includes(viewName)) {
    bottomNav.classList.add('hidden');
    appContainer.classList.add('no-nav');
  } else {
    bottomNav.classList.remove('hidden');
    appContainer.classList.remove('no-nav');
    
    // Highlight correct bottom nav item
    bottomNav.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
  
  // Render View
  switch (viewName) {
    case 'splash':
      views.renderSplash(appContainer, () => {
        // Post splash: check if user is already logged in
        const user = db.getCurrentUser();
        if (user) {
          navigate('feed');
        } else {
          navigate('auth');
        }
      });
      break;
      
    case 'auth':
      views.renderAuth(appContainer, () => {
        navigate('feed');
      });
      break;
      
    case 'feed':
      views.renderFeed(appContainer, navigate);
      break;
      
    case 'create-post':
      views.renderCreatePost(appContainer, navigate);
      break;
      
    case 'detail':
      views.renderPostDetail(appContainer, params.postId, navigate);
      break;
      
    case 'notifications':
      views.renderNotifications(appContainer, navigate);
      break;
      
    case 'chats':
      views.renderChats(appContainer, navigate);
      break;
      
    case 'chat-room':
      views.renderChatRoom(appContainer, params.chatId, navigate);
      break;
      
    case 'mypage':
      views.renderMyPage(appContainer, navigate, () => {
        // Trigger full navigation refresh on user switch to update active states
        navigate('mypage');
      });
      break;
      
    default:
      console.error(`Unknown view: ${viewName}`);
      navigate('feed');
  }
  
  // Global badge sync
  views.updateGlobalBadges();
}

// Bottom Nav Actions Setup
bottomNav.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const target = item.getAttribute('data-view');
    navigate(target);
  });
});

// Mock clock updates for phone simulation status bar
function updatePhoneClock() {
  const timeSpan = document.querySelector('.status-time');
  if (!timeSpan) return;
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  timeSpan.textContent = `${hours}:${minutes}`;
}

// Bootstrapping
document.addEventListener('DOMContentLoaded', () => {
  // Init data layer
  db.initializeState();
  
  // Start clock loop
  updatePhoneClock();
  setInterval(updatePhoneClock, 1000);
  
  // Route to intro splash
  navigate('splash');
});
