<script>
import { CAPI, MANAGEMENT } from '@shell/config/types';
import {
  sumaLogin, sumaListAllGroups, sumaListGroupSystems, sumaListLatestUpgradablePackages, sumaListActionsInProgress
} from '../modules/sumaApi';

export default {
  name: 'SumaPanel',
  async fetch() {
    // Invisible panel used in cluster details view and node details view (must account for both cases)
    let sumaSystems = [];

    const login = await sumaLogin(this.$store, {
      login:    'admin',
      password: 'susemanager'
    });

    // populate SUMA actions in progress
    sumaListActionsInProgress(this.$store, true);

    // this is where we get vital information from (either cluster or node details depending on the view)
    const currScreenValueProp = this.$parent?.$parent?.value;

    // this means we are on the cluster details view...
    if (currScreenValueProp && currScreenValueProp.type === CAPI.RANCHER_CLUSTER && login) {
      const currProvCluster = currScreenValueProp;

      const sumaGroups = await sumaListAllGroups(this.$store);

      if (currProvCluster?.status?.clusterName) {
        const sumaGroupFound = sumaGroups.find(g => g.name === currProvCluster?.status?.clusterName);

        if (sumaGroupFound && sumaGroupFound['system_count']) {
          sumaSystems = await sumaListGroupSystems(this.$store, sumaGroupFound.name);

          for (let x = 0; x < sumaSystems.length; x++) {
            const sumaPackages = await sumaListLatestUpgradablePackages(this.$store, sumaSystems[x]?.id);

            const tipifyedSumaPackages = sumaPackages.map((pkg) => {
              return {
                ...pkg,
                metadata:      { name: `${ pkg.id }` },
                type:          'crd.sumapatches',
                kind:          'crd.sumapatches',
                sumaErrataUrl: `https://ec2-52-206-103-214.compute-1.amazonaws.com/rhn/errata/details/Details.do?eid=${ pkg.id }`
              };
            });

            sumaSystems[x].listLatestUpgradablePackages = tipifyedSumaPackages;
            sumaSystems[x].clusterGroup = sumaGroupFound.name;
          }
        }
      }
    // here we are looking at the node details view, where we only load the list of upgradable packages
    } else if (currScreenValueProp && currScreenValueProp.type === MANAGEMENT.NODE && login) {
      const currNode = currScreenValueProp;

      const sumaGroups = await sumaListAllGroups(this.$store);

      // here we get the cluster name
      if (currNode?.mgmtClusterId) {
        const sumaGroupFound = sumaGroups.find(g => g.name === currNode?.mgmtClusterId);

        if (sumaGroupFound && sumaGroupFound['system_count']) {
          sumaSystems = await sumaListGroupSystems(this.$store, sumaGroupFound.name);
          const sumaSystemFound = sumaSystems.find(g => g.profile_name === currNode?.nameDisplay);
          const sumaSystemIndex = sumaSystems.findIndex(g => g.profile_name === currNode?.nameDisplay);

          if (sumaSystemFound) {
            const sumaPackages = await sumaListLatestUpgradablePackages(this.$store, sumaSystemFound.id);

            const tipifyedSumaPackages = sumaPackages.map((pkg) => {
              return {
                ...pkg,
                metadata:      { name: `${ pkg.id }` },
                type:          'crd.sumapatches',
                kind:          'crd.sumapatches',
                sumaErrataUrl: `https://ec2-52-206-103-214.compute-1.amazonaws.com/rhn/errata/details/Details.do?eid=${ pkg.id }`
              };
            });

            sumaSystems[sumaSystemIndex].listLatestUpgradablePackages = tipifyedSumaPackages;
            sumaSystems[sumaSystemIndex].clusterGroup = sumaGroupFound.name;
          }
        }
      }
    }

    this.$store.dispatch('suma/updateSumaSystems', sumaSystems);
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
