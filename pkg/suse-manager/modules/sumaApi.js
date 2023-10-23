import { allHash } from '@shell/utils/promise';

/**
 * SUMA login endpoint
 * @param {object} store - Vue store object
 * @param {object} credentials - login credentials
 */
export async function sumaLogin(store, credentials) {
  const login = await store.dispatch(`management/request`, {
    url:     '/rhn/manager/api/auth/login',
    method:  'post',
    headers: { 'Content-Type': 'application/json' },
    data:    {
      login:    credentials.login,
      password: credentials.password
    },
    responseType: 'application/json'
  }, { root: true });

  if (login.status === 200 && login.data?.success) {
    return true;
  }

  return false;
}

/**
 * SUMA list all systemgroups
 * @param {object} store - Vue store object
 */
export async function sumaListAllGroups(store) {
  const groups = await store.dispatch(`management/request`, {
    url:             '/rhn/manager/api/systemgroup/listAllGroups',
    responseType:    'application/json',
    withCredentials: true
  }, { root: true });

  return groups.data?.result || [];
}

/**
 * SUMA list all systems in a systemgroup
 * @param {object} store - Vue store object
 * @param {string} groupName - systemgroup name
 */
export async function sumaListGroupSystems(store, groupName) {
  const groups = await store.dispatch(`management/request`, {
    url:             `/rhn/manager/api/systemgroup/listSystems?systemGroupName=${ groupName }`,
    responseType:    'application/json',
    withCredentials: true
  }, { root: true });

  return groups.data?.result || [];
}

/**
 * SUMA list of all patches available in a system (upgradable packages)
 * @param {object} store - Vue store object
 * @param {string, int} sid - system id
 */
export async function sumaListLatestUpgradablePackages(store, sid) {
  const groups = await store.dispatch(`management/request`, {
    url:             `/rhn/manager/api/system/getRelevantErrata?sid=${ sid }`,
    responseType:    'application/json',
    withCredentials: true
  }, { root: true });

  return groups.data?.result || [];
}

/**
 * SUMA list of all event regarding a given system
 * @param {object} store - Vue store object
 * @param {string, int} sid - system id
 */
export async function sumaListSystemEvents(store, sid) {
  const groups = await store.dispatch(`management/request`, {
    url:             `/rhn/manager/api/system/listSystemEvents?sid=${ sid }`,
    responseType:    'application/json',
    withCredentials: true
  }, { root: true });

  return groups.data?.result || [];
}

/**
 * SUMA apply selected OS patches (upgradable packages) to a given system
 * @param {object} store - Vue store object
 * @param {array} sid - array of system ids
 * @param {array} errataIds - array of patches (erratas) ids
 */
export async function sumaScheduleApplyErrata(store, sids, errataIds) {
  const schedule = await store.dispatch(`management/request`, {
    url:             `/rhn/manager/api/system/scheduleApplyErrata`,
    method:  'post',
    data:   {
      sids,
      errataIds
    },
    responseType:    'application/json',
    withCredentials: true
  }, { root: true });

  if (schedule.status === 200) {
    // show success notification
    store.dispatch('suma-store/updateNotifications', {
      type:    'success',
      message: 'OS Patches successfully scheduled. OS Patching will begin shortly.'
    });

    // prepare all requests for SUMA system IDs for updating events list
    const reqs = {};

    sids.forEach((sid) => {
      store.dispatch('suma-store/updateSystemEventsList', {
        store,
        sid
      });
    });

    // update list of suma actions in progress after a given timeout
    setTimeout(async() => {
      await allHash(reqs);
    }, 4000 );
  } else {
    // show error notification
    store.dispatch('suma-store/updateNotifications', {
      type:    'error',
      message: 'Something went wrong when applying OS patches. Please try again.'
    });
  }

  return schedule;
}
