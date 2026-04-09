(function () {
  const storageKey = 'rs-helpdesk-tickets-v1';
  const searchInput = document.getElementById('ticketSearch');
  const statusFilter = document.getElementById('statusFilter');
  const priorityFilter = document.getElementById('priorityFilter');
  const sortTickets = document.getElementById('sortTickets');
  const ticketList = document.getElementById('ticketList');
  const ticketDetail = document.getElementById('ticketDetail');
  const emptyState = document.getElementById('emptyState');
  const deskStats = document.getElementById('deskStats');
  const ticketForm = document.getElementById('newTicketForm');
  const formMessage = document.getElementById('formMessage');

  const priorityRank = {
    High: 3,
    Medium: 2,
    Low: 1
  };

  const seedTickets = [
    {
      id: 'RST-2001',
      requester: 'Maria P.',
      contact: 'maria@oaklanebakery.com',
      category: 'Troubleshooting',
      priority: 'High',
      status: 'In Progress',
      summary: 'Office laptop cannot connect to Wi-Fi',
      description: 'One employee laptop drops network every 5 minutes. Needs stable access for payment processing.',
      updatedAt: '2026-04-06T12:20:00.000Z',
      createdAt: '2026-04-06T11:35:00.000Z',
      assignedTo: 'Support Desk',
      channel: 'Phone',
      notes: [
        'Remote diagnostics started',
        'Driver reinstall in progress'
      ]
    },
    {
      id: 'RST-2002',
      requester: 'Harold J.',
      contact: '757-555-0112',
      category: 'Microsoft 365 and Google Workspace Help',
      priority: 'Medium',
      status: 'Awaiting Customer',
      summary: 'Password reset and mailbox sync issue',
      description: 'Mailbox password reset completed, but mobile app still not syncing on iPhone.',
      updatedAt: '2026-04-06T10:15:00.000Z',
      createdAt: '2026-04-06T09:42:00.000Z',
      assignedTo: 'Support Desk',
      channel: 'Email',
      notes: [
        'Reset credential and sent login steps',
        'Waiting for customer confirmation'
      ]
    },
    {
      id: 'RST-2003',
      requester: 'Diane T.',
      contact: 'diane.t@example.com',
      category: 'Security Support',
      priority: 'High',
      status: 'Open',
      summary: 'Security warning on accounting workstation',
      description: 'Antivirus popped a repeated warning after opening an email attachment. Needs immediate review.',
      updatedAt: '2026-04-06T13:00:00.000Z',
      createdAt: '2026-04-06T12:58:00.000Z',
      assignedTo: 'Unassigned',
      channel: 'Web Form',
      notes: []
    },
    {
      id: 'RST-2004',
      requester: 'Mark A.',
      contact: 'marka@shorelinehoa.org',
      category: 'Software and Hardware Support',
      priority: 'Low',
      status: 'Resolved',
      summary: 'Printer setup for front desk',
      description: 'Installed replacement office printer and confirmed wireless printing from two desktops.',
      updatedAt: '2026-04-05T17:25:00.000Z',
      createdAt: '2026-04-05T14:10:00.000Z',
      assignedTo: 'Support Desk',
      channel: 'On-site',
      notes: [
        'Driver installed',
        'Test pages printed successfully'
      ]
    }
  ];

  let tickets = loadTickets();
  let selectedTicketId = tickets[0] ? tickets[0].id : null;

  function loadTickets() {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        window.localStorage.setItem(storageKey, JSON.stringify(seedTickets));
        return seedTickets;
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : seedTickets;
    } catch (error) {
      return seedTickets;
    }
  }

  function saveTickets() {
    window.localStorage.setItem(storageKey, JSON.stringify(tickets));
  }

  function formatTime(iso) {
    const date = new Date(iso);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function renderStats(filtered) {
    const counts = {
      Open: 0,
      'In Progress': 0,
      'Awaiting Customer': 0,
      Resolved: 0
    };

    filtered.forEach(function (ticket) {
      if (counts[ticket.status] !== undefined) {
        counts[ticket.status] += 1;
      }
    });

    const total = filtered.length;
    deskStats.innerHTML = [
      statCard('Total', total, 'all'),
      statCard('Open', counts.Open, 'open'),
      statCard('In Progress', counts['In Progress'], 'progress'),
      statCard('Awaiting', counts['Awaiting Customer'], 'waiting'),
      statCard('Resolved', counts.Resolved, 'resolved')
    ].join('');
  }

  function statCard(label, value, type) {
    return '<article class="stat-card ' + type + '">' +
      '<h3>' + label + '</h3>' +
      '<p>' + value + '</p>' +
      '</article>';
  }

  function getFilteredTickets() {
    const query = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;
    const priority = priorityFilter.value;
    const sort = sortTickets.value;

    let filtered = tickets.filter(function (ticket) {
      const text = [ticket.id, ticket.requester, ticket.summary, ticket.category].join(' ').toLowerCase();
      const matchSearch = !query || text.indexOf(query) !== -1;
      const matchStatus = status === 'all' || ticket.status === status;
      const matchPriority = priority === 'all' || ticket.priority === priority;
      return matchSearch && matchStatus && matchPriority;
    });

    filtered = filtered.sort(function (a, b) {
      if (sort === 'updated-asc') {
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      }
      if (sort === 'priority-desc') {
        return priorityRank[b.priority] - priorityRank[a.priority] || new Date(b.updatedAt) - new Date(a.updatedAt);
      }
      if (sort === 'priority-asc') {
        return priorityRank[a.priority] - priorityRank[b.priority] || new Date(b.updatedAt) - new Date(a.updatedAt);
      }
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    return filtered;
  }

  function renderTickets() {
    const filtered = getFilteredTickets();
    renderStats(filtered);

    if (!filtered.length) {
      ticketList.innerHTML = '';
      emptyState.hidden = false;
      ticketDetail.innerHTML = '<h2>Ticket Details</h2><p>No ticket selected.</p>';
      return;
    }

    emptyState.hidden = true;

    if (!filtered.some(function (ticket) { return ticket.id === selectedTicketId; })) {
      selectedTicketId = filtered[0].id;
    }

    ticketList.innerHTML = filtered.map(function (ticket) {
      const selected = ticket.id === selectedTicketId ? ' is-active' : '';
      return (
        '<button class="ticket-item' + selected + '" data-id="' + ticket.id + '">' +
          '<div class="ticket-item-top">' +
            '<span class="ticket-id">' + ticket.id + '</span>' +
            badge(ticket.status, 'status') +
          '</div>' +
          '<h3>' + ticket.summary + '</h3>' +
          '<p>' + ticket.requester + ' - ' + ticket.category + '</p>' +
          '<div class="ticket-item-meta">' +
            badge(ticket.priority, 'priority') +
            '<span>Updated ' + formatTime(ticket.updatedAt) + '</span>' +
          '</div>' +
        '</button>'
      );
    }).join('');

    renderDetail();
  }

  function badge(label, type) {
    const className = label.toLowerCase().replace(/\s+/g, '-');
    return '<span class="badge ' + type + ' ' + className + '">' + label + '</span>';
  }

  function renderDetail() {
    const ticket = tickets.find(function (item) {
      return item.id === selectedTicketId;
    });

    if (!ticket) {
      ticketDetail.innerHTML = '<h2>Ticket Details</h2><p>Select a ticket to view details.</p>';
      return;
    }

    const noteList = ticket.notes.length
      ? '<ul class="detail-notes">' + ticket.notes.map(function (note) { return '<li>' + note + '</li>'; }).join('') + '</ul>'
      : '<p class="muted-note">No support notes yet.</p>';

    ticketDetail.innerHTML = (
      '<h2>' + ticket.id + '</h2>' +
      '<p class="detail-summary">' + ticket.summary + '</p>' +
      '<div class="detail-grid">' +
        '<p><strong>Requester:</strong> ' + ticket.requester + '</p>' +
        '<p><strong>Contact:</strong> ' + ticket.contact + '</p>' +
        '<p><strong>Category:</strong> ' + ticket.category + '</p>' +
        '<p><strong>Channel:</strong> ' + ticket.channel + '</p>' +
        '<p><strong>Assigned To:</strong> ' + ticket.assignedTo + '</p>' +
        '<p><strong>Updated:</strong> ' + formatTime(ticket.updatedAt) + '</p>' +
      '</div>' +
      '<p><strong>Description:</strong> ' + ticket.description + '</p>' +
      '<div class="detail-status-row">' +
        '<label for="statusUpdate"><strong>Status:</strong></label>' +
        '<select id="statusUpdate" data-id="' + ticket.id + '">' +
          statusOption('Open', ticket.status) +
          statusOption('In Progress', ticket.status) +
          statusOption('Awaiting Customer', ticket.status) +
          statusOption('Resolved', ticket.status) +
        '</select>' +
      '</div>' +
      '<h3>Support Notes</h3>' +
      noteList +
      '<form id="noteForm" class="note-form" data-id="' + ticket.id + '">' +
        '<label for="newNote">Add note</label>' +
        '<textarea id="newNote" name="newNote" rows="3" placeholder="Add progress notes for this ticket"></textarea>' +
        '<button type="submit">Save Note</button>' +
      '</form>'
    );

    const statusSelect = document.getElementById('statusUpdate');
    const noteForm = document.getElementById('noteForm');

    statusSelect.addEventListener('change', function (event) {
      const ticketId = event.target.dataset.id;
      const newStatus = event.target.value;
      updateTicket(ticketId, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    });

    noteForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const ticketId = event.target.dataset.id;
      const noteField = event.target.elements.newNote;
      const note = noteField.value.trim();

      if (!note) {
        return;
      }

      const existing = tickets.find(function (item) {
        return item.id === ticketId;
      });

      const updatedNotes = existing.notes.concat(note);
      updateTicket(ticketId, {
        notes: updatedNotes,
        updatedAt: new Date().toISOString()
      });
      noteField.value = '';
    });
  }

  function statusOption(label, current) {
    const selected = label === current ? ' selected' : '';
    return '<option value="' + label + '"' + selected + '>' + label + '</option>';
  }

  function updateTicket(id, updates) {
    tickets = tickets.map(function (ticket) {
      return ticket.id === id ? Object.assign({}, ticket, updates) : ticket;
    });
    saveTickets();
    renderTickets();
  }

  function createTicket(values) {
    const highest = tickets.reduce(function (max, ticket) {
      const value = Number(ticket.id.split('-')[1]);
      return Math.max(max, value);
    }, 2000);

    const now = new Date().toISOString();
    const id = 'RST-' + String(highest + 1);

    return {
      id: id,
      requester: values.requester,
      contact: values.contact,
      category: values.category,
      priority: values.priority,
      status: 'Open',
      summary: values.summary,
      description: values.description,
      updatedAt: now,
      createdAt: now,
      assignedTo: 'Unassigned',
      channel: 'Web Form',
      notes: []
    };
  }

  ticketList.addEventListener('click', function (event) {
    const button = event.target.closest('.ticket-item');
    if (!button) {
      return;
    }

    selectedTicketId = button.dataset.id;
    renderTickets();
  });

  [searchInput, statusFilter, priorityFilter, sortTickets].forEach(function (control) {
    control.addEventListener('input', renderTickets);
    control.addEventListener('change', renderTickets);
  });

  ticketForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(ticketForm);
    const values = {
      requester: String(formData.get('requester')).trim(),
      contact: String(formData.get('contactMethod')).trim(),
      category: String(formData.get('ticketCategory')).trim(),
      priority: String(formData.get('ticketPriority')).trim(),
      summary: String(formData.get('ticketSummary')).trim(),
      description: String(formData.get('ticketDescription')).trim()
    };

    if (!values.requester || !values.contact || !values.category || !values.priority || !values.summary || !values.description) {
      formMessage.textContent = 'Please complete all fields before submitting.';
      return;
    }

    const ticket = createTicket(values);
    tickets.unshift(ticket);
    selectedTicketId = ticket.id;
    saveTickets();
    ticketForm.reset();
    formMessage.textContent = 'Ticket ' + ticket.id + ' was added to the queue.';
    renderTickets();
  });

  renderTickets();
})();
