<template>
  <vk-modal center :show="show" @update:show="$emit('update:show', $event)">
    <vk-modal-close @click="show = false" />
    <form class="uk-form-stacked" @submit.prevent="save">
      <legend v-if="initial" class="uk-legend">Create New Config.</legend>
      <legend v-else class="uk-legend">Edit Config for {{config.domain}}.</legend>
      <vk-tabs :activeTab.sync="tab">
        <vk-tabs-item title="edit">
          <span v-if="errMsg" class="uk-text-danger">{{errMsg}}</span>
          <div class="uk-margin">
            <label class="uk-form-label" :for="`${config._id}-domain`">Domain Name*</label>
            <div class="uk-form-controls">
              <input
                class="uk-input"
                :id="`${config._id}-domain`"
                name="domain"
                type="text"
                :readonly="!initial"
                placeholder="sub.example.com"
                v-model="config.domain"
                required
              >
            </div>
          </div>
          <div class="uk-margin">
            <label class="uk-form-label" :for="`${config._id}-type`">Config Type</label>
            <div class="uk-form-controls">
              <select class="uk-select" :id="`${config._id}-type`" name="type" required :disabled="readonly" v-model="config.type">
                <option>proxy</option>
                <option>redirect</option>
              </select>
            </div>
          </div>

          <hr>

          <div class="uk-margin">
            <div class="uk-form-controls">
              <label>
                <input
                  class="uk-checkbox"
                  type="checkbox"
                  name="idiotProof"
                  v-model="config.idiotProof"
                  :disabled="readonly"
                >
                Is idiot proof? (redirect 'www.')
              </label>
            </div>
          </div>
          <div class="uk-margin">
            <label class="uk-form-label" :for="`${config._id}-aliases`">Domain Aliases</label>
            <small>Comma sepatated list, these will redirect to the main domain.</small>
            <div class="uk-form-controls">
              <textarea
                class="uk-textarea"
                :id="`${config._id}-aliases`"
                name="aliases"
                placeholder="alias.example.com, alias2.example.com"
                :value="config.aliases ? config.aliases.join(',\n') : ''"
                @input="config.aliases = $event.target.value.replace(/\s/g, '').split(',')"
                :readonly="readonly"
              />
            </div>
          </div>

          <hr>

          <div class="uk-margin">
            <div class="uk-form-controls">
              <label>
                <input class="uk-checkbox" type="checkbox" name="leEnabled" v-model="leEnabled" :disabled="readonly"> Use let's encrypt?
              </label>
            </div>
          </div>
          <div class="uk-margin" v-if="leEnabled">
            <div class="uk-form-controls">
              <label>
                <input class="uk-checkbox" type="checkbox" name="leUpgrade" v-model="config.leUpgrade" :disabled="readonly"> Redirect HTTP to HTTPS?
              </label>
            </div>
          </div>
          <div class="uk-margin" v-if="leEnabled">
            <label class="uk-form-label" :for="`${config._id}-leDomain`">Let's Encrypt Cert</label>
            <small>Compatible certificates will appear for the domain you type in.</small>
            <div class="uk-form-controls">
              <select class="uk-select" :id="`${config._id}-leDomain`" name="leDomain" v-model="config.leDomain" :disabled="readonly">
                <option v-if="lecertsFiltered.length" value="">None Selected, Select one.</option>
                <!-- eslint-disable vue/no-use-v-if-with-v-for -->
                <option
                  v-if="lecertsFiltered.length"
                  v-for="led in lecertsFiltered"
                  :key="led.name"
                  :value="led.name"
                >
                  {{led.name}}
                </option>
                <!-- eslint-enable -->
                <option v-if="!lecertsFiltered.length" value="">No match found for the specified domain.</option>
              </select>
            </div>
          </div>

          <hr>

          <vk-grid v-if="config.type === 'proxy'" class="uk-margin">
            <div class="uk-width-1-1 uk-width-3-4@m">
              <label class="uk-form-label" :for="`${config._id}-host`">Proxy Host*</label>
              <div class="uk-form-controls">
                <input
                  class="uk-input"
                  :id="`${config._id}-host`"
                  name="host"
                  type="text"
                  placeholder="localhost"
                  v-model="config.host"
                  :readonly="readonly"
                  :required="config.type === 'proxy'"
                >
              </div>
            </div>
            <div class="uk-width-1-1 uk-width-1-4@m">
              <label class="uk-form-label" :for="`${config._id}-port`">Proxy Port*</label>
              <div class="uk-form-controls">
                <div class="uk-inline">
                  <vk-icon-link
                    class="uk-form-icon uk-form-icon-flip"
                    v-if="initial"
                    @click.prevent="genPort"
                    href="#"
                    icon="refresh"
                    v-vk-tooltip="'Generate Port'"
                  />
                  <input
                    class="uk-input"
                    :id="`${config._id}-port`"
                    name="port"
                    type="number"
                    placeholder="1234"
                    min="1024"
                    max="65535"
                    v-model="config.port"
                    :readonly="readonly"
                    :required="config.type === 'proxy'"
                  >
                </div>
              </div>
            </div>
          </vk-grid>

          <div class="uk-margin" v-if="config.type === 'redirect'">
            <label class="uk-form-label" :for="`${config._id}-redirect`">Redirect URL*</label>
            <div class="uk-form-controls">
              <input
                class="uk-input"
                :id="`${config._id}-redirect`"
                name="redirect"
                type="url"
                placeholder="https://www.redirect.com/interesting/page"
                v-model="config.redirect"
                :readonly="readonly"
                :required="config.type === 'redirect'"
              >
            </div>
          </div>
          <div class="uk-margin" v-if="config.type === 'redirect'">
            <div class="uk-form-controls">
              <label>
                <input
                  class="uk-checkbox"
                  type="checkbox"
                  name="permanent"
                  v-model="config.permanent"
                  :disabled="readonly"
                >
                Permanent 301 redirect? (302 otherwise)<small> (tells browser to cache response)</small>
              </label>
            </div>
          </div>
          <div class="uk-margin" v-if="config.type === 'redirect'">
            <div class="uk-form-controls">
              <label>
                <input
                  class="uk-checkbox"
                  type="checkbox"
                  name="preserve"
                  v-model="config.preserve"
                  :disabled="readonly"
                >
                Preserve request? <small>(keep stuff at the end like "/interesting/page?query=1#heading")</small>
              </label>
            </div>
          </div>

          <hr>

          <div class="uk-margin">
            <label class="uk-form-label" :for="`${config._id}-owner`">Owner</label>
            <small v-if="config.perm === 'admin'">WARNING: If you change this, you will loose the ability to change it back!</small>
            <div class="uk-form-controls">
              <select
                class="uk-select"
                style="text-transform: capitalize;"
                :id="`${config._id}-owner`"
                name="owner"
                required
                :disabled="initial || config.perm !== 'admin'"
                v-model="config.owner"
              >
                <option v-for="u in collabs" :key="u._id" :value="u._id">{{`${u.fullname} (${u.username})` || u.username}}</option>
              </select>
            </div>
          </div>
          <div class="uk-margin">
            <label class="uk-form-label" :for="`${config._id}-collabs`">Collaborators</label>
            <small>These people will be/are able to edit the config, except changing the owner or the collaborators list.</small>
            <div class="uk-form-controls">
              <select
                class="uk-select"
                style="text-transform: capitalize;"
                :id="`${config._id}-collabs`"
                name="collabs"
                required
                multiple
                :disabled="initial || config.perm !== 'admin'"
                :value="config.collabs"
                @input="updateCollabs($event.target.value)"
              >
                <option
                  v-for="u in users"
                  :key="u._id" :value="u._id"
                  :disabled="u._id === config.owner"
                  :selected="config.collabs.indexOf(u._id) !== -1"
                >
                  {{`${u.fullname} (${u.username})` || u.username}}
                </option>
              </select>
            </div>
          </div>

          <hr>

          <div class="uk-text-right">
            <vk-button htmlType="button" @click.prevent="$emit('update:show', false)">Cancel</vk-button>
            <vk-button type="primary" htmlType="submit" v-if="!readonly" :disabled="!minimum || configs.loading">
              <vk-spinner v-if="configs.loading" />
              <span v-else>Save</span>
            </vk-button>
          </div>
        </vk-tabs-item>
        <vk-tabs-item title="preview" v-if="minimum"><pre><code>{{preview}}</code></pre></vk-tabs-item>
        <vk-tabs-item title="validate" v-if="minimum">
          <pre :style="`border-color: ${test.indexOf('test is successful') === -1 ? 'red' : 'lightgreen'};`"><code>{{test}}</code></pre>
        </vk-tabs-item>
      </vk-tabs>
    </form>
  </vk-modal>
</template>

<script>
import users from '@/users';
import configs from '@/configs';
import isEqual from 'lodash/isEqual';

const getRandomInt = (mini, maxi) => {
  const min = Math.ceil(mini);
  const max = Math.floor(maxi);
  return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
};

const defConf = {
  initial: true,
  domain: '',
  type: 'proxy',
  idiotProof: true,
  aliases: [],
  leUpgrade: true,
  leDomain: '',
  host: 'localhost',
  port: '',
  redirect: '',
  permanent: false,
  preserve: true,
  owner: null,
  collabs: null,
};

export default {
  props: { conf: { type: Object, default: () => defConf }, show: { type: Boolean } },
  data() {
    return {
      preview: 'Loading...',
      test: '',
      tab: 0,
      users: users.users,
      configs,
      initial: !!this.conf.initial,
      leEnabled: (this.conf ? !!this.conf.leDomain : true),
      config: {
        ...this.conf,
        owner: this.conf.owner || users.user._id,
        collabs: this.conf.collabs || [users.user._id],
      },
      errMsg: '',
    };
  },
  computed: {
    readonly() { return !this.initial && this.config.perm === 'none'; },
    collabs() { return users.users.filter(u => this.config.collabs.indexOf(u._id) !== -1); },
    lecertsFiltered() {
      const certs = !this.config.domain
        ? []
        : configs.lecerts.filter(c => !!c.domains.find(d =>
          // eslint-disable-next-line implicit-arrow-linebreak
          RegExp(`^${d.replace(/\./g, '\\.').replace('*', '[\\w.-]+')}$`, 'i').test(this.config.domain)));
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      if (!certs.find(c => c.name === this.config.leDomain)) this.config.leDomain = '';
      return certs;
    },
    minimum() {
      return /^[\w-]+\.[\w-.]+$/.test(this.config.domain)
        && ((this.config.type === 'proxy'
          && this.config.port
          && /^(localhost)|([\w-]+\.[\w-.]+)$/.test(this.config.host)
        ) || (this.config.type === 'redirect'
          && /^(https?:\/\/)([\w-]+\.[\w-.]+)((\/|\?).*)?$/.test(this.config.redirect)
        )
        );
    },
  },
  watch: {
    show(v) { this.$emit('update:show', v); },
    tab(v) { ([() => {}, this.genPreview, this.genTest])[v](); },
    leEnabled(v) { if(!v) this.config.leDomain = ''; },
  },
  mounted() {
    defConf.owner = users.user._id;
    if (this.initial) this.config.owner = users.user._id;
  },
  methods: {
    genPort() {
      this.config.port = getRandomInt(3000, 9000);
      while(configs.configs.find(c => c.port === this.config.port)) {
        this.config.port = getRandomInt(3000, 9000);
      }
    },
    async save() {
      if(!this.minimum || configs.loading) return;
      try {
        if(!this.config._id) await configs.createConfig(this.config);
        else {
          const config = {};
          Object.keys(this.config).forEach((i) => { if(!isEqual(this.conf[i], this.config[i])) config[i] = this.config[i]; });
          await configs.patchConfig(this.config._id, config);
        }
        this.$emit('update:show', false);
      } catch(err) {
        this.errMsg = err.message;
      }
    },
    async genPreview() {
      this.preview = 'Loading...';
      this.preview = await configs.previewConfig(this.config);
    },
    async genTest() {
      this.test = 'Loading...';
      this.test = await configs.testConfig(this.config);
    },
    updateCollabs(v) {
      const collabs = Array.isArray(v) ? v : [v];
      if(collabs.indexOf(this.config.owner) === -1) collabs.push(this.config.owner);
      this.config.collabs = collabs;
    },
  },
};
</script>
