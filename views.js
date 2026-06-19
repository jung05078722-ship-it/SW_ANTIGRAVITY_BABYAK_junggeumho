// ==========================================================================
// views.js - UI Rendering Engine for Babyak Mobile Web App
// ==========================================================================

import * as db from './state.js';

// Global toast helper
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'fa-check-circle';
  if (type === 'danger') icon = 'fa-exclamation-circle';
  if (type === 'warning') icon = 'fa-exclamation-triangle';
  
  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Fade out & remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, -20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Global modal helper
function showModal(contentHtml) {
  const modal = document.getElementById('modal-container');
  if (!modal) return;
  modal.innerHTML = contentHtml;
  modal.classList.remove('hidden');
}

function hideModal() {
  const modal = document.getElementById('modal-container');
  if (modal) {
    modal.classList.add('hidden');
    modal.innerHTML = '';
  }
}

// Format date into user-friendly text
function formatDateTime(dateTimeStr) {
  const d = new Date(dateTimeStr);
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  // Day of week
  const week = ['일', '월', '화', '수', '목', '금', '토'];
  const day = week[d.getDay()];
  
  // Check if today or tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  let prefix = `${month}/${date}(${day})`;
  if (d.toDateString() === today.toDateString()) {
    prefix = '오늘';
  } else if (d.toDateString() === tomorrow.toDateString()) {
    prefix = '내일';
  }
  
  return `${prefix} ${hours}:${minutes}`;
}

// Render User Avatar
function getAvatarHtml(user) {
  return `<div class="user-avatar" title="${user.nickname}">${user.avatar}</div>`;
}

/* ==========================================================================
   Splash Screen
   ========================================================================== */
export function renderSplash(container, onComplete) {
  container.innerHTML = `
    <div class="splash-screen animate-fade-in">
      <div class="splash-logo-container animate-pop-in">
        <div class="splash-logo-circle">
          <i class="fas fa-utensils"></i>
        </div>
        <h1 class="splash-title">밥약</h1>
        <p class="splash-subtitle">우리 학교 학생들과 안전하게<br>식사 밥친구를 매칭해보세요</p>
      </div>
      <div class="splash-footer">
        © 2026 밥약. All rights reserved.
      </div>
    </div>
  `;
  
  // Transition to next screen after 2.2s
  setTimeout(() => {
    onComplete();
  }, 2200);
}

/* ==========================================================================
   Sign-Up / Auth Flow
   ========================================================================== */
export function renderAuth(container, onComplete) {
  let step = 1;
  let email = '';
  let verificationCode = '1234'; // Simulated code
  let selectedTags = [];
  
  function updateView() {
    container.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'auth-screen animate-fade-in';
    
    if (step === 1) {
      wrapper.innerHTML = `
        <div class="auth-header">
          <h2 class="auth-title">학교 이메일 인증</h2>
          <p class="auth-desc">안전한 대학 매칭을 위해 학내 이메일(@*.ac.kr 또는 @*.edu)로 학생 인증을 진행합니다.</p>
        </div>
        <div class="form-group animate-slide-up">
          <label>이메일 주소</label>
          <input type="email" id="auth-email-input" class="input-field" placeholder="student@univ.ac.kr" value="${email}">
        </div>
        <div class="form-group" style="margin-top: auto;">
          <button id="auth-send-code" class="btn btn-primary">인증 코드 발송</button>
        </div>
      `;
      
      container.appendChild(wrapper);
      
      document.getElementById('auth-send-code').addEventListener('click', () => {
        const emailInput = document.getElementById('auth-email-input').value.trim();
        if (!emailInput) {
          showToast('이메일 주소를 입력해주세요.', 'danger');
          return;
        }
        
        // Validation check (ac.kr or edu suffix)
        if (!emailInput.endsWith('.ac.kr') && !emailInput.endsWith('.edu')) {
          showToast('대학 이메일(@.ac.kr 또는 @.edu)을 사용해야 신뢰성이 보장됩니다.', 'warning');
        }
        
        email = emailInput;
        // Generate random 4-digit code
        verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Show Toast showing code for local prototyping ease
        showToast(`인증코드가 발송되었습니다. [인증번호: ${verificationCode}]`, 'success');
        
        step = 2;
        updateView();
      });
      
    } else if (step === 2) {
      wrapper.innerHTML = `
        <div class="auth-header">
          <button id="auth-back-1" class="auth-back-btn"><i class="fas fa-arrow-left"></i></button>
          <h2 class="auth-title">인증번호 입력</h2>
          <p class="auth-desc"><strong>${email}</strong>주소로 발송된 4자리 인증번호를 입력해주세요.</p>
        </div>
        <div class="code-container animate-slide-up">
          <input type="text" maxlength="1" class="code-input" id="c1">
          <input type="text" maxlength="1" class="code-input" id="c2" disabled>
          <input type="text" maxlength="1" class="code-input" id="c3" disabled>
          <input type="text" maxlength="1" class="code-input" id="c4" disabled>
        </div>
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="font-size: 12px; color: var(--text-muted);">코드를 받지 못하셨나요?</span>
          <button id="resend-code-btn" style="border: none; background: none; color: var(--primary-color); font-size: 12px; font-weight: 700; cursor: pointer; margin-left: 4px;">재전송</button>
        </div>
        <div class="form-group" style="margin-top: auto;">
          <button id="auth-verify-code" class="btn btn-primary" disabled>인증 확인</button>
        </div>
      `;
      
      container.appendChild(wrapper);
      
      // Verification Code input behaviors
      const inputs = [
        document.getElementById('c1'),
        document.getElementById('c2'),
        document.getElementById('c3'),
        document.getElementById('c4')
      ];
      
      inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
          const val = e.target.value;
          if (val.length === 1 && index < 3) {
            inputs[index + 1].disabled = false;
            inputs[index + 1].focus();
          }
          
          // Enable/disable verify button
          const fullCode = inputs.map(i => i.value).join('');
          document.getElementById('auth-verify-code').disabled = (fullCode.length !== 4);
        });
        
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputs[index - 1].focus();
            inputs[index].disabled = true;
          }
        });
      });
      
      document.getElementById('auth-back-1').addEventListener('click', () => {
        step = 1;
        updateView();
      });
      
      document.getElementById('resend-code-btn').addEventListener('click', () => {
        verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
        showToast(`인증코드가 재발송되었습니다. [인증번호: ${verificationCode}]`, 'success');
      });
      
      document.getElementById('auth-verify-code').addEventListener('click', () => {
        const codeInputted = inputs.map(i => i.value).join('');
        if (codeInputted === verificationCode || codeInputted === '1234') { // Allow 1234 as fallback master code
          showToast('인증되었습니다!', 'success');
          step = 3;
          updateView();
        } else {
          showToast('인증 코드가 일치하지 않습니다.', 'danger');
          inputs.forEach(i => i.value = '');
          inputs[0].focus();
          inputs[1].disabled = true;
          inputs[2].disabled = true;
          inputs[3].disabled = true;
          document.getElementById('auth-verify-code').disabled = true;
        }
      });
      
    } else if (step === 3) {
      const foodTags = ['한식', '일식', '중식', '양식', '분식', '마라탕', '고기', '술', '디저트', '가성비', '빠른식사', '수다왕', '조용한식사'];
      
      wrapper.innerHTML = `
        <div class="auth-header">
          <h2 class="auth-title">프로필 설정</h2>
          <p class="auth-desc">식사 친구들이 볼 프로필 정보를 설정해주세요.</p>
        </div>
        <div class="form-group animate-slide-up">
          <label>닉네임</label>
          <input type="text" id="auth-nick" class="input-field" placeholder="밥약대장">
        </div>
        <div class="form-group animate-slide-up">
          <label>학과</label>
          <input type="text" id="auth-dept" class="input-field" placeholder="컴퓨터공학과">
        </div>
        <div class="form-group animate-slide-up">
          <label>학년</label>
          <select id="auth-grade" class="input-field">
            <option value="1학년">1학년 (새내기)</option>
            <option value="2학년">2학년</option>
            <option value="3학년">3학년</option>
            <option value="4학년">4학년</option>
            <option value="대학원생">대학원생</option>
          </select>
        </div>
        <div class="form-group animate-slide-up">
          <label class="tags-title">음식 및 식사 취향 태그 (최대 3개)</label>
          <div class="tags-grid">
            ${foodTags.map(tag => `
              <input type="checkbox" id="tag-${tag}" class="tag-checkbox" value="${tag}">
              <label for="tag-${tag}" class="tag-label">${tag}</label>
            `).join('')}
          </div>
        </div>
        <div class="form-group">
          <button id="auth-complete" class="btn btn-primary">가입 완료</button>
        </div>
      `;
      
      container.appendChild(wrapper);
      
      // Control checkbox tag limit
      const checkboxes = wrapper.querySelectorAll('.tag-checkbox');
      checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
          const checked = wrapper.querySelectorAll('.tag-checkbox:checked');
          if (checked.length > 3) {
            cb.checked = false;
            showToast('취향 태그는 최대 3개까지 선택 가능합니다.', 'warning');
          }
        });
      });
      
      document.getElementById('auth-complete').addEventListener('click', () => {
        const nickname = document.getElementById('auth-nick').value.trim();
        const dept = document.getElementById('auth-dept').value.trim();
        const grade = document.getElementById('auth-grade').value;
        const tags = Array.from(wrapper.querySelectorAll('.tag-checkbox:checked')).map(cb => cb.value);
        
        if (!nickname || !dept) {
          showToast('닉네임과 학과를 입력해 주세요.', 'danger');
          return;
        }
        
        db.registerUser({
          email,
          nickname,
          dept,
          grade,
          tags
        });
        
        showToast(`환영합니다, ${nickname}님!`, 'success');
        onComplete();
      });
    }
  }
  
  updateView();
}

/* ==========================================================================
   Screen 3: Feed View (Posts Listing)
   ========================================================================== */
export function renderFeed(container, navigate) {
  const currentUser = db.getCurrentUser();
  const posts = db.getPosts();
  
  // Read current filter state from temporary session variables or use default
  let selectedDate = 'all'; // 'all', 'today', 'tomorrow'
  let selectedTime = 'all'; // 'all', 'lunch', 'dinner'
  let selectedMenu = 'all'; // 'all', '한식', '일식', '중식', '양식', '분식', '기타'
  
  function getFilteredPosts() {
    return posts.filter(post => {
      // Date Filter
      if (selectedDate !== 'all') {
        const postDate = new Date(post.dateTime).toDateString();
        const today = new Date().toDateString();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toDateString();
        
        if (selectedDate === 'today' && postDate !== today) return false;
        if (selectedDate === 'tomorrow' && postDate !== tomorrowDate) return false;
      }
      
      // Time Filter
      if (selectedTime !== 'all') {
        const hour = new Date(post.dateTime).getHours();
        if (selectedTime === 'lunch' && (hour < 11 || hour > 15)) return false;
        if (selectedTime === 'dinner' && (hour < 17 || hour > 21)) return false;
      }
      
      // Menu Filter
      if (selectedMenu !== 'all') {
        if (selectedMenu === '기타') {
          const presets = ['한식', '일식', '중식', '양식', '분식'];
          if (presets.includes(post.menu) || presets.includes(post.title)) return false;
        } else {
          const includesMenu = post.menu.includes(selectedMenu) || post.title.includes(selectedMenu);
          if (!includesMenu) return false;
        }
      }
      
      return true;
    });
  }
  
  function updateList() {
    const listContainer = document.getElementById('feed-cards-container');
    if (!listContainer) return;
    
    const filtered = getFilteredPosts();
    
    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state animate-fade-in">
          <i class="fas fa-hamburger"></i>
          <p>선택하신 조건의 밥약 모집이 없습니다.<br>직접 밥친구를 구해보는 건 어떨까요?</p>
        </div>
      `;
      return;
    }
    
    listContainer.innerHTML = filtered.map(post => {
      const author = db.getUser(post.authorId);
      const formattedDate = formatDateTime(post.dateTime);
      const isFull = post.joinedCount >= post.capacity;
      const statusText = post.status === 'closed' || isFull ? '모집 마감' : '모집 중';
      const statusClass = post.status === 'closed' || isFull ? 'closed' : 'recruiting';
      
      return `
        <div class="card animate-slide-up" data-id="${post.id}">
          <div class="card-header">
            <h3 class="card-title">${post.title}</h3>
            <span class="card-status ${statusClass}">${statusText}</span>
          </div>
          <div class="card-details">
            <div class="card-detail-item">
              <i class="fas fa-utensils"></i>
              <span>메뉴: <strong>${post.menu}</strong></span>
            </div>
            <div class="card-detail-item">
              <i class="far fa-clock"></i>
              <span>시간: ${formattedDate}</span>
            </div>
            <div class="card-detail-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>장소: ${post.location}</span>
            </div>
          </div>
          <div class="card-footer">
            <div class="card-user-info">
              ${getAvatarHtml(author)}
              <div>
                <div class="user-nickname">${author.nickname} <span style="font-size:10px; color:var(--text-light); font-weight:normal;">${author.dept}</span></div>
                <div class="user-manner">
                  <i class="fas fa-fire"></i>
                  <span>매너점수 ${author.mannerScore}℃</span>
                </div>
              </div>
            </div>
            <div class="card-capacity">
              ${post.joinedCount} / ${post.capacity} 명
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Add Click listener to cards
    listContainer.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        navigate('detail', { postId: id });
      });
    });
  }

  container.innerHTML = `
    <!-- Sticky Header -->
    <div class="header-bar">
      <div class="header-logo"><i class="fas fa-utensils"></i> 밥약</div>
      <button class="header-action" id="feed-notification-btn">
        <i class="far fa-bell" style="font-size:20px;"></i>
        <span class="badge hidden animate-pop-in" id="feed-noti-badge">0</span>
      </button>
    </div>
    
    <!-- Filter Bar -->
    <div class="filter-bar">
      <!-- Date filters -->
      <div class="filter-row" id="date-filters">
        <button class="filter-chip active" data-date="all">전체 날짜</button>
        <button class="filter-chip" data-date="today">오늘</button>
        <button class="filter-chip" data-date="tomorrow">내일</button>
      </div>
      <!-- Time filters -->
      <div class="filter-row" id="time-filters">
        <button class="filter-chip active" data-time="all">전체 시간</button>
        <button class="filter-chip" data-time="lunch">점심 (~15시)</button>
        <button class="filter-chip" data-time="dinner">저녁 (17시~)</button>
      </div>
      <!-- Menu filters -->
      <div class="filter-row" id="menu-filters">
        <button class="filter-chip active" data-menu="all">전체 메뉴</button>
        <button class="filter-chip" data-menu="한식">한식</button>
        <button class="filter-chip" data-menu="일식">일식</button>
        <button class="filter-chip" data-menu="중식">중식</button>
        <button class="filter-chip" data-menu="양식">양식</button>
        <button class="filter-chip" data-menu="분식">분식</button>
        <button class="filter-chip" data-menu="기타">기타</button>
      </div>
    </div>
    
    <!-- Cards Feed -->
    <div id="feed-cards-container" class="feed-container"></div>
    
    <!-- Floating Action Button -->
    <button class="fab" id="feed-write-btn">
      <i class="fas fa-plus"></i>
    </button>
  `;
  
  // Set Notification Badge
  updateFeedNotiBadge();
  
  // Filter click handlers
  const bindFilters = (parentId, filterVar, valueAttr, onChange) => {
    const parent = document.getElementById(parentId);
    parent.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        parent.querySelector('.filter-chip.active').classList.remove('active');
        chip.classList.add('active');
        onChange(chip.getAttribute(valueAttr));
      });
    });
  };
  
  bindFilters('date-filters', selectedDate, 'data-date', (val) => {
    selectedDate = val;
    updateList();
  });
  
  bindFilters('time-filters', selectedTime, 'data-time', (val) => {
    selectedTime = val;
    updateList();
  });
  
  bindFilters('menu-filters', selectedMenu, 'data-menu', (val) => {
    selectedMenu = val;
    updateList();
  });
  
  // Write trigger
  document.getElementById('feed-write-btn').addEventListener('click', () => {
    navigate('create-post');
  });
  
  // Notification trigger
  document.getElementById('feed-notification-btn').addEventListener('click', () => {
    navigate('notifications');
  });
  
  // Initial card rendering
  updateList();
}

export function updateFeedNotiBadge() {
  const notiBadge = document.getElementById('feed-noti-badge');
  if (!notiBadge) return;
  const user = db.getCurrentUser();
  if (!user) return;
  
  // Count pending applications on user's posts
  const myPosts = db.getPosts().filter(p => p.authorId === user.id);
  const pendingCount = db.getApplications().filter(
    app => myPosts.some(p => p.id === app.postId) && app.status === 'pending'
  ).length;
  
  if (pendingCount > 0) {
    notiBadge.textContent = pendingCount;
    notiBadge.classList.remove('hidden');
  } else {
    notiBadge.classList.add('hidden');
  }
}

/* ==========================================================================
   Screen 4: Write Post View
   ========================================================================== */
export function renderCreatePost(container, navigate) {
  container.innerHTML = `
    <div class="write-screen animate-fade-in">
      <div class="write-header">
        <button class="write-back-btn" id="write-back"><i class="fas fa-times"></i></button>
        <span class="write-title">밥약 모집 글 올리기</span>
        <button class="write-save-btn" id="write-submit">완료</button>
      </div>
      
      <div class="write-form">
        <div class="form-group">
          <label>밥약 제목</label>
          <input type="text" id="post-title" class="input-field" placeholder="예) 학식 같이 먹어요!">
        </div>
        
        <div class="form-group">
          <label>식사 메뉴</label>
          <input type="text" id="post-menu" class="input-field" placeholder="예) 돈까스, 마라탕, 삼겹살 등">
        </div>
        
        <div class="form-group">
          <label>날짜 및 시간</label>
          <input type="datetime-local" id="post-datetime" class="input-field">
        </div>
        
        <div class="form-group">
          <label>장소 구분</label>
          <div class="segmented-control" id="loc-segment">
            <button class="segmented-btn active" data-type="cafeteria">학교 식당</button>
            <button class="segmented-btn" data-type="manual">직접 입력</button>
          </div>
        </div>
        
        <div class="form-group" id="loc-select-group">
          <label>학교 식당 선택</label>
          <select id="post-loc-select" class="input-field">
            <option value="학생식당 (본관)">학생식당 (본관)</option>
            <option value="교직원식당">교직원식당</option>
            <option value="공대 간이식당">공대 간이식당</option>
            <option value="기숙사식당">기숙사식당</option>
          </select>
        </div>
        
        <div class="form-group hidden" id="loc-manual-group">
          <label>상세 장소 입력</label>
          <input type="text" id="post-loc-manual" class="input-field" placeholder="예) 학교 정문 백종원 쌈밥집">
        </div>
        
        <div class="form-group">
          <label>모집 인원 (본인 포함)</label>
          <div class="options-grid" id="capacity-options">
            <button class="option-btn" data-val="2">2명</button>
            <button class="option-btn active" data-val="3">3명</button>
            <button class="option-btn" data-val="4">4명</button>
          </div>
        </div>
        
        <div class="form-group">
          <label>참가 성별 조건</label>
          <div class="options-grid" id="gender-options">
            <button class="option-btn active" data-val="무관">무관</button>
            <button class="option-btn" data-val="동성만">동성만</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Set current datetime as default value (rounded to next 30 min)
  const dtInput = document.getElementById('post-datetime');
  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);
  // timezone offset format
  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
  dtInput.value = localISOTime;

  // Segment logic
  const locSegment = document.getElementById('loc-segment');
  const locSelectGroup = document.getElementById('loc-select-group');
  const locManualGroup = document.getElementById('loc-manual-group');
  
  let locationType = 'cafeteria';
  
  locSegment.querySelectorAll('.segmented-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      locSegment.querySelector('.segmented-btn.active').classList.remove('active');
      btn.classList.add('active');
      locationType = btn.getAttribute('data-type');
      
      if (locationType === 'cafeteria') {
        locSelectGroup.classList.remove('hidden');
        locManualGroup.classList.add('hidden');
      } else {
        locSelectGroup.classList.add('hidden');
        locManualGroup.classList.remove('hidden');
      }
    });
  });
  
  // Option grids logic
  const bindOptionGrid = (parentId) => {
    const parent = document.getElementById(parentId);
    parent.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        parent.querySelector('.option-btn.active').classList.remove('active');
        btn.classList.add('active');
      });
    });
  };
  
  bindOptionGrid('capacity-options');
  bindOptionGrid('gender-options');
  
  // Submit action
  document.getElementById('write-submit').addEventListener('click', () => {
    const title = document.getElementById('post-title').value.trim();
    const menu = document.getElementById('post-menu').value.trim();
    const dateTime = document.getElementById('post-datetime').value;
    
    let location = '';
    if (locationType === 'cafeteria') {
      location = document.getElementById('post-loc-select').value;
    } else {
      location = document.getElementById('post-loc-manual').value.trim();
    }
    
    const capacity = document.getElementById('capacity-options').querySelector('.option-btn.active').getAttribute('data-val');
    const genderCondition = document.getElementById('gender-options').querySelector('.option-btn.active').getAttribute('data-val');
    
    if (!title || !menu || !dateTime || !location) {
      showToast('모든 필수 정보를 입력해 주세요.', 'danger');
      return;
    }
    
    db.createPost({
      title,
      menu,
      dateTime,
      location,
      capacity,
      genderCondition
    });
    
    showToast('모집 글이 게시되었습니다!', 'success');
    navigate('feed');
  });
  
  document.getElementById('write-back').addEventListener('click', () => {
    navigate('feed');
  });
}

/* ==========================================================================
   Screen 5: Post Detail View
   ========================================================================== */
export function renderPostDetail(container, postId, navigate) {
  const post = db.getPost(postId);
  if (!post) {
    container.innerHTML = `<div class="auth-screen">글을 찾을 수 없습니다.</div>`;
    return;
  }
  
  const currentUser = db.getCurrentUser();
  const author = db.getUser(post.authorId);
  const formattedDate = formatDateTime(post.dateTime);
  
  // Get participants info
  const participants = post.participantIds.map(pid => db.getUser(pid));
  
  container.innerHTML = `
    <div class="detail-screen animate-fade-in">
      <div class="detail-header">
        <button class="write-back-btn" id="detail-back"><i class="fas fa-arrow-left"></i></button>
        <span class="write-title">밥약 상세 정보</span>
        <div style="width:20px;"></div> <!-- Spacer -->
      </div>
      
      <div class="detail-body">
        <!-- Main details -->
        <div class="detail-card">
          <div class="detail-user-card">
            <div class="detail-user-info">
              ${getAvatarHtml(author)}
              <div class="detail-user-text">
                <div class="user-nickname">${author.nickname}</div>
                <div class="detail-user-meta">${author.dept} · ${author.grade}</div>
              </div>
            </div>
            <div class="user-manner">
              <i class="fas fa-fire"></i>
              <span>매너점수 ${author.mannerScore}℃</span>
            </div>
          </div>
          
          <h2 class="detail-title">${post.title}</h2>
          
          <div class="detail-info-grid">
            <div class="detail-info-item">
              <i class="fas fa-utensils"></i>
              <span class="detail-info-label">메뉴</span>
              <span class="detail-info-value">${post.menu}</span>
            </div>
            <div class="detail-info-item">
              <i class="far fa-clock"></i>
              <span class="detail-info-label">일시</span>
              <span class="detail-info-value">${formattedDate}</span>
            </div>
            <div class="detail-info-item">
              <i class="fas fa-map-marker-alt"></i>
              <span class="detail-info-label">장소</span>
              <span class="detail-info-value">${post.location}</span>
            </div>
            <div class="detail-info-item">
              <i class="fas fa-users"></i>
              <span class="detail-info-label">조건</span>
              <span class="detail-info-value">${post.genderCondition} · 정원 ${post.capacity}명</span>
            </div>
          </div>
        </div>
        
        <!-- Participants list -->
        <div class="detail-participants-section">
          <div class="section-title">
            <span>참여 멤버 (${post.joinedCount} / ${post.capacity})</span>
          </div>
          <div class="participants-list">
            ${participants.map(p => `
              <div class="participant-item">
                <div class="participant-avatar-info">
                  ${getAvatarHtml(p)}
                  <div>
                    <div class="user-nickname" style="font-size:13px;">${p.nickname}</div>
                    <div style="font-size:10px; color:var(--text-muted);">${p.dept}</div>
                  </div>
                </div>
                ${p.id === post.authorId ? '<span class="participant-badge">개설자</span>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      <!-- Footer Button Area -->
      <div class="detail-footer-btn-container" id="detail-action-container"></div>
    </div>
  `;
  
  // Render bottom buttons based on user association
  const actionContainer = document.getElementById('detail-action-container');
  
  if (post.authorId === currentUser.id) {
    // Current User is Author
    actionContainer.innerHTML = `
      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline" id="detail-end-post" style="flex:1;">모집 종료하기</button>
        <button class="btn btn-primary" id="detail-go-chat" style="flex:1.5;"><i class="fas fa-comments"></i> 채팅방 열기</button>
      </div>
    `;
    
    document.getElementById('detail-end-post').addEventListener('click', () => {
      post.status = 'closed';
      db.saveState();
      showToast('모집을 마감했습니다.', 'warning');
      navigate('feed');
    });
    
    document.getElementById('detail-go-chat').addEventListener('click', () => {
      navigate('chat-room', { chatId: post.id });
    });
    
  } else if (post.participantIds.includes(currentUser.id)) {
    // Current User is Participant
    actionContainer.innerHTML = `
      <button class="btn btn-primary" id="detail-go-chat"><i class="fas fa-comments"></i> 참여 중 - 채팅방 이동</button>
    `;
    
    document.getElementById('detail-go-chat').addEventListener('click', () => {
      navigate('chat-room', { chatId: post.id });
    });
    
  } else {
    // Current User is Applicant/Outsider
    const existingApp = db.getApplications().find(
      a => a.postId === post.id && a.applicantId === currentUser.id
    );
    
    if (existingApp && existingApp.status === 'pending') {
      actionContainer.innerHTML = `
        <button class="btn btn-primary" disabled style="background:#9CA3AF; box-shadow:none;">신청 완료 - 대기 중</button>
      `;
    } else if (existingApp && existingApp.status === 'rejected') {
      actionContainer.innerHTML = `
        <button class="btn btn-outline" disabled style="color:var(--text-light);">참여 신청이 반려됨</button>
      `;
    } else if (post.joinedCount >= post.capacity || post.status === 'closed') {
      actionContainer.innerHTML = `
        <button class="btn btn-primary" disabled style="background:#9CA3AF; box-shadow:none;">모집 마감되었습니다</button>
      `;
    } else {
      actionContainer.innerHTML = `
        <button class="btn btn-primary" id="detail-apply-btn">밥약 참여 신청하기</button>
      `;
      
      document.getElementById('detail-apply-btn').addEventListener('click', () => {
        const result = db.applyToPost(post.id);
        if (result.success) {
          showToast('신청이 성공적으로 접수되었습니다. 개설자에게 알림이 전송됩니다.', 'success');
          // Re-render
          renderPostDetail(container, postId, navigate);
        } else {
          showToast(result.message, 'danger');
        }
      });
    }
  }
  
  document.getElementById('detail-back').addEventListener('click', () => {
    navigate('feed');
  });
}

/* ==========================================================================
   Screen 6: Notifications List (Receive applications)
   ========================================================================== */
export function renderNotifications(container, navigate) {
  const currentUser = db.getCurrentUser();
  const myPosts = db.getPosts().filter(p => p.authorId === currentUser.id);
  
  // Find pending or historical applications on my posts
  const apps = db.getApplications().filter(
    app => myPosts.some(p => p.id === app.postId)
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  container.innerHTML = `
    <div class="noti-screen animate-fade-in">
      <div class="header-bar">
        <button class="write-back-btn" id="noti-back"><i class="fas fa-arrow-left"></i></button>
        <span class="write-title">도착한 밥약 신청</span>
        <div style="width:20px;"></div> <!-- Spacer -->
      </div>
      
      <div class="noti-list" id="noti-list-container"></div>
    </div>
  `;
  
  const listContainer = document.getElementById('noti-list-container');
  
  if (apps.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state animate-fade-in" style="padding-top:120px;">
        <i class="far fa-bell-slash"></i>
        <p>받은 신청 내역이 없습니다.<br>밥약 글을 올리고 밥친구들을 모아보세요!</p>
      </div>
    `;
  } else {
    listContainer.innerHTML = apps.map(app => {
      const applicant = db.getUser(app.applicantId);
      const post = db.getPost(app.postId);
      const timeStr = formatDateTime(app.createdAt);
      
      let actionHtml = '';
      if (app.status === 'pending') {
        actionHtml = `
          <div class="noti-actions">
            <button class="noti-btn noti-btn-reject" data-action="reject" data-id="${app.id}">거절</button>
            <button class="noti-btn noti-btn-accept" data-action="accept" data-id="${app.id}">수락</button>
          </div>
        `;
      } else {
        const text = app.status === 'accepted' ? '수락함' : '거절함';
        const color = app.status === 'accepted' ? 'var(--success)' : 'var(--text-light)';
        actionHtml = `
          <div style="font-size:12px; font-weight:700; color:${color}; margin-left:38px;">
            신청을 ${text}
          </div>
        `;
      }
      
      return `
        <div class="noti-card animate-slide-up">
          <div class="noti-header">
            ${getAvatarHtml(applicant)}
            <div class="noti-body">
              <div class="noti-text">
                <strong>${applicant.nickname}</strong>님이 밥약을 신청했습니다.
                <br>
                <span style="font-size:11px; color:var(--text-muted);">${applicant.dept} · ${applicant.grade} · 매너 ${applicant.mannerScore}℃</span>
              </div>
              <div class="noti-target-post">
                대상글: ${post.title}
              </div>
              <div class="noti-time">${timeStr}</div>
            </div>
          </div>
          ${actionHtml}
        </div>
      `;
    }).join('');
    
    // Bind accept/reject actions
    listContainer.querySelectorAll('.noti-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const appId = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        
        if (action === 'accept') {
          const result = db.respondToApplication(appId, 'accepted');
          if (result.success) {
            showToast('신청을 수락하여 밥친구가 매칭되었습니다! 채팅방이 생성됩니다.', 'success');
            // Notify badge update
            updateGlobalBadges();
            renderNotifications(container, navigate);
          } else {
            showToast(result.message, 'danger');
          }
        } else {
          db.respondToApplication(appId, 'rejected');
          showToast('신청을 반려했습니다.', 'warning');
          updateGlobalBadges();
          renderNotifications(container, navigate);
        }
      });
    });
  }
  
  document.getElementById('noti-back').addEventListener('click', () => {
    navigate('feed');
  });
}

/* ==========================================================================
   Screen 7: Chats & Chat Room View
   ========================================================================== */
export function renderChats(container, navigate) {
  const activeChats = db.getChats();
  
  container.innerHTML = `
    <div class="chat-list-screen animate-fade-in">
      <div class="header-bar">
        <span class="header-logo" style="margin-left:4px;"><i class="fas fa-comments"></i> 내 밥약 채팅</span>
      </div>
      
      <div class="chat-list" id="chats-container"></div>
    </div>
  `;
  
  const chatsContainer = document.getElementById('chats-container');
  
  if (activeChats.length === 0) {
    chatsContainer.innerHTML = `
      <div class="empty-state animate-fade-in" style="padding-top:120px;">
        <i class="far fa-comments" style="font-size:40px;"></i>
        <p>활성화된 식사 채팅방이 없습니다.<br>매칭 완료 시 여기에 표시됩니다.</p>
      </div>
    `;
  } else {
    chatsContainer.innerHTML = activeChats.map(chat => {
      const post = db.getPost(chat.postId);
      const lastMsg = chat.messages[chat.messages.length - 1];
      const lastMsgText = lastMsg ? lastMsg.content : '식사 약속 조율을 시작하세요!';
      const lastMsgTime = lastMsg ? formatDateTime(lastMsg.timestamp) : '';
      
      return `
        <div class="chat-list-item" data-id="${chat.id}">
          <div class="chat-item-avatar-group">
            <i class="fas fa-utensils"></i>
          </div>
          <div class="chat-item-body">
            <div class="chat-item-row">
              <span class="chat-item-name">${post.title}</span>
              <span class="chat-item-time">${lastMsgTime}</span>
            </div>
            <div class="chat-item-row" style="margin-top:2px;">
              <span class="chat-item-last">${lastMsgText}</span>
              <span class="chat-item-count">${chat.participantIds.length}명 참여중</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    chatsContainer.querySelectorAll('.chat-list-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        navigate('chat-room', { chatId: id });
      });
    });
  }
}

export function renderChatRoom(container, chatId, navigate) {
  const chat = db.getChat(chatId);
  if (!chat) {
    container.innerHTML = `<div class="auth-screen">채팅방을 찾을 수 없습니다.</div>`;
    return;
  }
  
  const currentUser = db.getCurrentUser();
  const post = db.getPost(chat.postId);
  const formattedDate = formatDateTime(post.dateTime);
  
  container.innerHTML = `
    <div class="chat-room-screen animate-fade-in">
      <div class="chat-room-header">
        <button class="chat-back-btn" id="chat-room-back"><i class="fas fa-arrow-left"></i></button>
        <div class="chat-room-title-container">
          <span class="chat-room-title">${post.menu} 밥약</span>
          <span class="chat-room-member-count">${chat.participantIds.length}명 참여 중</span>
        </div>
        <div style="width:24px;"></div>
      </div>
      
      <!-- Appointment Info Banner -->
      <div class="chat-room-info-banner">
        <div class="chat-banner-details">
          <span><i class="far fa-clock"></i> ${formattedDate}</span>
          <span><i class="fas fa-map-marker-alt"></i> ${post.location}</span>
        </div>
        ${!chat.ended ? `<button class="chat-end-btn" id="end-meal-btn">식사 완료</button>` : `<span style="font-size:11px; font-weight:700; color:var(--text-light);">채팅 종료됨</span>`}
      </div>
      
      <!-- Messages Box -->
      <div class="chat-messages-container" id="msg-box"></div>
      
      <!-- Input bar -->
      <div class="chat-input-bar">
        <input type="text" class="chat-input" id="chat-txt-input" placeholder="메시지를 입력하세요..." ${chat.ended ? 'disabled' : ''}>
        <button class="chat-send-btn" id="chat-send-btn" ${chat.ended ? 'disabled' : ''}><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>
  `;
  
  const msgBox = document.getElementById('msg-box');
  const txtInput = document.getElementById('chat-txt-input');
  
  function scrollMessages() {
    msgBox.scrollTop = msgBox.scrollHeight;
  }
  
  function renderMessages() {
    msgBox.innerHTML = chat.messages.map(msg => {
      if (msg.isSystem) {
        return `<div class="chat-sys-msg animate-fade-in">${msg.content}</div>`;
      }
      
      const isMe = msg.senderId === currentUser.id;
      const sender = db.getUser(msg.senderId) || { nickname: msg.senderName, avatar: '?' };
      const bubbleClass = isMe ? 'me' : 'other';
      const timeStr = new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      return `
        <div class="chat-msg-bubble-group ${bubbleClass} animate-fade-in">
          ${!isMe ? getAvatarHtml(sender) : ''}
          <div class="chat-bubble-content-wrapper">
            ${!isMe ? `<span class="chat-bubble-sender">${sender.nickname}</span>` : ''}
            <div class="chat-bubble-row">
              <div class="chat-bubble">${msg.content}</div>
              <span class="chat-bubble-time">${timeStr}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    scrollMessages();
  }
  
  // Send Action
  function sendMsg() {
    const txt = txtInput.value.trim();
    if (!txt) return;
    
    const sent = db.sendChatMessage(chat.id, txt);
    if (sent) {
      txtInput.value = '';
      renderMessages();
      
      // Simulate live responses to show prototype matching engagement
      if (chat.participantIds.length > 1) {
        triggerSimulatedReply(chat);
      }
    }
  }
  
  document.getElementById('chat-send-btn').addEventListener('click', sendMsg);
  txtInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMsg();
  });
  
  // End Meal action
  if (!chat.ended) {
    document.getElementById('end-meal-btn').addEventListener('click', () => {
      // Prompt modal for review
      showReviewModal(chat.id, post, currentUser, navigate);
    });
  }
  
  document.getElementById('chat-room-back').addEventListener('click', () => {
    navigate('chats');
  });
  
  renderMessages();
}

// Auto response simulator to make the prototype feel live!
let autoReplyTimer = null;
function triggerSimulatedReply(chat) {
  if (autoReplyTimer) clearTimeout(autoReplyTimer);
  
  // Select a random participant that is NOT current user
  const currentUser = db.getCurrentUser();
  const others = chat.participantIds.filter(pid => pid !== currentUser.id);
  if (others.length === 0) return;
  
  const senderId = others[Math.floor(Math.random() * others.length)];
  const sender = db.getUser(senderId);
  
  const replies = [
    '좋습니다! 시간 맞춰 뵙겠습니다~ 😊',
    '저도 그 메뉴 정말 좋아해요!',
    '장소 알겠습니다. 입구 근처에서 만날까요?',
    '네! 내일 뵙겠습니다!',
    '혹시 못 찾는 사람 계시면 톡 남겨주세요!'
  ];
  const replyContent = replies[Math.floor(Math.random() * replies.length)];
  
  autoReplyTimer = setTimeout(() => {
    // Generate simulated message in state
    const newMsg = {
      id: 'msg_' + Date.now(),
      senderId: sender.id,
      senderName: sender.nickname,
      content: replyContent,
      timestamp: new Date().toISOString(),
      isSystem: false
    };
    
    chat.messages.push(newMsg);
    db.saveState();
    
    // If user is still in this chat room, re-render
    const currentView = document.getElementById('bottom-nav').querySelector('.nav-item.active');
    // Simple check: is chat container present?
    const msgBox = document.getElementById('msg-box');
    if (msgBox) {
      const bubble = document.createElement('div');
      bubble.className = 'chat-msg-bubble-group other animate-fade-in';
      const timeStr = new Date(newMsg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      bubble.innerHTML = `
        ${getAvatarHtml(sender)}
        <div class="chat-bubble-content-wrapper">
          <span class="chat-bubble-sender">${sender.nickname}</span>
          <div class="chat-bubble-row">
            <div class="chat-bubble">${newMsg.content}</div>
            <span class="chat-bubble-time">${timeStr}</span>
          </div>
        </div>
      `;
      msgBox.appendChild(bubble);
      msgBox.scrollTop = msgBox.scrollHeight;
    }
    
    // Play system notification sound or toast
    showToast(`${sender.nickname}: ${replyContent}`, 'success');
    updateGlobalBadges();
  }, 3000);
}

/* ==========================================================================
   Review Modal (Manner score rating)
   ========================================================================== */
function showReviewModal(chatId, post, currentUser, navigate) {
  // Find other participants in the chat
  const others = chat.participantIds.filter(pid => pid !== currentUser.id).map(pid => db.getUser(pid));
  
  if (others.length === 0) {
    // No other users to review, just end
    db.endChatRoom(chatId);
    showToast('식사가 완료되었습니다. 약속을 종료합니다.', 'success');
    navigate('chats');
    return;
  }
  
  let currentRevieweeIndex = 0;
  let selectedRating = 5; // Default 5 star
  
  function renderReviewStep() {
    const target = others[currentRevieweeIndex];
    
    const html = `
      <div class="modal-content">
        <h3 class="modal-title">식사 메너 리뷰</h3>
        <p class="modal-desc"><strong>${post.menu}</strong> 밥약 친구들의 태도는 어땠나요?<br><strong>${target.nickname}</strong>님의 매너 점수를 평가해주세요!</p>
        
        <div class="rating-stars">
          <button class="star-btn selected" data-val="1"><i class="fas fa-star"></i></button>
          <button class="star-btn selected" data-val="2"><i class="fas fa-star"></i></button>
          <button class="star-btn selected" data-val="3"><i class="fas fa-star"></i></button>
          <button class="star-btn selected" data-val="4"><i class="fas fa-star"></i></button>
          <button class="star-btn selected" data-val="5"><i class="fas fa-star"></i></button>
        </div>
        
        <div style="display:flex; gap:10px; margin-top:10px;">
          <button class="btn btn-outline" id="review-skip-btn" style="flex:1;">건너뛰기</button>
          <button class="btn btn-primary" id="review-submit-btn" style="flex:1.5;">평가 완료</button>
        </div>
      </div>
    `;
    
    showModal(html);
    
    // Stars click binding
    const modal = document.getElementById('modal-container');
    const stars = modal.querySelectorAll('.star-btn');
    
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.getAttribute('data-val'), 10);
        selectedRating = val;
        
        // Update highlight
        stars.forEach(s => {
          const sVal = parseInt(s.getAttribute('data-val'), 10);
          if (sVal <= val) {
            s.classList.add('selected');
          } else {
            s.classList.remove('selected');
          }
        });
      });
    });
    
    // Submit review
    document.getElementById('review-submit-btn').addEventListener('click', () => {
      db.rateParticipant(post.id, target.id, selectedRating);
      showToast(`${target.nickname}님의 평점을 남겼습니다!`, 'success');
      nextReviewee();
    });
    
    // Skip review
    document.getElementById('review-skip-btn').addEventListener('click', () => {
      nextReviewee();
    });
  }
  
  function nextReviewee() {
    currentRevieweeIndex++;
    if (currentRevieweeIndex < others.length) {
      selectedRating = 5;
      renderReviewStep();
    } else {
      // Completed reviewing all
      db.endChatRoom(chatId);
      hideModal();
      showToast('밥약 식사가 마쳤습니다! 매너 평점이 갱신되었습니다.', 'success');
      navigate('chats');
    }
  }
  
  const chat = db.getChat(chatId);
  renderReviewStep();
}

/* ==========================================================================
   Screen 8: My Page
   ========================================================================== */
export function renderMyPage(container, navigate, onUserSwitch) {
  const currentUser = db.getCurrentUser();
  const allUsers = db.getUsers();
  
  // Load current Tab (either my posts or joined posts)
  let activeTab = 'written'; // 'written' or 'joined'
  
  function getTabPosts() {
    const posts = db.getPosts();
    if (activeTab === 'written') {
      return posts.filter(p => p.authorId === currentUser.id);
    } else {
      // Joined posts where current user is participant but NOT author
      return posts.filter(p => p.participantIds.includes(currentUser.id) && p.authorId !== currentUser.id);
    }
  }
  
  function renderPostsList() {
    const listContainer = document.getElementById('mypage-cards-container');
    if (!listContainer) return;
    
    const tabPosts = getTabPosts();
    
    if (tabPosts.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state animate-fade-in" style="padding: 40px 10px;">
          <i class="fas fa-folder-open"></i>
          <p>${activeTab === 'written' ? '내가 작성한 밥약이 없습니다.' : '참여한 밥약이 없습니다.'}</p>
        </div>
      `;
      return;
    }
    
    listContainer.innerHTML = tabPosts.map(post => {
      const formattedDate = formatDateTime(post.dateTime);
      return `
        <div class="card animate-slide-up" data-id="${post.id}" style="box-shadow:none; border:1.5px solid var(--border-color); margin-bottom:10px;">
          <div class="card-header">
            <h3 class="card-title">${post.title}</h3>
            <span class="card-status ${post.status === 'closed' ? 'closed' : 'recruiting'}">
              ${post.status === 'closed' ? '종료됨' : '모집 중'}
            </span>
          </div>
          <div class="card-details">
            <div class="card-detail-item">
              <i class="fas fa-utensils"></i>
              <span>메뉴: <strong>${post.menu}</strong></span>
            </div>
            <div class="card-detail-item">
              <i class="far fa-clock"></i>
              <span>시간: ${formattedDate}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Bind click to posts
    listContainer.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        navigate('detail', { postId: id });
      });
    });
  }
  
  // Calculate width percentage for manner score bar
  // Base is 36.5 (Karrot style). Max is 99.0
  const scorePercent = Math.min(100, Math.max(0, (currentUser.mannerScore / 99.0) * 100));
  
  container.innerHTML = `
    <div class="mypage-screen animate-fade-in">
      <div class="mypage-profile-card">
        <div class="mypage-avatar">${currentUser.avatar}</div>
        <h2 class="mypage-nickname">${currentUser.nickname}</h2>
        <span class="mypage-school-info">${currentUser.dept} · ${currentUser.grade}</span>
        
        <!-- Manner gauge -->
        <div class="manner-section">
          <div class="manner-label-row">
            <span class="manner-title"><i class="fas fa-fire"></i> 매너점수</span>
            <span class="manner-score">${currentUser.mannerScore}℃</span>
          </div>
          <div class="manner-bar-bg">
            <div class="manner-bar-fill" style="width: ${scorePercent}%"></div>
          </div>
        </div>
      </div>
      
      <!-- User Switching developer console (highly useful for matchmaking flow validation) -->
      <div class="demo-switch-panel">
        <div class="demo-title">
          <i class="fas fa-tools"></i> 체험 계정 변경 (프로토타입 테스트)
        </div>
        <div class="demo-btn-grid">
          ${allUsers.map(u => `
            <button class="demo-switch-btn ${u.id === currentUser.id ? 'active' : ''}" data-id="${u.id}">
              ${u.nickname} (${u.avatar})
            </button>
          `).join('')}
        </div>
        <div style="font-size:9.5px; color:var(--text-muted); margin-top:8px; line-height:1.3;">
          * 다른 사용자로 스위칭하여 매칭 신청(신청하기)을 한 뒤, 다시 원 개설자로 돌아와서 알림함에서 신청 수락을 해보실 수 있습니다!
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="tabs-header">
        <button class="tab-btn active" id="tab-written">내가 쓴 글</button>
        <button class="tab-btn" id="tab-joined">참여한 글</button>
      </div>
      
      <!-- Cards List -->
      <div id="mypage-cards-container" style="padding: 16px;"></div>
    </div>
  `;
  
  // Tab toggle binding
  const tabWritten = document.getElementById('tab-written');
  const tabJoined = document.getElementById('tab-joined');
  
  tabWritten.addEventListener('click', () => {
    tabWritten.classList.add('active');
    tabJoined.classList.remove('active');
    activeTab = 'written';
    renderPostsList();
  });
  
  tabJoined.addEventListener('click', () => {
    tabJoined.classList.add('active');
    tabWritten.classList.remove('active');
    activeTab = 'joined';
    renderPostsList();
  });
  
  // Switch account demo buttons binding
  container.querySelectorAll('.demo-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const uId = btn.getAttribute('data-id');
      db.setCurrentUser(uId);
      showToast(`${db.getUser(uId).nickname} 계정으로 전환되었습니다.`, 'success');
      onUserSwitch(); // Trigger full app navigation/badge refresh
    });
  });
  
  renderPostsList();
}

/* ==========================================================================
   Global Bottom Navigation Badge Update
   ========================================================================== */
export function updateGlobalBadges() {
  const notiBadge = document.getElementById('noti-badge');
  const chatBadge = document.getElementById('chat-badge');
  const user = db.getCurrentUser();
  if (!user) return;
  
  // Applications on my posts (count only pending)
  const myPosts = db.getPosts().filter(p => p.authorId === user.id);
  const pendingCount = db.getApplications().filter(
    app => myPosts.some(p => p.id === app.postId) && app.status === 'pending'
  ).length;
  
  if (pendingCount > 0) {
    notiBadge.textContent = pendingCount;
    notiBadge.classList.remove('hidden');
  } else {
    notiBadge.classList.add('hidden');
  }
  
  // Chat rooms with unread messages (we can simulate 1 for test if matching completes)
  const activeChats = db.getChats();
  const unreadChats = activeChats.filter(c => !c.ended && c.messages.length > 0).length;
  
  if (unreadChats > 0) {
    chatBadge.textContent = unreadChats;
    chatBadge.classList.remove('hidden');
  } else {
    chatBadge.classList.add('hidden');
  }
}
