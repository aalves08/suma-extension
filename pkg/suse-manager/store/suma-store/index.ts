import { CoreStoreSpecifics, CoreStoreConfig } from '@shell/core/types';

// import { ELEMENTAL_STORE } from '../../types';

import getters from './getters';
import mutations from './mutations';
import actions from './actions';

const sumaFactory = (): CoreStoreSpecifics => {
  return {
    state() {
      return { sumaSystems: [], sumaActionsInProgress: [] };
    },

    getters: { ...getters },

    mutations: { ...mutations },

    actions: { ...actions },
  };
};
const config: CoreStoreConfig = { namespace: 'suma' };

export default {
  specifics: sumaFactory(),
  config
};
