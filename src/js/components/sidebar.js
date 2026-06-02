import { ICON_PATH, navItems, playlistMenuItems } from '../data.js';
import { isLoggedIn, requireLogin } from '../utils/auth.js';
import { deletePlaylistTracks, renamePlaylistTracks } from '../utils/playlistStorage.js';
import { escapeHTML } from '../utils/escapeHTML.js';

const PLAYLIST_STORAGE_KEY = 'moodwave_playlists';
const PLAYLIST_MENU_WIDTH = 270;

// 사용자가 생성한 플레이리스트 관리
let playlistState = loadPlaylists();
let deleteTargetIndex = null;
let renameTargetIndex = null;
let openedMenuIndex = null;

let menuPosition = {
  top: 0,
  left: 0,
};

// 로그인 상태 저장
let isLoginUser = false;

// 이벤트 중복 등록 방지
let isSidebarEventBound = false;
let isDocumentEventBound = false;
let isSidebarSubmitEventBound = false;

// =========================
// 사이드바 HTML 렌더링 함수
// =========================
export function renderSidebar() {
  return `
    <div class="sidebar__header">
      <!-- 로고 -->
      <div class="sidebar__brand">
        <a href="#/home" class="sidebar__brand-link">
          <img src="/assets/icon/logo.svg" alt="MOOD WAVE 로고" />
          <span>MOOD WAVE</span>
        </a>

        <button
          type="button"
          class="sidebar__close-button"
          data-close-sidebar
          aria-label="사이드바 닫기"
        >
          ×
        </button>
      </div>

      <!-- 주요 메뉴 -->
      <nav
        id="primaryNav"
        class="sidebar__nav-primary"
        aria-label="주요 메뉴"
      ></nav>

      <!-- 플레이리스트 메뉴 -->
      <nav
        id="secondaryNav"
        class="sidebar__nav-secondary"
        aria-label="플레이리스트 메뉴"
      ></nav>
    </div>

    <div class="sidebar__divider" aria-hidden="true"></div>

    <!-- 플레이리스트 목록 -->
    <div
      id="playlistList"
      class="sidebar__playlist-list custom-scrollbar custom-scrollbar--hover"
      hidden
    ></div>

    <!-- 플레이리스트 생성 모달 -->
    <div id="playlistModal" class="playlist-modal" aria-hidden="true">
      <div class="playlist-modal__overlay" data-close-playlist-modal></div>

      <div class="playlist-modal__content" role="dialog" aria-modal="true">
        <h2 class="playlist-modal__title">Create Playlist</h2>

        <form id="playlistForm" class="playlist-modal__form">
          <input
            id="playlistInput"
            class="playlist-modal__input"
            type="text"
            placeholder="플레이리스트 제목을 입력하세요"
            autocomplete="off"
          />

          <div class="playlist-modal__buttons">
            <button
              type="button"
              class="playlist-modal__button playlist-modal__button--cancel"
              data-close-playlist-modal
            >
              취소
            </button>

            <button
              type="submit"
              class="playlist-modal__button playlist-modal__button--create"
            >
              생성
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 플레이리스트 이름 변경 모달 -->
    <div id="renamePlaylistModal" class="playlist-modal" aria-hidden="true">
      <div class="playlist-modal__overlay" data-close-rename-modal></div>

      <div class="playlist-modal__content" role="dialog" aria-modal="true">
        <h2 class="playlist-modal__title">Rename Playlist</h2>

        <form id="renamePlaylistForm" class="playlist-modal__form">
          <input
            id="renamePlaylistInput"
            class="playlist-modal__input"
            type="text"
            placeholder="변경할 이름을 입력하세요"
            autocomplete="off"
          />

          <div class="playlist-modal__buttons">
            <button
              type="button"
              class="playlist-modal__button playlist-modal__button--cancel"
              data-close-rename-modal
            >
              취소
            </button>

            <button
              type="submit"
              class="playlist-modal__button playlist-modal__button--create"
            >
              변경
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 플레이리스트 삭제 확인 모달 -->
    <div id="deletePlaylistModal" class="playlist-modal" aria-hidden="true">
      <div class="playlist-modal__overlay" data-close-delete-modal></div>

      <div class="playlist-modal__content" role="dialog" aria-modal="true">
        <h2 class="playlist-modal__title">Delete Playlist</h2>

        <p class="playlist-modal__description">
          이 플레이리스트를 삭제하시겠습니까?
        </p>

        <div class="playlist-modal__buttons">
          <button
            type="button"
            class="playlist-modal__button playlist-modal__button--cancel"
            data-close-delete-modal
          >
            취소
          </button>

          <button
            type="button"
            id="confirmDeletePlaylistButton"
            class="playlist-modal__button playlist-modal__button--delete"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  `;
}

// =========================
// 메뉴 아이템 작성 함수
// =========================
function createNavItem(item) {
  const isCreatePlaylist = item.label === 'Create Playlist';

  return `
    <a
      href="${item.href || '#'}"
      class="sidebar__nav-item"
      ${isCreatePlaylist ? 'data-create-playlist="true"' : ''}
    >
      <img
        class="sidebar__icon"
        src="${ICON_PATH}${item.icon}"
        width="32"
        height="32"
        alt=""
      />
      <span class="sidebar__label">${escapeHTML(item.label)}</span>
    </a>
  `;
}

// =========================
// 메뉴 렌더링 함수
// =========================
function renderNav() {
  const primaryNav = document.querySelector('#primaryNav');
  const secondaryNav = document.querySelector('#secondaryNav');

  if (!primaryNav || !secondaryNav) return;

  primaryNav.innerHTML = navItems.map(createNavItem).join('');
  secondaryNav.innerHTML = playlistMenuItems.map(createNavItem).join('');
}

// =========================
// 사이드바 닫기 함수
// =========================
function closeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  sidebar?.classList.remove('is-open');
  overlay?.classList.remove('is-open');
  document.body.classList.remove('is-sidebar-open');
}

// =========================
// 플레이리스트 목록 표시 상태 설정 함수
// =========================
function setPlaylistListVisible(isVisible) {
  const playlistList = document.querySelector('#playlistList');

  if (!playlistList) return;

  playlistList.hidden = !isVisible;
}

// =========================
// 플레이리스트 목록 렌더링 함수
// =========================
function renderPlaylists() {
  const playlistList = document.querySelector('#playlistList');

  if (!playlistList) return;

  if (!isLoginUser) {
    playlistList.innerHTML = '';
    playlistList.hidden = true;
    return;
  }

  playlistList.hidden = false;

  playlistList.innerHTML = playlistState
    .map((playlist, index) => {
      return `
        <div class="sidebar__playlist-row">
          <a
            href="#/playlist?name=${encodeURIComponent(playlist)}"
            class="sidebar__playlist-item"
          >
            ${escapeHTML(playlist)}
          </a>

          <div class="sidebar__playlist-more-wrap">
            <button
              type="button"
              class="sidebar__playlist-more-button"
              data-playlist-menu-button="${index}"
              aria-label="${escapeHTML(playlist)} 메뉴 열기"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      `;
    })
    .join('');
}

// =========================
// 플레이리스트 불러오기 함수
// =========================
function loadPlaylists() {
  try {
    const savedPlaylists = JSON.parse(localStorage.getItem(PLAYLIST_STORAGE_KEY) || '[]');

    return Array.isArray(savedPlaylists) ? savedPlaylists : [];
  } catch {
    return [];
  }
}

// =========================
// 플레이리스트 저장 함수
// =========================
function savePlaylists() {
  localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(playlistState));
}

// =========================
// 플레이리스트 생성 모달 열기 함수
// =========================
function openPlaylistModal() {
  const modal = document.querySelector('#playlistModal');
  const input = document.querySelector('#playlistInput');

  if (!modal || !input) return;

  closePlaylistMoreMenu();

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');

  input.value = '';
  input.focus();
}

// =========================
// 플레이리스트 생성 모달 닫기 함수
// =========================
function closePlaylistModal() {
  const modal = document.querySelector('#playlistModal');

  if (!modal) return;

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
}

// =========================
// 플레이리스트 생성 함수
// =========================
function createPlaylist(title) {
  const newPlaylist = title.trim();

  if (!newPlaylist) {
    alert('플레이리스트 제목을 입력해주세요.');
    return;
  }

  if (playlistState.includes(newPlaylist)) {
    alert('이미 같은 이름의 플레이리스트가 있습니다.');
    return;
  }

  playlistState.push(newPlaylist);
  savePlaylists();
  renderPlaylists();
  closePlaylistModal();
}

// =========================
// 플레이리스트 더보기 메뉴 생성 / 삭제 함수
// =========================
function removeFloatingPlaylistMenu() {
  const menus = document.querySelectorAll('.playlist-more-menu');

  menus.forEach((menu) => {
    menu.remove();
  });
}

function createFloatingPlaylistMenu(index) {
  const menu = document.createElement('div');

  menu.className = 'playlist-more-menu is-open';
  menu.dataset.playlistMenu = index;

  menu.innerHTML = `
    <button
      type="button"
      class="playlist-more-menu__item"
      data-share-playlist-index="${index}"
    >
      <span class="playlist-more-menu__icon">
        ${shareIcon()}
      </span>
      <span>플레이리스트 공유</span>
    </button>

    <button
      type="button"
      class="playlist-more-menu__item"
      data-rename-playlist-index="${index}"
    >
      <span class="playlist-more-menu__icon">
        ${editIcon()}
      </span>
      <span>플레이리스트 이름 바꾸기</span>
    </button>

    <button
      type="button"
      class="playlist-more-menu__item playlist-more-menu__item--delete"
      data-delete-playlist-index="${index}"
    >
      <span class="playlist-more-menu__icon">
        ${trashIcon()}
      </span>
      <span>플레이리스트 삭제</span>
    </button>
  `;

  document.body.appendChild(menu);

  return menu;
}

// =========================
// 플레이리스트 더보기 메뉴 열기/닫기 함수
// =========================
function togglePlaylistMoreMenu(index, button) {
  if (openedMenuIndex === index) {
    closePlaylistMoreMenu();
    return;
  }

  removeFloatingPlaylistMenu();

  const rect = button.getBoundingClientRect();
  const menu = createFloatingPlaylistMenu(index);

  const nextLeft = rect.right + 8;
  const maxLeft = window.innerWidth - PLAYLIST_MENU_WIDTH - 12;

  menuPosition = {
    top: Math.max(12, rect.top - 10),
    left: Math.min(nextLeft, maxLeft),
  };

  menu.style.top = `${menuPosition.top}px`;
  menu.style.left = `${menuPosition.left}px`;

  openedMenuIndex = index;
}

function closePlaylistMoreMenu() {
  if (openedMenuIndex === null) return;

  openedMenuIndex = null;
  removeFloatingPlaylistMenu();
}

// =========================
// 플레이리스트 공유 함수
// =========================
async function sharePlaylist(index) {
  const playlistName = playlistState[index];

  if (!playlistName) return;

  const shareText = `MOOD WAVE 플레이리스트: ${playlistName}`;
  const shareUrl = `${window.location.origin}${window.location.pathname}#/playlist?name=${encodeURIComponent(
    playlistName,
  )}`;

  closePlaylistMoreMenu();

  try {
    if (navigator.share) {
      await navigator.share({
        title: playlistName,
        text: shareText,
        url: shareUrl,
      });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    alert('플레이리스트 공유 링크가 복사되었습니다.');
  } catch {
    alert('공유를 취소했거나 실패했습니다.');
  }
}

// =========================
// 이름 변경 모달 열기 함수
// =========================
function openRenamePlaylistModal(index) {
  const modal = document.querySelector('#renamePlaylistModal');
  const input = document.querySelector('#renamePlaylistInput');

  if (!modal || !input) return;

  renameTargetIndex = index;
  closePlaylistMoreMenu();

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');

  input.value = playlistState[index];
  input.focus();
  input.select();
}

// =========================
// 이름 변경 모달 닫기 함수
// =========================
function closeRenamePlaylistModal() {
  const modal = document.querySelector('#renamePlaylistModal');

  if (!modal) return;

  renameTargetIndex = null;

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
}

// =========================
// 플레이리스트 이름 변경 함수
// =========================
function renamePlaylist(title) {
  if (renameTargetIndex === null) return;

  const newTitle = title.trim();

  if (!newTitle) {
    alert('변경할 이름을 입력해주세요.');
    return;
  }

  const prevTitle = playlistState[renameTargetIndex];

  if (prevTitle === newTitle) {
    closeRenamePlaylistModal();
    return;
  }

  if (playlistState.includes(newTitle)) {
    alert('이미 같은 이름의 플레이리스트가 있습니다.');
    return;
  }

  playlistState[renameTargetIndex] = newTitle;
  renamePlaylistTracks(prevTitle, newTitle);

  savePlaylists();
  renderPlaylists();
  closeRenamePlaylistModal();
}

// =========================
// 삭제 확인 모달 열기 함수
// =========================
function openDeletePlaylistModal(index) {
  const modal = document.querySelector('#deletePlaylistModal');
  const confirmDeleteButton = document.querySelector('#confirmDeletePlaylistButton');

  if (!modal || !confirmDeleteButton) return;

  deleteTargetIndex = index;
  closePlaylistMoreMenu();

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');

  requestAnimationFrame(() => {
    confirmDeleteButton.focus();
  });
}

// =========================
// 삭제 확인 모달 닫기 함수
// =========================
function closeDeletePlaylistModal() {
  const modal = document.querySelector('#deletePlaylistModal');

  if (!modal) return;

  deleteTargetIndex = null;

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
}

// =========================
// 플레이리스트 삭제 함수
// =========================
function deletePlaylist() {
  if (deleteTargetIndex === null) return;

  const deletedPlaylist = playlistState[deleteTargetIndex];

  playlistState.splice(deleteTargetIndex, 1);
  deletePlaylistTracks(deletedPlaylist);

  savePlaylists();
  renderPlaylists();
  closeDeletePlaylistModal();
}

// =========================
// 사이드바 내부 클릭 이벤트 등록 함수
// =========================
function bindSidebarClickEvents() {
  const sidebar = document.querySelector('#sidebar');

  if (!sidebar || isSidebarEventBound) return;

  isSidebarEventBound = true;

  sidebar.addEventListener('click', async (event) => {
    const closeSidebarButton = event.target.closest('[data-close-sidebar]');
    const createPlaylistButton = event.target.closest('[data-create-playlist]');
    const closePlaylistButton = event.target.closest('[data-close-playlist-modal]');
    const closeRenameButton = event.target.closest('[data-close-rename-modal]');
    const closeDeleteButton = event.target.closest('[data-close-delete-modal]');
    const playlistLink = event.target.closest('.sidebar__playlist-item');
    const menuButton = event.target.closest('[data-playlist-menu-button]');
    const confirmDeleteButton = event.target.closest('#confirmDeletePlaylistButton');

    if (closeSidebarButton) {
      event.preventDefault();
      closeSidebar();
      return;
    }

    if (createPlaylistButton) {
      event.preventDefault();

      const canUse = await requireLogin('플레이리스트 생성은 로그인 후 이용할 수 있습니다.');

      if (!canUse) return;

      openPlaylistModal();
      return;
    }

    if (closePlaylistButton) {
      event.preventDefault();
      closePlaylistModal();
      return;
    }

    if (closeRenameButton) {
      event.preventDefault();
      closeRenamePlaylistModal();
      return;
    }

    if (closeDeleteButton) {
      event.preventDefault();
      closeDeletePlaylistModal();
      return;
    }

    if (playlistLink) {
      const canUse = await requireLogin('플레이리스트는 로그인 후 이용할 수 있습니다.');

      if (!canUse) {
        event.preventDefault();
      }

      return;
    }

    if (menuButton) {
      event.preventDefault();
      event.stopPropagation();

      const index = Number(menuButton.dataset.playlistMenuButton);

      if (Number.isNaN(index)) return;

      togglePlaylistMoreMenu(index, menuButton);
      return;
    }

    if (confirmDeleteButton) {
      event.preventDefault();
      deletePlaylist();
    }
  });
}

// =========================
// 사이드바 내부 form 이벤트 등록 함수
// =========================
function bindSidebarSubmitEvents() {
  const sidebar = document.querySelector('#sidebar');

  if (!sidebar || isSidebarSubmitEventBound) return;

  isSidebarSubmitEventBound = true;

  sidebar.addEventListener('submit', (event) => {
    const playlistForm = event.target.closest('#playlistForm');
    const renameForm = event.target.closest('#renamePlaylistForm');

    if (playlistForm) {
      event.preventDefault();

      const playlistInput = document.querySelector('#playlistInput');
      createPlaylist(playlistInput?.value || '');
      return;
    }

    if (renameForm) {
      event.preventDefault();

      const renameInput = document.querySelector('#renamePlaylistInput');
      renamePlaylist(renameInput?.value || '');
    }
  });
}

// =========================
// 문서 전체 이벤트 등록 함수
// =========================
function bindDocumentEvents() {
  if (isDocumentEventBound) return;

  isDocumentEventBound = true;

  document.addEventListener('click', (event) => {
    const menuButton = event.target.closest('[data-playlist-menu-button]');
    const moreMenu = event.target.closest('.playlist-more-menu');
    const shareButton = event.target.closest('[data-share-playlist-index]');
    const renameButton = event.target.closest('[data-rename-playlist-index]');
    const deleteButton = event.target.closest('[data-delete-playlist-index]');

    if (shareButton) {
      event.preventDefault();

      const index = Number(shareButton.dataset.sharePlaylistIndex);

      if (Number.isNaN(index)) return;

      sharePlaylist(index);
      return;
    }

    if (renameButton) {
      event.preventDefault();

      const index = Number(renameButton.dataset.renamePlaylistIndex);

      if (Number.isNaN(index)) return;

      openRenamePlaylistModal(index);
      return;
    }

    if (deleteButton) {
      event.preventDefault();

      const index = Number(deleteButton.dataset.deletePlaylistIndex);

      if (Number.isNaN(index)) return;

      openDeletePlaylistModal(index);
      return;
    }

    if (menuButton || moreMenu) return;

    closePlaylistMoreMenu();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    closeSidebar();
    closePlaylistMoreMenu();
    closePlaylistModal();
    closeRenamePlaylistModal();
    closeDeletePlaylistModal();
  });
}

// =========================
// 아이콘 SVG 함수
// =========================
function shareIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 16V4M12 4L7 9M12 4L17 9"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M5 14V19H19V14"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

function editIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 20H8L19 9L15 5L4 16V20Z"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M14 6L18 10"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  `;
}

function trashIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 7H20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
      <path
        d="M10 11V17M14 11V17"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
      <path
        d="M6 7L7 20H17L18 7"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <path
        d="M9 7V4H15V7"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

// =========================
// 사이드바 초기 실행 함수
// =========================
export async function initSidebar() {
  renderNav();

  playlistState = loadPlaylists();
  isLoginUser = await isLoggedIn();

  if (isLoginUser) {
    setPlaylistListVisible(true);
    renderPlaylists();
  } else {
    setPlaylistListVisible(false);
  }

  bindSidebarClickEvents();
  bindSidebarSubmitEvents();
  bindDocumentEvents();
}
