let chatRooms = [];
let roomIdCounter = 1;

const usernameInput = document.getElementById('username');
const ownerInput = document.getElementById('owner');

// Update the hidden input whenever the username changes
usernameInput.addEventListener('input', () => {
  ownerInput.value = usernameInput.value.trim();
  refreshRoomList();
});

document.body.addEventListener('htmx:configRequest', (event) => {
  const { verb, path, target, parameters, triggeringEvent } = event.detail;
  const method = verb.toLowerCase();

  // ✅ Detect if this is the initial page load
  const isInitialLoad = !triggeringEvent && method === 'get' && path === '/rooms';

  // ✅ Skip username validation on initial load
  if (!usernameInput.value.trim() && !isInitialLoad) {
    alert('Please enter your username!');
    event.preventDefault();
    return;
  }

  // ✅ HTMX routing handlers
  if (method === 'get' && path === '/rooms') {
    event.preventDefault();
    sendHTML(renderRooms(), target);
  }

  if (method === 'post' && path === '/rooms') {
    event.preventDefault();
    createRoom(parameters, target);
  }

  if (method === 'delete' && path.startsWith('/rooms/')) {
    event.preventDefault();
    const roomId = parseInt(path.split('/')[2]);
    deleteRoom(roomId, target);
  }

  if (method === 'get' && path.startsWith('/rooms/edit/')) {
    event.preventDefault();
    const roomId = parseInt(path.split('/')[3]);
    sendHTML(renderEditForm(roomId), target);
  }

  if (method === 'put' && path.startsWith('/rooms/')) {
    event.preventDefault();
    const roomId = parseInt(path.split('/')[2]);
    updateRoom(roomId, parameters.room_name, target);
  }
});

function createRoom(params, target) {
  const roomName = params.room_name.trim();
  const owner = params.owner.trim();

  if (!owner || !roomName) {
    alert('Please fill in all fields!');
    return;
  }

  const exists = chatRooms.some(r => r.name.toLowerCase() === roomName.toLowerCase());
  if (exists) {
    alert('Room name must be unique!');
    return;
  }

  chatRooms.push({ id: roomIdCounter++, name: roomName, owner });
  sendHTML(renderRooms(), target);
}

function deleteRoom(roomId, target) {
  const currentUser = usernameInput.value.trim();
  const room = chatRooms.find(r => r.id === roomId);

  if (!room) {
    alert('Room not found!');
    return;
  }

  if (room.owner !== currentUser) {
    alert('You can only delete your own rooms.');
    return;
  }

  const confirmDelete = confirm(`Are you sure you want to delete the room "${room.name}"?`);
  if (!confirmDelete) {
    return;
  }

  chatRooms = chatRooms.filter(r => r.id !== roomId);
  sendHTML(renderRooms(), target);
}

function updateRoom(roomId, newName, target) {
  const room = chatRooms.find(r => r.id === roomId);
  const currentUser = usernameInput.value.trim();

  if (!room) return;

  if (room.owner !== currentUser) {
    alert('You can only edit your own rooms.');
    return;
  }

  if (!newName.trim()) {
    alert('Room name cannot be empty!');
    return;
  }

  const exists = chatRooms.some(r => r.name.toLowerCase() === newName.toLowerCase() && r.id !== roomId);
  if (exists) {
    alert('Another room already has this name!');
    return;
  }

  room.name = newName.trim();
  sendHTML(renderRooms(), target);
}

function renderRooms() {
  const currentUser = usernameInput.value.trim();
  let html = ``;

  if (chatRooms.length === 0) {
    html += `<p>No chat rooms yet...</p>`;
  } else {
    chatRooms.forEach(room => {
      const isOwner = room.owner === currentUser;
      html += `
        <div class="chat-room" id="room-${room.id}">
          <strong>${room.name}</strong>
          <small>Created by ${room.owner}</small>
          <div class="actions">
            ${isOwner ? `
              <button class="btn-secondary" hx-get="/rooms/edit/${room.id}" hx-target="#room-${room.id}" hx-swap="outerHTML">Edit</button>
              <button class="btn-danger" hx-delete="/rooms/${room.id}" hx-target="#room-list" hx-swap="innerHTML">Delete</button>
            ` : ''}
            <button class="btn-primary" onclick="joinRoom('${room.name}')">Join</button>
          </div>
        </div>
      `;
    });
  }

  return html;
}

function renderEditForm(roomId) {
  const room = chatRooms.find(r => r.id === roomId);
  const currentUser = usernameInput.value.trim();

  if (!room || room.owner !== currentUser) {
    return renderRooms();
  }

  return `
    <div class="chat-room" id="room-${room.id}">
      <form hx-put="/rooms/${room.id}" hx-target="#room-list" hx-swap="innerHTML">
        <div class="input-group">
          <input type="text" name="room_name" value="${room.name}" required />
          <div class="actions">
            <button type="submit" class="btn-primary">Save</button>
            <button type="button" class="btn-secondary" onclick="refreshRoomList()">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  `;
}

function refreshRoomList() {
  const roomList = document.querySelector('#room-list');
  if (roomList) {
    roomList.innerHTML = renderRooms();
    htmx.process(roomList);
  }
}

function sendHTML(html, target) {
  target.innerHTML = html;
  htmx.process(target);
}

function joinRoom(roomName) {
  alert(`Joining room: ${roomName}`);
}
