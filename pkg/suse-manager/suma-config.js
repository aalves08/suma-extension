export const SUMA_CONFIG = {
  BASE_URL: '',
  USER:     '',
  PASSWORD: ''
};

export function init($plugin, store) {
  const { spoofedType } = $plugin.DSL(store, $plugin.name);

  spoofedType({
    label:             'CRD for SUMA patches',
    type:              'crd.sumapatches',
    kind:              'crd.sumapatches',
    collectionMethods: [],
    schemas:           [
      {
        id:                'crd.sumapatches',
        type:              'schema',
        collectionMethods: [],
        resourceFields:    {},
      }
    ],
    getInstances: () => []
  });
}
