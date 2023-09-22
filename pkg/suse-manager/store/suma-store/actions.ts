import { classify } from '@shell/plugins/dashboard-store/classify';

export default {
  updateSumaSystems(ctx: any, val: any) {
    for (let i = 0; i < val.length; i++) {
      const sumaSystem = val[i];
      const pkgs:any = [];

      for (let x = 0; x < sumaSystem.listLatestUpgradablePackages.length; x++) {
        const pkg = sumaSystem.listLatestUpgradablePackages[x];

        pkgs.push(classify(ctx, pkg));
      }

      // we cannot classify because we don't have schemas loaded yet.... throws an error
      // val[i].listLatestUpgradablePackages = pkgs;
    }

    ctx.commit('updateSumaSystems', val);
  },
  updateSumaActionsInProgress({ commit }: any, val: any) {
    commit('updateSumaActionsInProgress', val);
  }
};
