export default {
  loggedIn: false,
  user: null,
  users: [],
  listeners: {},
  loading: false,
  async login(username, password) {
    this.loading = true;
    const res = await fetch('/api/login/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const user = await res.json();
    this.loading = false;
    if(user.success === false) throw new Error('user.message');
    if(res.status !== 200) throw new Error('Invalid Login');
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
    this.loading = true;
    const res = await fetch('/api/logout/');
    const result = await res.json();
    this.loading = false;
    if(!result.success) throw new Error(result.message);
    while(this.users.length) this.users.pop();
    await this.emit('logout');
    this.user = null;
    this.loggedIn = false;
    return result.success;
  },
  async getUsers() {
    if(!this.user) return this.users;
    this.loading = true;
    const res = await fetch('/api/user/', {
      credentials: 'include',
    });
    if(res.status !== 200) return [];
    const users = await res.json();
    this.loading = false;
    if(users.success === false) throw new Error(users.message);
    while(this.users.length) this.users.pop();
    users.forEach(user => this.users.push(user));
    return this.users;
  },
  async getUser(id) {
    if(!this.user) return null;
    this.loading = true;
    const res = await fetch(`/api/user/${id}`, {
      credentials: 'include',
    });
    if(res.status !== 200) return null;
    const user = await res.json();
    this.loading = false;
    if(user.success === false) throw new Error(user.message);
    return user;
  },
  async createUser(username) {
    if(!this.user || !this.user.isAdmin) throw new Error('insufficent permissions to perform this action.');
    this.loading = true;
    const res = await fetch('/api/user/', {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    if(res.status !== 200) return null;
    const user = await res.json();
    this.loading = false;
    if(user.success === false) throw new Error(user.message);
    await this.getUsers();
    return user;
  },
  async patchUser(id, data) {
    if(!this.user || !this.user.isAdmin) throw new Error('insufficent permissions to perform this action.');
    this.loading = true;
    const res = await fetch(`/api/user/${id}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if(res.status !== 200) return null;
    const user = await res.json();
    this.loading = false;
    if(user.success === false) throw new Error(user.message);
    await this.getUsers();
    return user;
  },
  async deleteUser(id) {
    if(!this.user || !this.user.isAdmin) throw new Error('insufficent permissions to perform this action.');
    this.loading = false;
    const res = await fetch(`/api/user/${id}`, {
      credentials: 'include',
      method: 'DELETE',
    });
    if(res.status !== 200) return null;
    const user = await res.json();
    this.loading = false;
    if(user.success === false) throw new Error(user.message);
    await this.getUsers();
    return user;
  },
};
