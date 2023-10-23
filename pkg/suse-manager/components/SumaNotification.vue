
<script>
import { mapGetters } from 'vuex';
import { Banner } from '@components/Banner';
import { allHash } from '@shell/utils/promise';
import { CAPI, MANAGEMENT } from '@shell/config/types';

// TODO: we are missing the context of the systems in display... We don't need to show info about ALL systems
// registered where they aren't needed
export default {
  name:       'SumaNotification',
  components: { Banner },
  data() {
    return { poolingInterval: null };
  },

  computed: {
    ...mapGetters('suma-store', ['getSumaActionsInProgress', 'getNotifications']),
    clusterName() {
      // this is where we get vital information from (either cluster or node details depending on the view)
      const currScreenValueProp = this.$parent?.$parent?.value;

      // this means we are on the cluster details view...
      if (currScreenValueProp && currScreenValueProp.type === CAPI.RANCHER_CLUSTER) {
        const currProvCluster = currScreenValueProp;

        if (currProvCluster?.status?.clusterName) {
          return currProvCluster?.status?.clusterName;
        }
      // here we are looking at the node details view, where we only load the list of upgradable packages
      } else if (currScreenValueProp && currScreenValueProp.type === MANAGEMENT.NODE) {
        const currNode = currScreenValueProp;

        if (currNode?.mgmtClusterId) {
          return currNode?.mgmtClusterId;
        }
      }

      return '';
    }
  },

  methods:  {
    async updateEventsInProgress() {
      const reqs = {};
      const uniqueSystemIds = [...new Set(this.getSumaActionsInProgress.map(ev => ev.sid))];

      uniqueSystemIds.forEach((sid) => {
        reqs[sid] = this.$store.dispatch('suma-store/updateSystemEventsList', {
          store: this.$store,
          sid
        });
      });

      return await allHash(reqs);
    }
  },

  beforeDestroy() {
    if (this.poolingInterval) {
      clearInterval(this.poolingInterval);
    }
  },

  watch: {
    getSumaActionsInProgress: {
      handler(neu) {
        if (neu.length && !this.poolingInterval) {
          this.poolingInterval = setInterval(this.updateEventsInProgress, 5000);
        } else if (!neu.length && this.poolingInterval) {
          clearInterval(this.poolingInterval);
          this.poolingInterval = null;

          // update data on screen... Needs a delay for the SUMA api to update
          setTimeout(() => {
            this.$store.dispatch('suma-store/fetchSumaSystemsList', {
              store:       this.$store,
              clusterName: this.clusterName
            });
          }, 4000 );

          // let's double-down on the request because sometimes it takes a long time to update on SUMA side
          setTimeout(() => {
            this.$store.dispatch('suma-store/fetchSumaSystemsList', {
              store:       this.$store,
              clusterName: this.clusterName
            });
          }, 10000 );
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
      v-if="getNotifications && getNotifications.type"
      :color="getNotifications.type"
      class="msg-banner"
    >
      <p>{{ getNotifications.message }}</p>
    </Banner>
    <Banner
      v-else-if="getSumaActionsInProgress.length"
      color="info"
      class="msg-banner"
    >
      <p class="msg-title">
        {{ t('suma.notification.title') + ':' }}
      </p>
      <p
        v-for="act in getSumaActionsInProgress"
        :key="act.id"
      >
        {{ `- ${act.action_type} on ${act.profile_name} => ${act.name}` }}
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
