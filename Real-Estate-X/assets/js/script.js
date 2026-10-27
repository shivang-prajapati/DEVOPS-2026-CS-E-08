'use strict';

const toggleElement = (element) => {
  if (element) element.classList.toggle('active');
};

const navbar = document.querySelector('[data-navbar]');
const overlay = document.querySelector('[data-overlay]');
const navbarToggles = document.querySelectorAll('[data-nav-close-btn], [data-nav-open-btn], [data-nav-link], [data-overlay]');

navbarToggles.forEach((element) => {
  element.addEventListener('click', () => {
    toggleElement(navbar);
    toggleElement(overlay);
  });
});

const header = document.querySelector('[data-header]');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('active', window.scrollY >= 400);
  });
}

const apiError = async (response) => {
  let payload = {};
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error('The server returned an unreadable response. Please try again later.');
  }
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || payload.message || `Request failed (${response.status}).`);
  }
  return payload;
};

const setStatus = (element, message, state) => {
  if (!element) return;
  element.textContent = message;
  element.classList.remove('is-success', 'is-error', 'is-loading');
  if (state) element.classList.add(`is-${state}`);
};

const safeImageUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return './assets/images/property-1.jpg';
  try {
    const url = new URL(value, window.location.href);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return './assets/images/property-1.jpg';
    return url.href;
  } catch (error) {
    return './assets/images/property-1.jpg';
  }
};

const makeNode = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

const propertyList = document.getElementById('property-list');
const propertyStatus = document.getElementById('property-list-status');
const enquiryForm = document.getElementById('property-enquiry-form');
const enquiryStatus = document.getElementById('property-enquiry-status');
let selectedPropertyId = '';

const makePropertyCard = (property) => {
  const item = makeNode('li');
  const card = makeNode('article', 'property-card');
  const banner = makeNode('figure', 'card-banner');
  const image = makeNode('img', 'w-100');
  image.src = safeImageUrl(property.image);
  image.alt = typeof property.title === 'string' ? property.title : 'Property listing';
  image.loading = 'lazy';
  image.addEventListener('error', () => {
    image.src = './assets/images/property-1.jpg';
  }, { once: true });

  const badge = makeNode('span', `card-badge ${/rent/i.test(String(property.type || '')) ? 'green' : 'orange'}`,
    property.type || 'Property');
  const locationActions = makeNode('div', 'banner-actions');
  const location = makeNode('span', 'banner-actions-btn', property.location || 'Location unavailable');
  locationActions.append(location);
  banner.append(image, badge, locationActions);

  const content = makeNode('div', 'card-content');
  const price = makeNode('p', 'card-price');
  price.append(makeNode('strong', '', property.price || 'Price on request'));
  content.append(price, makeNode('h3', 'h3 card-title', property.title || 'Untitled property'));
  if (property.description) content.append(makeNode('p', 'card-text', property.description));

  const actions = makeNode('div', 'card-footer');
  const enquireButton = makeNode('button', 'btn', 'Enquire about this property');
  enquireButton.type = 'button';
  enquireButton.addEventListener('click', () => {
    if (!property.id) {
      setStatus(propertyStatus, 'This listing has no property ID, so an enquiry cannot be submitted.', 'error');
      return;
    }
    selectedPropertyId = String(property.id);
    document.getElementById('enquiry-property-id').value = selectedPropertyId;
    document.getElementById('enquiry-property-title').textContent = property.title || 'this property';
    enquiryForm.hidden = false;
    setStatus(enquiryStatus, '', '');
    enquiryForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('enquiry-name').focus();
  });
  actions.append(enquireButton);
  card.append(banner, content, actions);
  item.append(card);
  return item;
};

const loadProperties = async () => {
  if (!propertyList || !propertyStatus) return;
  propertyList.replaceChildren();
  setStatus(propertyStatus, 'Loading listings…', 'loading');
  try {
    const payload = await apiError(await fetch('/api/properties', { headers: { Accept: 'application/json' } }));
    const properties = Array.isArray(payload.data) ? payload.data : payload.data && Array.isArray(payload.data.properties) ? payload.data.properties : null;
    if (!properties) throw new Error('The listings response was not in the expected format.');
    if (!properties.length) {
      setStatus(propertyStatus, 'No properties are available right now. Please check back soon.', '');
      return;
    }
    const fragment = document.createDocumentFragment();
    properties.forEach((property) => fragment.append(makePropertyCard(property)));
    propertyList.replaceChildren(fragment);
    setStatus(propertyStatus, `${properties.length} listing${properties.length === 1 ? '' : 's'} available.`, 'success');
  } catch (error) {
    setStatus(propertyStatus, `${error.message} Listings could not be loaded. Please try again.`, 'error');
    const retry = makeNode('button', 'secondary-btn', 'Retry loading listings');
    retry.type = 'button';
    retry.addEventListener('click', loadProperties);
    propertyStatus.append(' ');
    propertyStatus.append(retry);
  }
};

if (propertyList) loadProperties();

if (enquiryForm) {
  enquiryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!selectedPropertyId) {
      setStatus(enquiryStatus, 'Select a property before sending an enquiry.', 'error');
      return;
    }
    const submit = enquiryForm.querySelector('[type="submit"]');
    submit.disabled = true;
    setStatus(enquiryStatus, 'Sending your enquiry…', 'loading');
    const body = {
      name: document.getElementById('enquiry-name').value.trim(),
      email: document.getElementById('enquiry-email').value.trim(),
      phone: document.getElementById('enquiry-phone').value.trim(),
      property_id: selectedPropertyId,
      message: document.getElementById('enquiry-message').value.trim()
    };
    try {
      const payload = await apiError(await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body)
      }));
      setStatus(enquiryStatus, payload.message || 'Your enquiry was submitted successfully.', 'success');
      enquiryForm.reset();
      selectedPropertyId = '';
    } catch (error) {
      setStatus(enquiryStatus, error.message || 'We could not submit your enquiry. Please try again.', 'error');
    } finally {
      submit.disabled = false;
    }
  });
  document.getElementById('cancel-enquiry').addEventListener('click', () => {
    enquiryForm.hidden = true;
    enquiryForm.reset();
    selectedPropertyId = '';
    setStatus(enquiryStatus, '', '');
  });
}

const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-form-status');
if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = {
      name: document.getElementById('contact-name').value.trim(),
      email: document.getElementById('contact-email').value.trim(),
      subject: document.getElementById('contact-subject').value.trim(),
      message: document.getElementById('contact-message').value.trim()
    };
    if (!body.name || !body.email || !body.message) {
      setStatus(contactStatus, 'Please enter your name, a valid email address, and a message.', 'error');
      return;
    }
    const submit = document.getElementById('contact-submit-btn');
    submit.disabled = true;
    setStatus(contactStatus, 'Submitting your message…', 'loading');
    try {
      const payload = await apiError(await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body)
      }));
      setStatus(contactStatus, payload.message || 'Thank you. Your message was saved successfully.', 'success');
      contactForm.reset();
    } catch (error) {
      setStatus(contactStatus, error.message || 'Your message could not be submitted. Please try again.', 'error');
    } finally {
      submit.disabled = false;
    }
  });
}
