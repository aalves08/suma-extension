import { importTypes } from '@rancher/auto-import';
import { TableColumnLocation, PanelLocation, IPlugin } from '@shell/core/types';
import sumaStore from './store/suma-store';

// Init the package
export default function(plugin: IPlugin, args:any) {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require('./package.json');

  // create new SUMA store
  plugin.addDashboardStore(sumaStore.config.namespace, sumaStore.specifics, sumaStore.config);

  // add hidden panel to retrieve data
  plugin.addPanel(
    PanelLocation.DETAILS_MASTHEAD,
    { resource: ['provisioning.cattle.io.cluster'], mode: ['detail'] },
    { component: () => import('./components/SumaPanel.vue') }
  );

  // add table col on machine pools table under cluster details
  plugin.addTableColumn(
    TableColumnLocation.RESOURCE,
    { resource: ['management.cattle.io.node'] },
    {
      name:     'suma-patches',
      labelKey: 'suma.cluster-details.patches-col',
      getValue: (row: any) => {
        const sumaSystems = args.store.getters['suma/getSumaSystems'];
        const currSystem = sumaSystems.find(g => g?.profile_name === row.nameDisplay);

        console.warn('sumaSystems', sumaSystems);

        return currSystem?.listLatestUpgradablePackages?.length || '---';
      },
      width:  100,
      sort:   ['suma-patches'],
      search: ['suma-patches'],
    }
  );
}
