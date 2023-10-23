<script>
import { CAPI, MANAGEMENT } from '@shell/config/types';
import { SUMA_CONFIG } from '../suma-config';
import { sumaLogin } from '../modules/sumaApi';

export default {
  name: 'SumaPanel',
  async fetch() {
    // Invisible panel used in cluster details view and node details view (must account for both cases)
    const login = await sumaLogin(this.$store, {
      login:    SUMA_CONFIG.USER,
      password: SUMA_CONFIG.PASSWORD
    });

    // this is where we get vital information from (either cluster or node details depending on the view)
    const currScreenValueProp = this.$parent?.$parent?.value;

    // this means we are on the cluster details view...
    if (currScreenValueProp && currScreenValueProp.type === CAPI.RANCHER_CLUSTER && login) {
      const currProvCluster = currScreenValueProp;

      if (currProvCluster?.status?.clusterName) {
        this.$store.dispatch('suma-store/fetchSumaSystemsList', {
          store:       this.$store,
          clusterName: currProvCluster?.status?.clusterName
        });
      } else {
        console.error('we are missing the cluster name to get SUMA data', currProvCluster); // eslint-disable-line no-console
      }
    // here we are looking at the node details view, where we only load the list of upgradable packages
    } else if (currScreenValueProp && currScreenValueProp.type === MANAGEMENT.NODE && login) {
      const currNode = currScreenValueProp;

      if (currNode?.mgmtClusterId && currNode?.nameDisplay) {
        this.$store.dispatch('suma-store/fetchSumaSystemsList', {
          store:       this.$store,
          clusterName: currNode?.mgmtClusterId,
          machineName: currNode?.nameDisplay,
        });
      } else {
        console.error('we are missing either the cluster name or the machine name to get SUMA data', currNode); // eslint-disable-line no-console
      }
    }
  }
};
</script>

<template>
  <div class="suma-panel">
  </div>
</template>

<style lang="scss" scoped>
.suma-panel {
  display: none;
}
</style>
