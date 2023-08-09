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

export async function sumaListAllGroups(store) {
  const groups = await store.dispatch(`management/request`, {
    url:             '/rhn/manager/api/systemgroup/listAllGroups',
    responseType:    'application/json',
    withCredentials: true
  }, { root: true });

  return groups.data?.result || [];
}

export async function sumaListGroupSystems(store, groupName) {
  const groups = await store.dispatch(`management/request`, {
    url:             `/rhn/manager/api/systemgroup/listSystems?systemGroupName=${ groupName }`,
    responseType:    'application/json',
    withCredentials: true
  }, { root: true });

  return groups.data?.result || [];
}

export async function sumaListLatestUpgradablePackages(store, sid) {
  const groups = await store.dispatch(`management/request`, {
    url:             `/rhn/manager/api/system/getRelevantErrata?sid=${ sid }`,
    responseType:    'application/json',
    withCredentials: true
  }, { root: true });

  return groups.data?.result || [];
}
