<template>
  <vk-card>
    <div uk-grid>
      <div class="uk-text-lead" style="padding-left: 0;">
        Configs
        <span style="float: right;">
          <vk-icon-link href="javascript:;" icon="plus" v-vk-tooltip="'Add Config'" @click.stop="create = true;"/>
          <config-form :show.sync="create"/>
        </span>
      </div>
    </div>
    <vk-table :data="configsData" hoverable responsive>
      <vk-table-column title="Domain Name" cell="domain" expanded/>
      <vk-table-column title="Type" cell="type"/>
      <vk-table-column title="Target" cell="target"/>
      <vk-table-column title="Type" cell="type"/>
      <vk-table-column title="HTTPS?" cell="leDomain">
        <div slot-scope="{ cell }">
          <vk-icon v-if="cell" icon="check"/>
          <vk-icon v-else icon="close"/>
        </div>
      </vk-table-column>
      <vk-table-column title="Owner" cell="ownerName"/>
      <vk-table-column title="Actions" cell="config">
        <div slot-scope="{ cell }">
          <vk-icon-link href="javascript:;" icon="edit" v-vk-tooltip="'Edit Config'" @click.stop="show(cell._id)"/>
          <vk-icon-link href="javascript:;" icon="trash" v-vk-tooltip="'Delete Config'" @click.stop="show(cell._id, 'deletes')"/>
          <vk-modal center :show="deletes[cell._id]">
            <vk-modal-title slot="header">Remove Config for {{cell.domain}}?! ARE YOU SURE!?</vk-modal-title>
            <div slot="footer" class="uk-text-right">
              <vk-button type="default" @click.stop="deletes[cell._id] = false">Cancel</vk-button>
              <vk-button type="danger" @click.stop="configs.deleteConfig(cell._id); deletes[cell._id] = false;">Delete Forever</vk-button>
            </div>
          </vk-modal>
          <config-form :conf="cell" :show.sync="edits[cell._id]"/>
        </div>
      </vk-table-column>
    </vk-table>
  </vk-card>
</template>

<script>
import configs from '@/configs';
import users from '@/users';
import configForm from './partials/config-form.vue';

export default {
  components: {
    configForm,
  },
  data() {
    return {
      edits: {},
      deletes: {},
      create: false,
      configs,
      user: users.user,
    };
  },
  computed: {
    configsData() {
      return configs.configs.map(c => {
        const owner = users.find(u => u._id === c.owner);
        return {
          ...c,
          config: c,
          target: c.type === 'proxy' ? `${c.host}:${c.port}` : c.redirect,
          ownerName: !owner ? 'Unknown' : owner.fullname || owner.username,
        };
      });
    },
  },
  methods: {
    show(id, type='edits') {
      Object.keys(this[type]).forEach(i => this[type][i] = false);
      this[type][id] = true;
    },
  },
};
</script>

