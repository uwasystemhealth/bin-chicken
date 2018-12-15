<template>
  <vk-card>
    <div uk-grid>
      <div class="uk-text-lead" style="padding-left: 0;">
        Users
        <span style="float: right;">
          <vk-icon-link v-if="!users.loading" href="#" icon="refresh" v-vk-tooltip="'Refresh'" @click.prevent="users.getUsers()" />
          <vk-spinner v-else />
          <vk-icon-link
            href="#"
            icon="plus"
            @click.prevent="create = true;"
            v-vk-tooltip="'Add User'"
          />
          <vk-modal center :show.sync="create">
            <vk-modal-title>Add User</vk-modal-title>
            <p v-if="createError" class="uk-text-danger">{{createError}}</p>
            <div class="uk-margin">
              <label class="uk-form-label" for="create-username">Pheme Number</label>
              <div class="uk-form-controls">
                <input
                  class="uk-input"
                  id="create-username"
                  name="username"
                  type="text"
                  v-model="username"
                >
              </div>
            </div>
            <div slot="footer" class="uk-text-right">
              <vk-button @click.stop="create = false; username = '';">Cancel</vk-button>
              <vk-button
                type="primary"
                @click.stop="createUser"
                :disabled="!/^\d{8}$/.test(username) || users.loading"
              >
                <vk-spinner v-if="users.loading" />
                <span v-else>Add</span>
              </vk-button>
            </div>
          </vk-modal>
        </span>
      </div>
    </div>
    <vk-table :data="usersData" hoverable responsive style="text-transform: capitalize;">
      <vk-table-column title="Pheme Number" cell="username" />
      <vk-table-column title="Name" cell="fullname" expanded>
        <div slot="empty">
          Unkown (login required)
        </div>
      </vk-table-column>
      <vk-table-column title="Admin?" cell="user">
        <div slot-scope="{ cell }">
          <input
            class="uk-checkbox"
            type="checkbox"
            name="preserve"
            :checked="cell.isAdmin"
            :disabled="cell._id === user._id || users.loading"
            @input="users.patchUser(cell._id, {isAdmin: $event.target.checked})"
          >
        </div>
      </vk-table-column>
      <vk-table-column title="Create?" cell="user">
        <div slot-scope="{ cell }">
          <input
            class="uk-checkbox"
            type="checkbox"
            name="preserve"
            v-vk-tooltip="'can create a config?'"
            :checked="cell.canCreate"
            :disabled="cell._id === user._id || users.loading"
            @input="users.patchUser(cell._id, {canCreate: $event.target.checked})"
          >
        </div>
      </vk-table-column>
      <vk-table-column title="Actions" cell="user">
        <div slot-scope="{ cell }">
          <vk-icon-link
            v-if="cell._id !== user._id"
            href="javascript:;"
            icon="trash"
            v-vk-tooltip="'Delete User'"
            @click.stop="del = cell._id"
          />
          <vk-modal center :show="del === cell._id">
            <vk-modal-title slot="header">
              Remove {{cell.fullname || cell.username}}?! ARE YOU SURE!?
            </vk-modal-title>
            <div slot="footer" class="uk-text-right">
              <vk-button @click.stop="del = ''">Cancel</vk-button>
              <vk-button
                type="danger"
                @click.stop="if(!users.loading){
                  users.deleteUser(cell._id);
                  del= '';
                }"
                :disabled="users.loading"
              >
                <vk-spinner v-if="users.loading" />
                <span v-else>Delete</span>
              </vk-button>
            </div>
          </vk-modal>
        </div>
      </vk-table-column>
    </vk-table>
  </vk-card>
</template>

<script>
import users from '@/users';

export default {
  data() {
    return {
      del: '',
      create: false,
      createError: '',
      username: '',
      user: users.user,
      users,
    };
  },
  computed: {
    usersData() {
      return users.users.map(u => ({ ...u, user: u }));
    },
  },
  methods: {
    async createUser() {
      if(!/\d{8}/.test(this.username) || users.loading) return;
      try {
        await users.createUser(this.username);
        this.create = false;
        this.username = '';
      } catch(err) {
        this.createError = err.message;
      }
    },
  },
};
</script>

