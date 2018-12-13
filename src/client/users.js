export default {
  loggedIn: false,
  user: null,
  users: [],
  listeners: {},
  async login(username, password) {
    const res = await fetch('/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    if(res.status !== 200) throw new Error('Invalid Login');
    const user = await res.json();
    this.user = user;
    this.loggedIn = true;
    await this.getUsers();
    await this.emit('login', this.user);
    return this.user;
  },
  on(event, listener) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  },
  async emit(event, data) {
    if (this.listeners[event]) await Promise.all(this.listeners[event].map(l => l(data)));
  },
  async logout() {
    const res = await fetch('/api/logout/');
    const result = await res.json();
    if(!result.success) throw new Error(result.message);
    while(this.users.length) this.users.pop();
    await this.emit('logout');
    this.user = null;
    this.loggedIn = false;
    return result.success;
  },
  async getUsers() {
    if(!this.user) return this.users;
    const res = await fetch('/api/user/');
    if(res.status !== 200) return [];
    const users = await res.json();
    while(this.users.length) this.users.pop();
    users.forEach(user => this.users.push(user));
    return this.users;
  },
  async getUser(id) {
    if(!this.user) return null;
    const res = await fetch(`/api/user/${id}`);
    if(res.status !== 200) return null;
    const user = await res.json();
    return user;
  },
  async createUser(username) {
    if(!this.user || !this.user.isAdmin) throw new Error('insufficent permissions to perform this action.');
    const res = await fetch('/api/user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: { username },
    });
    if(res.status !== 200) return null;
    const user = await res.json();
    await this.getUsers();
    return user;
  },
  async patchUser(id, data) {
    if(!this.user || !this.user.isAdmin) throw new Error('insufficent permissions to perform this action.');
    const res = await fetch(`/api/user/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    });
    if(res.status !== 200) return null;
    const user = await res.json();
    await this.getUsers();
    return user;
  },
  async deleteUser(id) {
    if(!this.user || !this.user.isAdmin) throw new Error('insufficent permissions to perform this action.');
    const res = await fetch(`/api/user/${id}`, {
      method: 'DELETE',
    });
    if(res.status !== 200) return null;
    const user = await res.json();
    await this.getUsers();
    return user;
  },
};
