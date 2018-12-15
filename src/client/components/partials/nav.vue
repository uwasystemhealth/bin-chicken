<template>
  <vk-navbar>
    <vk-navbar-nav>
      <vk-navbar-logo>
        <img src="/logo.png" alt="" style="height: 1.5em;margin-right: 0.5em;">
        Bin Chicken
      </vk-navbar-logo>
      <vk-navbar-nav-item
        icon="settings"
        title="Configs"
        :active="$route.name === 'Configs'"
        @click.prevent="$router.push('/')"
      />
      <vk-navbar-nav-item
        v-if="user.isAdmin"
        icon="users"
        title="Users"
        :active="$route.name === 'Users'"
        @click.prevent="$router.push('/users')"
      />
    </vk-navbar-nav>
    <vk-navbar-nav slot="right">
      <vk-navbar-nav-dropdown icon="user" :title="user.fullname">
        <vk-navbar-nav-dropdown-nav>
          <vk-nav-item title="Logout" href="/logout" @click.prevent="$router.push('/logout')" />
        </vk-navbar-nav-dropdown-nav>
      </vk-navbar-nav-dropdown>
    </vk-navbar-nav>
  </vk-navbar>
</template>

<script>
import users from '@/users';

export default {
  computed: {
    user() { return users.user; },
  },
};
</script>
