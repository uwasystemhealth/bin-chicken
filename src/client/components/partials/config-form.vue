<template>
  <vk-modal center :show.sync="show">
    <vk-modal-close @click="show = false"></vk-modal-close>
    <form class="uk-form-stacked" @submit.prevent="save">
      <legend v-if="initial" class="uk-legend">Create New Config.</legend>
      <legend v-else class="uk-legend">Edit Config for {{config.domain}}.</legend>
      <p>{{config}}</p>
      <div class="uk-margin">
        <label class="uk-form-label" :for="`${config._id}-domain`">Domain Name</label>
        <div class="uk-form-controls">
          <input class="uk-input" :id="`${config._id}-domain`" name="domain" type="text" :readonly="!initial" placeholder="sub.example.com" v-model="config.domain">
        </div>
      </div>
      <div class="uk-margin">
        <label class="uk-form-label" :for="`${config._id}-type`">Config Type</label>
        <div class="uk-form-controls">
          <select class="uk-select" :id="`${config._id}-type`" name="type" required :readonly="readonly" v-model="config.type">
            <option>proxy</option>
            <option>redirect</option>
          </select>
        </div>
      </div>
      <div class="uk-margin">
        <div class="uk-form-controls">
          <label><input class="uk-checkbox" type="checkbox" name="idiotProof" v-model="config.idiotProof" :readonly="readonly"> Is idiot proof? (redirect 'www.')</label>
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
          ></textarea>
        </div>
      </div>

      <div class="uk-margin">
        <div class="uk-form-controls">
          <label><input class="uk-checkbox" type="checkbox" name="leEnabled" v-model="leEnabled" :readonly="readonly"> Use let's encrypt?</label>
        </div>
      </div>
      <div class="uk-margin" v-if="leEnabled">
        <div class="uk-form-controls">
          <label><input class="uk-checkbox" type="checkbox" name="leUpgrade" v-model="config.leUpgrade" :readonly="readonly"> Redirect HTTP to HTTPS?</label>
        </div>
      </div>
      <div class="uk-margin" v-if="leEnabled">
        <label class="uk-form-label" :for="`${config._id}-leDomain`">Let's Encrypt Cert</label>
        <div class="uk-form-controls">
          <select class="uk-select" :id="`${config._id}-leDomain`" name="leDomain" v-model="config.leDomain" :readonly="readonly">
            <option
              v-if="lecertsFiltered.length"
              v-for="led in lecertsFiltered"
              :key="led.name"
              value="led.name"
            >{{led.name}}</option>
            <option v-else disabled value="">No match found for the specified domain.</option>
          </select>
        </div>
      </div>

      <div class="uk-margin" v-if="config.type === 'proxy'">
        <label class="uk-form-label" :for="`${config._id}-host`">Proxy Host</label>
        <div class="uk-form-controls">
          <input class="uk-input" :id="`${config._id}-host`" name="host" type="text" placeholder="localhost" v-model="config.host" :readonly="readonly">
        </div>
      </div>
      <div class="uk-margin" v-if="config.type === 'proxy'">
        <label class="uk-form-label" :for="`${config._id}-port`">Proxy Port</label>
        <div class="uk-form-controls">
          <a class="uk-form-icon uk-form-icon-flip" v-if="initial" @click.prevent="genPort" href="#" uk-icon="icon: refresh" uk-tooltip="title: Generate Port"></a>
          <input class="uk-input" :id="`${config._id}-port`" name="port" type="number" placeholder="1234" min="1024" max="65535" v-model="config.port" :readonly="readonly">
        </div>
      </div>

      <div class="uk-margin" v-if="config.type === 'redirect'">
        <label class="uk-form-label" :for="`${config._id}-redirect`">Redirect URL</label>
        <div class="uk-form-controls">
          <input class="uk-input" :id="`${config._id}-redirect`" name="redirect" type="url" placeholder="https://www.redirect.com/interesting/page" v-model="config.redirect" :readonly="readonly">
        </div>
      </div>
      <div class="uk-margin" v-if="config.type === 'redirect'">
        <div class="uk-form-controls">
          <label><input class="uk-checkbox" type="checkbox" name="permanent" v-model="config.permanent" :readonly="readonly"> Permanent 301 redirect? (302 otherwise) (tells browser to cache response)</label>
        </div>
      </div>
      <div class="uk-margin" v-if="config.type === 'redirect'">
        <div class="uk-form-controls">
          <label><input class="uk-checkbox" type="checkbox" name="preserve" v-model="config.preserve" :readonly="readonly"> Preserve request? (keep stuff at the end like "/interesting/page?query=1#heading")</label>
        </div>
      </div>

      <div class="uk-margin">
        <label class="uk-form-label" :for="`${config._id}-owner`">Owner</label>
        <div class="uk-form-controls">
          <input class="uk-input" :id="`${config._id}-owner`" name="owner" type="text" readonly :value="owner ? owner.fullname : 'Unknown'">
        </div>
      </div>

      <button class="uk-button uk-button-default uk-modal-close" type="button" @click="show = false">Cancel</button>
      <button class="uk-button uk-button-success" type="submit" v-if="!readonly">Save</button>
    </form>
  </vk-modal>
</template>

<script>
import users from '@/users';
import configs from '@/configs';

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};

const defConf = {
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
  collabs: [],
};

export default {
  props: ['conf', 'show'],
  data() {
    return {
      users: users.users,
      initial: !this.conf,
      leEnabled: (this.conf ? !!this.conf.leDomain : true),
      config: {...(this.conf ? this.conf : defConf)},
    };
  },
  computed: {
    readonly() { return !users.user.isAdmin && this.config.owner !== users.user._id; },
    owner() { return users.users.find(u=>u._id === this.config.owner); },
    lecertsFiltered() {
      return !this.config.leDomain
      ? configs.lecerts
      : configs.lecerts.filter(c => RegExp(`$${c.name.replace('*', '[\\w.-]+')}^`, 'i').test(this.config.leDomain));
    },
  },
  watch: {
    show(v) { this.$emit('update:show', v); },
  },
  methods: {
    genPort() {
      this.config.port = getRandomInt(3000, 9000);
      while(!!configs.find(c => c.port === this.config.port)){
        this.config.port = getRandomInt(3000, 9000);
      }
    },
    async save() {
      if(!this.config._id) await configs.createConfig(this.config);
      else await configs.patchConfig(this.config._id, this.config);
      this.show = false;
    },
  },
  mounted() {
    defConf.owner = users.user._id;
    if (this.initial) this.config.owner = users.user._id;
  },
};
</script>
