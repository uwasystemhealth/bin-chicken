<template>
  <div class="uk-card uk-card-body uk-width-1-1 uk-width-2-3@m uk-width-1-2@l">
    <div uk-grid>
      <div class="uk-text-lead uk-width-2-3" style="padding-left: 0;">Users</div>
      <div class="uk-text-right uk-width-1-3"  style="padding-left: 0;">
        <vk-icon-link href="javascript:;" icon="plus" v-vk-tooltip="'Add User'" @click.stop="create = true;"/>
        <vk-modal center :show.sync="create">
          <vk-modal-title>Add User</vk-modal-title>
          <p v-if="createError" class="uk-text-danger">{{createError}}</p>
          <div class="uk-margin">
            <label class="uk-form-label" for="create-username">Pheme Number</label>
            <div class="uk-form-controls">
              <input class="uk-input" id="create-username" name="username" type="text" v-model="username">
            </div>
          </div>
          <div slot="footer"  class="uk-text-right">
            <vk-button type="default" @click.stop="create = false">Cancel</vk-button>
            <vk-button type="success" @click.stop="createUser">Add</vk-button>
          </div>
        </vk-modal>
      </div>
    </div>
    <vk-table :data="users.usersData" hoverable responsive>
      <vk-table-column title="Pheme Number" cell="username"/>
      <vk-table-column title="Name" cell="fullname" expanded>
        <div slot="empty">
          Unkown (login required)
        </div>
      </vk-table-column>
      <vk-table-column title="Admin?" cell="user">
        <div slot-scope="{ cell }">
          <input class="uk-checkbox" type="checkbox" name="preserve" :value="user.isAdmin" @input="users.patchUser(user._id), {isAdmin: $event.target.value}">
        </div>
      </vk-table-column>
      <vk-table-column title="Actions" cell="user">
        <div slot-scope="{ cell }">
          <vk-icon-link href="javascript:;" icon="trash" v-vk-tooltip="'Delete Config'" @click.stop="show(cell._id, 'deletes')"/>
          <vk-modal center :show="deletes[cell._id]">
            <vk-modal-title slot="header">Remove {{cell.fullname || cell.username}}?! ARE YOU SURE!?</vk-modal-title>
            <div slot="footer" class="uk-text-right">
              <vk-button type="default" @click.stop="deletes[cell._id] = false">Cancel</vk-button>
              <vk-button type="danger" @click.stop="users.deleteUser(cell._id); deletes[cell._id] = false;">Delete Forever</vk-button>
            </div>
          </vk-modal>
        </div>
      </vk-table-column>
    </vk-table>
  </div>
</template>

<script>
import users from '@/users';

export default {
  data() {
    return {
      deletes: {},
      create: false,
      createError: '',
      username: '',
      user: users.user,
    };
  },
  computed: {
    usersData() {
      return users.users.map(u => ({...u, user: u}));
    },
  },
  methods: {
    show(id, type='deletes') {
      Object.keys(this[type]).forEach(i => this[type][i] = false);
      this[type][id] = true;
    },
    async createUser() {
      try {
        await users.createUser(this.username);
        this.create = false;
      } catch(err) {
        this.createError = err.message;
      }
    }
  },
};
</script>

