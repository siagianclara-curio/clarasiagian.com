(function () {
  'use strict';

  const page = window.location.pathname.replace(/.*\//, '') || 'index.html';

  if (page === 'index.html' || page === '') {
    loadJSON('data/site.json').then(renderProfile);
  } else if (page === 'projects.html') {
    loadText('data/projects.csv').then(function (text) {
      renderCards(parseCSV(text), 'projects');
    });
  } else if (page === 'publications.html') {
    loadText('data/publications.csv').then(function (text) {
      renderCards(parseCSV(text), 'publications');
    });
  } else if (page === 'collaborate.html') {
    loadJSON('data/site.json').then(renderCollaborate);
  }

  // ── Loaders ───────────────────────────────────────────────────────────────

  function loadJSON(url) {
    return fetch(url)
      .then(function (r) { if (!r.ok) throw new Error(url); return r.json(); })
      .catch(function (e) { console.error('[render.js]', e); });
  }

  function loadText(url) {
    return fetch(url)
      .then(function (r) { if (!r.ok) throw new Error(url); return r.text(); })
      .catch(function (e) { console.error('[render.js]', e); });
  }

  // ── Profile page ──────────────────────────────────────────────────────────

  function renderProfile(data) {
    if (!data) return;

    setText('profile-name', data.name);
    setText('profile-title', data.title);
    setText('profile-institution', data.institution);
    setText('profile-bio', data.bio);

    if (data.photo) {
      const img = document.getElementById('profile-photo');
      if (img) img.src = data.photo;
    }

    if (Array.isArray(data.interests)) {
      const container = document.getElementById('interests-list');
      if (container) {
        container.innerHTML = '';
        data.interests.forEach(function (interest) {
          const span = document.createElement('span');
          span.className = 'tag';
          span.textContent = interest;
          container.appendChild(span);
        });
      }
    }

    if (data.links) {
      const ul = document.getElementById('links-list');
      if (ul) {
        ul.innerHTML = '';
        const defs = [
          { key: 'scholar',      label: 'Google Scholar' },
          { key: 'orcid',        label: 'ORCID' },
          { key: 'researchgate', label: 'ResearchGate' },
          { key: 'linkedin',     label: 'LinkedIn' },
          { key: 'email',        label: 'Email', isEmail: true },
        ];
        defs.forEach(function (def) {
          const val = data.links[def.key];
          if (!val) return;
          const a = document.createElement('a');
          a.textContent = def.label;
          if (def.isEmail) {
            a.href = 'mailto:' + val;
          } else {
            a.href = val;
            a.target = '_blank';
            a.rel = 'noopener';
          }
          const li = document.createElement('li');
          li.appendChild(a);
          ul.appendChild(li);
        });
      }
    }
  }

  // ── Collaborate page ──────────────────────────────────────────────────────

  function renderCollaborate(data) {
    if (!data) return;
    setText('collaborate-intro', data.collaborate_intro);
    if (data.formspree_id && data.formspree_id !== 'YOUR_FORM_ID') {
      const form = document.getElementById('contact-form');
      if (form) form.action = 'https://formspree.io/f/' + data.formspree_id;
    }
  }

  // ── Card pages (projects + publications) ──────────────────────────────────

  function renderCards(rows, type) {
    const container = document.getElementById('card-list');
    if (!container || !rows) return;

    rows.forEach(function (row) {
      const card = type === 'publications'
        ? buildPublicationCard(row)
        : buildProjectCard(row);
      if (card) container.appendChild(card);
    });

    if (container.childElementCount === 0) {
      container.innerHTML = '<p style="color:#999;">No entries yet.</p>';
    }
  }

  function buildProjectCard(row) {
    if (!row.title) return null;
    const card = el('div', 'card');
    card.appendChild(el('p', 'card-title', row.title));
    const meta = row.years + (row.status ? ' · ' + row.status : '');
    card.appendChild(el('p', 'card-meta', meta));
    if (row.description) card.appendChild(el('p', 'card-desc', row.description));
    if (row.url) {
      const a = el('a', 'card-link', 'View project →');
      a.href = row.url;
      a.target = '_blank';
      a.rel = 'noopener';
      card.appendChild(a);
    }
    return card;
  }

  function buildPublicationCard(row) {
    if (!row.title) return null;
    const card = el('div', 'card');
    card.appendChild(el('p', 'card-title', '“' + row.title + '”'));

    const meta = document.createElement('p');
    meta.className = 'card-meta';
    meta.appendChild(document.createTextNode(row.authors + ' · '));
    const venue = document.createElement('em');
    venue.textContent = row.venue;
    meta.appendChild(venue);
    meta.appendChild(document.createTextNode(' · ' + row.year));
    card.appendChild(meta);

    if (row.url) {
      const a = el('a', 'card-link', 'Read paper →');
      a.href = row.url;
      a.target = '_blank';
      a.rel = 'noopener';
      card.appendChild(a);
    }
    return card;
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function setText(id, text) {
    const node = document.getElementById(id);
    if (node && text != null) node.textContent = text;
  }

  function parseCSV(text) {
    if (!text) return [];
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = parseRow(lines[0]);
    return lines.slice(1)
      .map(function (line) {
        const values = parseRow(line);
        const obj = {};
        headers.forEach(function (h, i) { obj[h] = (values[i] || '').trim(); });
        return obj;
      })
      .filter(function (row) { return row[headers[0]]; });
  }

  function parseRow(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

}());
