
<script>
import { mapGetters } from 'vuex';
import { Banner } from '@components/Banner';
import { sumaListActionsInProgress } from '../modules/sumaApi';

export default {
  name:       'SumaNotification',
  components: { Banner },
  data() {
    return { poolingInterval: null };
  },
  computed:   {
    ...mapGetters('suma', ['getSumaActionsInProgress']),
    patchOsActions() {
      return this.getSumaActionsInProgress.filter(act => act.type === 'Patch Update');
    }
  },
  methods:  {
    async actionsInProgress() {
      return await sumaListActionsInProgress(this.$store, true);
    }
  },

  beforeDestroy() {
    if (this.poolingInterval) {
      clearInterval(this.poolingInterval);
    }
  },

  watch: {
    patchOsActions: {
      handler(neu) {
        if (neu.length && !this.poolingInterval) {
          this.poolingInterval = setInterval(this.actionsInProgress, 5000);
        } else if (!neu.length && this.poolingInterval) {
          clearInterval(this.poolingInterval);
        }
      },
      immediate: true
    },
  },
};
</script>

<template>
  <div>
    <Banner
      v-if="patchOsActions.length"
      color="info"
      class="msg-banner"
    >
      <p class="msg-title">
        Currently applying the following OS patches:
      </p>
      <p v-for="act in patchOsActions" :key="act.id">
        {{ `- ${act.name}` }}
      </p>
    </Banner>
  </div>
</template>

<style lang="scss" scoped>
.msg-banner {
  .msg-title {
    margin-bottom: 10px;
  }
  &::v-deep div {
    display: block !important;
  }
}
</style>
