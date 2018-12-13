<template>
  <vk-card>
    <form class="uk-form-stacked" @submit.prevent="login">

      <legend class="uk-legend">
          <img src="/logo.png" alt="" style="height: 2em;">
          Bin Chicken Login
      </legend>

      <span v-if="errorMsg" class="uk-text-danger">{{errorMsg}}</span>

      <div class="uk-margin">
          <label class="uk-form-label" for="login-username">Username</label>
          <div class="uk-form-controls">
              <input class="uk-input" id="login-username" name="username" type="text" placeholder="Pheme Number" v-model="username">
          </div>
      </div>

      <div class="uk-margin">
          <label class="uk-form-label" for="login-password">Password</label>
          <div class="uk-form-controls">
              <input class="uk-input" id="login-password" name="password" type="password" placeholder="Pheme Password" v-model="password">
          </div>
      </div>

      <vk-button type="primary" htmlType="submit">Login</vk-button>

    </form>
  </vk-card>
</template>

<script>
import users from '@/users';

export default {
  data() {
    return {
      errorMsg: '',
      username: '',
      password: '',
    };
  },
  methods: {
    async login() {
      try {
        await users.login(this.username, this.password);
        this.$router.push('/');
      } catch (err) {
        this.errorMsg = err.message;
        this.password = '';
      }
    },
  },
}
</script>
