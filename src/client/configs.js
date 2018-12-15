import users from './users';

const Configs = {
  configs: [],
  lecerts: [],
  loading: false,
  clearCerts() {
    while(Configs.lecerts.length) Configs.lecerts.pop();
  },
  async getCerts() {
    if(!users.user) return Configs.lecerts;
    this.loading = true;
    const res = await fetch('/api/lecerts', {
      credentials: 'include',
    });
    const certs = await res.json();
    Configs.clearCerts();
    Object.keys(certs).forEach(i => Configs.lecerts.push(certs[i]));
    this.loading = false;
    return Configs.lecerts;
  },
  clearConfigs() {
    while(Configs.configs.length) Configs.configs.pop();
  },
  async getConfigs() {
    if(!users.user) return Configs.configs;
    this.loading = true;
    const res = await fetch('/api/config/', {
      credentials: 'include',
    });
    const configs = await res.json();
    if(configs.success === false) throw new Error(configs.message);
    Configs.clearConfigs();
    configs.forEach(user => Configs.configs.push(user));
    this.loading = false;
    return Configs.configs;
  },
  async getConfig(id) {
    if(!users.user) return null;
    this.loading = true;
    const res = await fetch(`/api/config/${id}`, {
      credentials: 'include',
    });
    const config = await res.json();
    this.loading = false;
    if(config.success === false) throw new Error(config.message);
    return config;
  },
  async createConfig(data) {
    if(!users.user || (!users.user.isAdmin && !users.user.canCreate)) throw new Error('Insufficent permissions to perform Configs action.');
    this.loading = true;
    const res = await fetch('/api/config/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const config = await res.json();
    this.loading = false;
    if(config.success === false) throw new Error(config.message);
    await Configs.getConfigs();
    return config;
  },
  async patchConfig(id, data) {
    const existing = this.configs.find(c => c._id === id);
    if(!existing) throw new Error('Config was not found');
    if(!users.user || existing.perm === 'none') throw new Error('Insufficent permissions to perform Configs action.');
    this.loading = true;
    const res = await fetch(`/api/config/${id}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const config = await res.json();
    this.loading = false;
    if(config.success === false) throw new Error(config.message);
    await Configs.getConfigs();
    return config;
  },
  async deleteConfig(id) {
    const existing = this.configs.find(c => c._id === id);
    if(!existing) throw new Error('Config was not found');
    if(!users.user || existing.perm !== 'admin') throw new Error('Insufficent permissions to perform Configs action.');
    this.loading = true;
    const res = await fetch(`/api/config/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const config = await res.json();
    this.loading = false;
    if(config.success === false) throw new Error(config.message);
    await Configs.getConfigs();
    return config;
  },
  async previewConfig(data) {
    if(!users.user) return '';
    this.loading = true;
    const res = await fetch('/api/config/render/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const render = await res.text();
    this.loading = false;
    return render;
  },
  async testConfig(data) {
    if(!users.user) return '';
    this.loading = true;
    const res = await fetch('/api/config/test/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const render = await res.text();
    this.loading = false;
    return render;
  },
};

users.on('login', async () => { await Configs.getConfigs(); await Configs.getCerts(); });
users.on('logout', async () => { await Configs.clearConfigs(); await Configs.clearCerts(); });

export default Configs;
