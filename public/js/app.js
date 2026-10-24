document.addEventListener('DOMContentLoaded', () => {
  fetchEvents();
  fetchStats();
});

async function fetchEvents() {
  const search = document.getElementById('search-input').value;
  const category = document.getElementById('category-filter').value;
  const url = `/api/events?search=${encodeURIComponent(search)}&category=${category}`;

  const res = await fetch(url);
  const result = await res.json();
  const list = document.getElementById('events-list');
  list.innerHTML = '';

  if (result.data.length === 0) {
    list.innerHTML = '<p>Uğun tədbir tapılmadı.</p>';
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  result.data.forEach(ev => {
    const isPast = ev.event_date < today;
    const div = document.createElement('div');
    div.className = `event-item ${isPast ? 'past' : ''}`;
    div.innerHTML = `
      <div>
        <h3>${ev.title} <span class="badge">${ev.category_name || 'Ümumi'}</span> ${isPast ? '(Keçmiş)' : '(Gələcək)'}</h3>
        <p>${ev.description || ''}</p>
        <small>📅 ${ev.event_date} ${ev.event_time} | 📍 ${ev.location} | 👥 Qeydiyyat: ${ev.registered_count}/${ev.max_capacity}</small>
      </div>
      <div>
        ${!isPast && ev.registered_count < ev.max_capacity ? `<button onclick="register(${ev.id})">Qeydiyyat</button>` : ''}
        <button style="background:#cc0000;" onclick="deleteEvent(${ev.id})">Sil</button>
      </div>
    `;
    list.appendChild(div);
  });
}

async function handleCreateEvent(e) {
  e.preventDefault();
  const payload = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    category_id: document.getElementById('category_id').value,
    event_date: document.getElementById('event_date').value,
    event_time: document.getElementById('event_time').value,
    location: document.getElementById('location').value,
    max_capacity: parseInt(document.getElementById('max_capacity').value)
  };

  const res = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    alert('Tədbir uğurla yaradıldı!');
    document.getElementById('event-form').reset();
    fetchEvents();
    fetchStats();
  } else {
    const err = await res.json();
    alert('Xəta: ' + err.error);
  }
}

async function register(eventId) {
  // Sadəlik üçün user_id = 1 götürülür
  const res = await fetch('/api/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: 1, event_id: eventId })
  });

  const data = await res.json();
  if (res.ok) {
    alert('Qeydiyyat uğurla tamamlandı!');
    fetchEvents();
    fetchStats();
  } else {
    alert(data.error);
  }
}

async function deleteEvent(id) {
  if (!confirm('Tədbiri silməyə əminsiniz?')) return;
  await fetch(`/api/events/${id}`, { method: 'DELETE' });
  fetchEvents();
  fetchStats();
}

async function fetchStats() {
  const res = await fetch('/api/stats');
  const { data } = await res.json();
  document.getElementById('stats-container').innerHTML = `
    <p><strong>Ümumi Tədbirlər:</strong> ${data.total_events} | <strong>Ümumi Qeydiyyatlar:</strong> ${data.total_registrations}</p>
  `;
}