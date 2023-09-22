import { importTypes } from '@rancher/auto-import';
import {
  TableColumnLocation, PanelLocation, ActionLocation, IPlugin, ActionOpts
} from '@shell/core/types';
import { MANAGEMENT, CAPI } from '@shell/config/types';
import sumaStore from './store/suma-store';
import { sumaScheduleApplyErrata, sumaListActionsInProgress } from './modules/sumaApi';

// Init the package
export default function(plugin: IPlugin, args:any) {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require('./package.json');

  // registering spoofed type
  plugin.addProduct(require('./suma-config'));

  // create new SUMA store
  plugin.addDashboardStore(sumaStore.config.namespace, sumaStore.specifics, sumaStore.config);

  // add hidden panel to retrieve data
  plugin.addPanel(
    PanelLocation.DETAILS_MASTHEAD,
    { resource: [CAPI.RANCHER_CLUSTER, MANAGEMENT.NODE], mode: ['detail'] },
    { component: () => import('./components/SumaPanel.vue') }
  );

  // add notification panel for ongoing OS patches
  plugin.addPanel(
    PanelLocation.DETAILS_MASTHEAD,
    { resource: [CAPI.RANCHER_CLUSTER, MANAGEMENT.NODE], mode: ['detail'] },
    { component: () => import('./components/SumaNotification.vue') }
  );

  // add table col on machine pools table under cluster details
  plugin.addTableColumn(
    TableColumnLocation.RESOURCE,
    {
      resource: [CAPI.RANCHER_CLUSTER], mode: ['detail'], hash: ['node-pools']
    },
    {
      name:          'suma-patches',
      labelKey:      'suma.cluster-details.patches-col',
      formatter:     'Link',
      formatterOpts: {
        options: { internal: true },
        urlKey:  'sumaPatchesListLink'
      },
      dashIfEmpty: true,
      getValue:    (row: any) => {
        const sumaSystems = args.store.getters['suma/getSumaSystems'];
        const currSystem = sumaSystems.find((g: any) => g?.profile_name === row.nameDisplay);

        return currSystem?.listLatestUpgradablePackages?.length ? `${ currSystem?.listLatestUpgradablePackages?.length }` : '---';
      },
      width:  100,
      sort:   ['suma-patches'],
      search: ['suma-patches'],
    }
  );

  // table action - apply all OS patches available to a particular machine
  plugin.addAction(
    ActionLocation.TABLE,
    {
      resource: [CAPI.RANCHER_CLUSTER], mode: ['detail'], hash: ['node-pools']
    },
    {
      labelKey: 'suma.cluster-details.table-actions.patch-os',
      icon:     'icon-play',
      enabled(ctx: any) {
        const sumaSystems = args.store.getters['suma/getSumaSystems'];
        const sumaSystemFound = sumaSystems.find((s: any) => s.profile_name === ctx.nameDisplay);

        return !!sumaSystemFound;
      },
      invoke(opts: ActionOpts, values: any[]) {
        const node = values[0];
        const sumaSystems = args.store.getters['suma/getSumaSystems'];
        const sumaSystemFound = sumaSystems.find((s: any) => s.profile_name === node.nameDisplay);

        // TODO: change logic to schedule patches application all in one go
        if (sumaSystemFound && sumaSystemFound.listLatestUpgradablePackages?.length) {
          // perform OS patch apply
          sumaScheduleApplyErrata(args.store, [sumaSystemFound.id], [sumaSystemFound.listLatestUpgradablePackages[0].id]);

          // update list of suma actions in progress
          setTimeout(() => {
            sumaListActionsInProgress(args.store, true);
          }, 5000 );
        }
      }
    }
  );

  // table action - apply a given OS patch (SUMA patches list needs to be a spoofedType resource for this to work!!!! - _availableActions belongs in a base class - resource-class file)
  // plugin.addAction(
  //   ActionLocation.TABLE,
  //   {
  //     resource: [MANAGEMENT.NODE], mode: ['detail'], hash: ['suma-patches']
  //   },
  //   {
  //     labelKey: 'suma.cluster-details.table-actions.patch-os-single',
  //     icon:     'icon-play',
  //     enabled(ctx: any) {
  //       return true;
  //     },
  //     invoke(opts: ActionOpts, values: any[]) {
  //       // const node = values[0];
  //       // const sumaSystems = args.store.getters['suma/getSumaSystems'];
  //       // const sumaSystemFound = sumaSystems.find((s: any) => s.profile_name === node.nameDisplay);

  //       // // TODO: change logic to schedule patches application all in one go
  //       // if (sumaSystemFound && sumaSystemFound.listLatestUpgradablePackages?.length) {
  //       //   sumaScheduleApplyErrata(args.store, [sumaSystemFound.id], [sumaSystemFound.listLatestUpgradablePackages[0].id]);
  //       // }

  //       console.log('table action executed 1', this, opts, values); // eslint-disable-line no-console
  //     }
  //   }
  // );
}
