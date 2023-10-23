import { allHash } from '@shell/utils/promise';
import {
  sumaListAllGroups,
  sumaListGroupSystems,
  sumaListSystemEvents,
  sumaListLatestUpgradablePackages,
} from '../../modules/sumaApi';
import SumaPatches from '../../models/crd.sumapatches';

async function updateSumaSystemPayload(ctx: any, store: any, sumaGroup: any, sumaSystem: any, fetchSumaEvents = true) {
  const reqs: any = { sumaPackages: await sumaListLatestUpgradablePackages(store, sumaSystem?.id) };

  if (fetchSumaEvents) {
    reqs.sumaEvents = await sumaListSystemEvents(store, sumaSystem?.id);
  }

  const res: any = await allHash(reqs);

  const sumaPackages = res.sumaPackages;
  const sumaEvents = res.sumaEvents || [];
  const updatedSumaSystem = { ...sumaSystem };

  // update packages (patches) payload with complimentary data needed for classify
  const updatedSumaPackages = sumaPackages.map((pkg: any) => {
    const updatedPkg = {
      ...pkg,
      metadata:      { name: `${ pkg.id }` },
      type:          'crd.sumapatches',
      kind:          'crd.sumapatches',
      store, // passing the store is needed for the API calls and data update on the SUMA store
    };

    // classify Suma Patches (we need it for available actions)
    const classifiedPkg = new SumaPatches(updatedPkg, {
      rootState:   ctx.rootState,
      rootGetters: ctx.rootGetters,
    });

    return classifiedPkg;
  });

  updatedSumaSystem.listLatestUpgradablePackages = updatedSumaPackages;
  updatedSumaSystem.clusterGroup = sumaGroup.name;

  // get only ongoing system events
  const eventsInProgress = sumaEvents.filter((ev: any) => ev.created_date && !ev.completed_date);
  const events = eventsInProgress.map((ev: any) => {
    return {
      ...ev,
      sid:          sumaSystem.id,
      profile_name: sumaSystem.profile_name
    };
  });

  updatedSumaSystem.events = events || [];

  return updatedSumaSystem;
}

export default {
  async fetchSumaSystemsList(ctx: any, data: any) {
    let sumaSystems = [];

    const sumaGroups = await sumaListAllGroups(data.store);

    // get SUMA info for a group of systems in a cluster (GROUP NAME in SUMA must match CLUSTER NAME in Rancher!!!)
    if (data.clusterName) {
      const sumaGroupFound = sumaGroups.find((g: any) => g.name === data.clusterName);

      if (sumaGroupFound && sumaGroupFound['system_count']) {
        sumaSystems = await sumaListGroupSystems(data.store, sumaGroupFound.name);

        // update SUMA info only for a given system
        if (data.machineName) {
          const sumaSystemFound = sumaSystems.find((g: any) => g.profile_name === data.machineName);
          const sumaSystemIndex = sumaSystems.findIndex((g: any) => g.profile_name === data.machineName);

          if (sumaSystemFound) {
            sumaSystems[sumaSystemIndex] = await updateSumaSystemPayload(ctx, data.store, sumaGroupFound, sumaSystems[sumaSystemIndex]);
          }
        // update SUMA info for all systems
        } else {
          for (let x = 0; x < sumaSystems.length; x++) {
            sumaSystems[x] = await updateSumaSystemPayload(ctx, data.store, sumaGroupFound, sumaSystems[x]);
          }
        }
      }
    }

    ctx.commit('updateSumaSystemsList', sumaSystems);
  },

  async updateSystemEventsList(ctx: any, data: any) {
    const systemEvents = await sumaListSystemEvents(data.store, data.sid);

    ctx.commit('updateSystemEventsList', {
      sid: data.sid,
      systemEvents
    });
  },

  updateNotifications(ctx: any, notification: any) {
    ctx.commit('updateNotifications', notification);
  }
};
