<template>
  <vk-card>
    <div uk-grid>
      <div class="uk-text-lead" style="padding-left: 0;">
        Configs
        <span style="float: right;">
          <vk-icon-link v-if="!configs.loading" href="#" icon="refresh" v-vk-tooltip="'Refresh'" @click.prevent="configs.getConfigs()" />
          <vk-spinner v-else />
          <vk-icon-link v-if="user.isAdmin || user.canCreate" href="#" icon="plus" v-vk-tooltip="'Add Config'" @click.prevent="create = true;" />
          <config-form v-if="user.isAdmin || user.canCreate" :show.sync="create" />
        </span>
      </div>
    </div>
    <vk-table :data="configsData" hoverable responsive>
      <vk-table-column title="Domain Name" cell="domain" expanded />
      <vk-table-column title="Type" cell="type" />
      <vk-table-column title="Target" cell="target" />
      <vk-table-column title="HTTPS?" cell="leDomain">
        <div slot-scope="{ cell }">
          <vk-icon v-if="cell" icon="check" />
          <vk-icon v-else icon="close" />
        </div>
      </vk-table-column>
      <vk-table-column title="Owner" cell="ownerName">
        <div slot-scope="{ cell }" class="uk-text-capitalize">
          {{cell}}
        </div>
      </vk-table-column>
      <vk-table-column title="Actions" cell="config">
        <div slot-scope="{ cell }">
          <vk-icon-link
            href="#"
            :icon="cell.perm !== 'none' ? 'pencil' : 'info'"
            v-vk-tooltip="cell.perm !== 'none' ? 'Edit Config' : 'View Config'"
            @click.prevent="edit = cell._id"
          />
          <vk-icon-link
            v-if="cell.perm === 'admin'"
            href="#"
            icon="trash"
            v-vk-tooltip="'Delete Config'"
            @click.prevent="del = cell._id"
          />
          <vk-modal v-if="cell.perm === 'admin'" center :show="del === cell._id">
            <vk-modal-title slot="header">Remove Config for {{cell.domain}}?! ARE YOU SURE!?</vk-modal-title>
            <div slot="footer" class="uk-text-right">
              <vk-button @click.stop="del = ''">Cancel</vk-button>
              <vk-button
                type="danger"
                :disabled="configs.loading"
                @click.stop="if(!configs.loading) {
                  configs.deleteConfig(cell._id);
                  del = '';
                }"
              >
                <vk-spinner v-if="configs.loading" />
                <span v-else>Delete Forever</span>
              </vk-button>
            </div>
          </vk-modal>
          <config-form :conf="cell" :show="edit === cell._id" @update:show="if(!$event) edit = '';" />
        </div>
      </vk-table-column>
    </vk-table>
  </vk-card>
</template>

<script>
import configs from '@/configs';
import users from '@/users';
import configForm from './partials/config-form';

export default {
  components: {
    configForm,
  },
  data() {
    return {
      edit: '',
      del: '',
      create: false,
      configs,
      user: users.user,
    };
  },
  computed: {
    configsData() {
      return configs.configs.map((c) => {
        const owner = users.users.find(u => u._id === c.owner);
        return {
          ...c,
          config: c,
          target: c.type === 'proxy' ? `${c.host}:${c.port}` : c.redirect,
          ownerName: !owner ? 'Unknown' : `${owner.fullname} (${owner.username})` || owner.username,
        };
      });
    },
  },
  methods: {
    show(id, type = 'edits') {
      Object.keys(this[type]).forEach((i) => { this[type][i] = false; });
      this[type][id] = true;
    },
  },
};
</script>

