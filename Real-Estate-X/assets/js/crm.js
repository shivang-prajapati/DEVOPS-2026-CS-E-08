'use strict';

const TOKEN_KEY = 'estatex-crm-token';
const allowedRoles = ['admin', 'agent', 'manager'];
const state = {
  token: '',
  user: null,
  activeInbox: 'enquiries'
};

const byId = (id) => document.getElementById(id);
const makeNode = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = String(text);
  return element;
};

const setStatus = (element, message, kind) => {
  if (!element) return;
  element.textContent = message || '';
  element.classList.remove('is-success', 'is-error', 'is-loading');
  if (kind) element.classList.add(`is-${kind}`);
};

const readResponse = async (response) => {
  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error('The server returned an unreadable response. Please try again.');
  }
  if (!response.ok || payload.success === false) {
    const message = payload.error || payload.message;
    const requestError = new Error(response.status === 401
      ? message || 'Your session expired. Please sign in again.'
      : response.status === 403
        ? message || 'Access denied. Your account does not have permission for this action.'
        : message || `Request failed (${response.status}).`);
    requestError.status = response.status;
    throw requestError;
  }
  return payload;
};

const apiRequest = async (path, options) => {
  const requestOptions = Object.assign({ headers: { Accept: 'application/json' } }, options || {});
  requestOptions.headers = Object.assign({}, requestOptions.headers);
  if (state.token) requestOptions.headers.Authorization = `Bearer ${state.token}`;
  if (requestOptions.body && typeof requestOptions.body !== 'string') {
    requestOptions.headers['Content-Type'] = 'application/json';
    requestOptions.body = JSON.stringify(requestOptions.body);
  }
  return readResponse(await fetch(path, requestOptions));
};

const setBusy = (form, busy) => {
  const button = form.querySelector('[type="submit"]');
  if (button) button.disabled = busy;
};

const openDashboard = (user, token) => {
  const role = String(user && user.role || '').toLowerCase();
  if (!allowedRoles.includes(role)) {
    state.token = '';
    state.user = null;
    sessionStorage.removeItem(TOKEN_KEY);
    setStatus(byId('login-status'), 'Access denied. CRM access requires an admin, manager, or agent account. Public registration does not grant these roles.', 'error');
    return false;
  }
  state.user = user;
  state.token = token;
  sessionStorage.setItem(TOKEN_KEY, token);
  byId('auth-panel').hidden = true;
  byId('dashboard').hidden = false;
  byId('welcome-heading').textContent = `Welcome${user.name ? `, ${user.name}` : ''}`;
  byId('role-summary').textContent = `Signed in as ${role}.`;

  const mayAdd = role === 'admin' || role === 'agent';
  byId('property-form').hidden = !mayAdd;
  setStatus(byId('listing-access-note'), mayAdd
    ? 'Admins and agents can create listings.'
    : 'Access denied: only admin and agent accounts may add listings. Your manager account can review the inbox.', mayAdd ? '' : 'error');

  const mayViewContacts = role === 'admin' || role === 'manager';
  byId('contacts-tab').disabled = !mayViewContacts;
  if (!mayViewContacts) byId('contacts-tab').title = 'Contact inbox access requires an admin or manager account.';
  setStatus(byId('access-status'), role === 'agent'
    ? 'Your agent account can add listings and view property enquiries. Contact messages are restricted to admins and managers.'
    : '', role === 'agent' ? '' : '');
  loadInbox();
  return true;
};

const clearSession = (message) => {
  state.token = '';
  state.user = null;
  sessionStorage.removeItem(TOKEN_KEY);
  byId('dashboard').hidden = true;
  byId('auth-panel').hidden = false;
  byId('login-form').reset();
  if (message) setStatus(byId('login-status'), message, 'error');
};

byId('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = byId('login-status');
  setBusy(form, true);
  setStatus(status, 'Signing in…', 'loading');
  try {
    const payload = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: byId('login-email').value.trim(),
        password: byId('login-password').value
      }
    });
    const data = payload.data || {};
    if (!data.token || !data.user) throw new Error('The login response was missing account information.');
    openDashboard(data.user, data.token);
  } catch (error) {
    setStatus(status, error.message || 'Sign in failed. Please try again.', 'error');
  } finally {
    setBusy(form, false);
  }
});

byId('setup-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = byId('setup-status');
  setBusy(form, true);
  setStatus(status, 'Creating the first administrator…', 'loading');
  try {
    const payload = await apiRequest('/api/auth/setup-admin', {
      method: 'POST',
      body: {
        name: byId('setup-name').value.trim(),
        email: byId('setup-email').value.trim(),
        password: byId('setup-password').value,
        setupKey: byId('setup-key').value
      }
    });
    form.reset();
    setStatus(status, `${payload.message || 'Administrator created.'} Sign in with the new administrator account.`, 'success');
  } catch (error) {
    setStatus(status, error.message || 'Administrator setup failed. Please check the setup key and try again.', 'error');
  } finally {
    setBusy(form, false);
  }
});

byId('property-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = byId('property-status');
  const role = String(state.user && state.user.role || '').toLowerCase();
  if (role !== 'admin' && role !== 'agent') {
    setStatus(status, 'Access denied: only admin and agent accounts may add listings.', 'error');
    return;
  }
  setBusy(form, true);
  setStatus(status, 'Creating listing…', 'loading');
  try {
    const payload = await apiRequest('/api/properties', {
      method: 'POST',
      body: {
        title: byId('property-title').value.trim(),
        price: byId('property-price').value.trim(),
        type: byId('property-type').value.trim(),
        location: byId('property-location').value.trim(),
        image: byId('property-image').value.trim(),
        description: byId('property-description').value.trim()
      }
    });
    form.reset();
    setStatus(status, payload.message || 'Property listing created successfully.', 'success');
  } catch (error) {
    const denied = /access denied|forbidden|permission/i.test(error.message);
    setStatus(status, denied
      ? 'Access denied: only admin and agent accounts may add listings.'
      : error.message || 'The listing could not be created. Please try again.', 'error');
  } finally {
    setBusy(form, false);
  }
});

const renderRecord = (record, type) => {
  const article = makeNode('article', 'inbox-record');
  const name = record.name || 'Website visitor';
  const topic = type === 'contacts'
    ? record.subject || 'Contact message'
    : record.property_id ? `Property enquiry · ${record.property_id}` : 'Property enquiry';
  article.append(makeNode('h3', 'h3', topic));
  article.append(makeNode('p', 'inbox-record-meta', `${name}${record.email ? ` · ${record.email}` : ''}${record.phone ? ` · ${record.phone}` : ''}`));
  if (record.createdAt) {
    const date = new Date(record.createdAt);
    article.append(makeNode('p', 'inbox-record-meta', Number.isNaN(date.getTime()) ? String(record.createdAt) : date.toLocaleString()));
  }
  if (record.message) article.append(makeNode('p', '', record.message));
  return article;
};

const loadInbox = async () => {
  if (!state.user || !state.token) return;
  const role = String(state.user.role || '').toLowerCase();
  const kind = state.activeInbox;
  const status = byId('inbox-status');
  const list = byId('inbox-list');
  const contactsTab = byId('contacts-tab');
  list.replaceChildren();
  if (kind === 'contacts' && role !== 'admin' && role !== 'manager') {
    setStatus(status, 'Access denied: viewing contact messages requires an admin or manager account.', 'error');
    return;
  }
  if (kind === 'enquiries' && !allowedRoles.includes(role)) {
    setStatus(status, 'Access denied: sign in with an authorized account to view enquiries.', 'error');
    return;
  }
  const endpoint = kind === 'contacts' ? '/api/contact' : '/api/enquiries';
  setStatus(status, `Loading ${kind === 'contacts' ? 'contact messages' : 'property enquiries'}…`, 'loading');
  try {
    const payload = await apiRequest(endpoint);
    const records = Array.isArray(payload.data) ? payload.data.filter((record) => record && typeof record === 'object') : null;
    if (!records) throw new Error('The inbox response was not in the expected format.');
    if (!records.length) {
      setStatus(status, 'No messages in this inbox yet.', '');
      return;
    }
    const fragment = document.createDocumentFragment();
    records.forEach((record) => fragment.append(renderRecord(record, kind)));
    list.replaceChildren(fragment);
    setStatus(status, `${records.length} message${records.length === 1 ? '' : 's'}.`, 'success');
  } catch (error) {
    if (/access denied|forbidden/i.test(error.message)) {
      setStatus(status, kind === 'contacts'
        ? 'Access denied: contact messages are available to admin and manager accounts.'
        : 'Access denied: your account cannot view enquiries.', 'error');
      if (kind === 'contacts') contactsTab.disabled = true;
      return;
    }
    if (error.status === 401 || /session expired/i.test(error.message)) {
      clearSession(error.message);
      return;
    }
    setStatus(status, `${error.message} Refresh to try again.`, 'error');
  }
};

byId('enquiries-tab').addEventListener('click', () => {
  state.activeInbox = 'enquiries';
  byId('enquiries-tab').classList.add('active');
  byId('enquiries-tab').setAttribute('aria-selected', 'true');
  byId('contacts-tab').classList.remove('active');
  byId('contacts-tab').setAttribute('aria-selected', 'false');
  loadInbox();
});

byId('contacts-tab').addEventListener('click', () => {
  if (byId('contacts-tab').disabled) {
    setStatus(byId('inbox-status'), 'Access denied: viewing contact messages requires an admin or manager account.', 'error');
    return;
  }
  state.activeInbox = 'contacts';
  byId('contacts-tab').classList.add('active');
  byId('contacts-tab').setAttribute('aria-selected', 'true');
  byId('enquiries-tab').classList.remove('active');
  byId('enquiries-tab').setAttribute('aria-selected', 'false');
  loadInbox();
});

byId('refresh-inbox').addEventListener('click', loadInbox);
byId('logout-button').addEventListener('click', () => clearSession('You have signed out.'));

const savedToken = sessionStorage.getItem(TOKEN_KEY);
if (savedToken) {
  state.token = savedToken;
  apiRequest('/api/auth/me').then((payload) => {
    const user = payload.data && (payload.data.user || payload.data);
    if (!user || !user.role) throw new Error('The account response was invalid. Please sign in again.');
    if (!openDashboard(user, savedToken)) clearSession('CRM access requires an admin, manager, or agent account.');
  }).catch((error) => clearSession(error.message || 'Your session expired. Please sign in again.'));
}
