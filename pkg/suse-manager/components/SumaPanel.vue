<script>
import { sumaLogin, sumaListAllGroups, sumaListGroupSystems, sumaListLatestUpgradablePackages } from '../modules/sumaApi';

export default {
  name: 'SumaPanel',
  async fetch() {
    const currCluster = this.$parent?.$parent?.value;
    let sumaSystems = [];

    const login = await sumaLogin(this.$store, {
      login:    'admin',
      password: 'susemanager'
    });

    if (login) {
      const sumaGroups = await sumaListAllGroups(this.$store);

      if (currCluster?.status?.clusterName) {
        const sumaGroupFound = sumaGroups.find(g => g.name === currCluster?.status?.clusterName);

        if (sumaGroupFound && sumaGroupFound['system_count']) {
          sumaSystems = await sumaListGroupSystems(this.$store, sumaGroupFound.name);

          for (let x = 0; x < sumaSystems.length; x++) {
            const sumaPackages = await sumaListLatestUpgradablePackages(this.$store, sumaSystems[x]?.id);

            sumaSystems[x].listLatestUpgradablePackages = sumaPackages;
          }
        }
      }
      this.$store.dispatch('suma/updateSumaSystems', sumaSystems);
    }
  }
};
</script>

<template>
  <div class="suma-panel"></div>
</template>

<style lang="scss" scoped>
.suma-panel {
  display: none;
}
</style>
