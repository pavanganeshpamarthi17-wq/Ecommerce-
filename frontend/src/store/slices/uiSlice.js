import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    notifications: [],
    cartSidebarOpen: false,
    mobileMenuOpen: false,
  },
  reducers: {
    addNotification: (state, action) => {
      const id = Date.now().toString();
      state.notifications.push({ id, ...action.payload });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    toggleCartSidebar: (state) => { state.cartSidebarOpen = !state.cartSidebarOpen; },
    closeCartSidebar: (state) => { state.cartSidebarOpen = false; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    closeMobileMenu: (state) => { state.mobileMenuOpen = false; },
  },
});

export const {
  addNotification, removeNotification,
  toggleCartSidebar, closeCartSidebar,
  toggleMobileMenu, closeMobileMenu,
} = uiSlice.actions;

// Helper thunk
export const notify = (message, type = 'info', duration = 3000) => (dispatch) => {
  const id = Date.now().toString();
  dispatch(addNotification({ id, message, type }));
  setTimeout(() => dispatch(removeNotification(id)), duration);
};

export default uiSlice.reducer;
