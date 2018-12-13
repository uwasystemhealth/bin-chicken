import users from './users';

const Configs = {
  configs: [],
  lecerts: {},
  clearCerts() {
    while(Configs.lecerts.length) Configs.lecerts.pop();
  },
  async getCerts() {
    if(!users.user) return Configs.users;
    const res = await fetch('/api/lecerts');
    const certs = await res.json();
    Configs.clearCerts();
    Object.keys(certs).forEach(i => Configs.lecerts.push(certs[i]));
    return Configs.configs;
  },
  clearConfigs() {
    while(Configs.configs.length) Configs.configs.pop();
  },
  async getConfigs() {
    if(!users.user) return Configs.users;
    const res = await fetch('/api/config/');
    const configs = await res.json();
    Configs.clearConfigs();
    configs.forEach(user => Configs.configs.push(user));
    return Configs.configs;
  },
  async getConfig(id) {
    if(!users.user) return null;
    const res = await fetch(`/api/config/${id}`);
    const config = await res.json();
    return config;
  },
  async createConfig(data) {
    if(!users.user || !users.user.isAdmin) throw new Error('Insufficent permissions to perform Configs action.');
    const res = await fetch('/api/config/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: { data },
    });
    const config = await res.json();
    await Configs.getConfigs();
    return config;
  },
  async patchConfig(id, data) {
    if(!users.user || !users.user.isAdmin) throw new Error('Insufficent permissions to perform Configs action.');
    const res = await fetch(`/api/config/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    });
    const config = await res.json();
    await Configs.getConfigs();
    return config;
  },
  async deleteConfig(id) {
    if(!users.user || !users.user.isAdmin) throw new Error('Insufficent permissions to perform Configs action.');
    const res = await fetch(`/api/config/${id}`, {
      method: 'DELETE',
    });
    const config = await res.json();
    await Configs.getConfigs();
    return config;
  },
};

users.on('login', async () => { await Configs.getConfigs(); await Configs.getCerts(); });
users.on('logout', async () => { await Configs.clearConfigs(); await Configs.clearCerts(); });

export default Configs;
