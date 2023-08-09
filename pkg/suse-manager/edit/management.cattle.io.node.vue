<script>
import createEditView from '@shell/mixins/create-edit-view';
import CruResource from '@shell/components/CruResource';
import Loading from '@shell/components/Loading';
import { LabeledInput } from '@components/Form/LabeledInput';
import { NORMAN } from '@shell/config/types';
import ResourceTabs from '@shell/components/form/ResourceTabs';
import Tab from '@shell/components/Tabbed/Tab';
import SortableTable from '@shell/components/SortableTable';
import { _VIEW } from '@shell/config/query-params';
export default {
  components: {
    CruResource,
    Loading,
    LabeledInput,
    ResourceTabs,
    Tab,
    SortableTable
  },
  mixins: [createEditView],
  props:  {
    value: {
      type:     Object,
      required: true,
    },
  },
  async fetch() {
    // we need this to populate the NORMAN node... getNorman
    await this.$store.dispatch('rancher/findAll', { type: NORMAN.NODE });
  },
  data() {
    return {
      viewMode:           _VIEW,
      name:                '',
      loading:             true,
      sumaPatchesHeaders: [
        {
          name:          'advisory-name',
          labelKey:      'suma.node-details.cols.advisory-name',
          value:         'advisory_name',
          sort:          'advisory_name',
          formatter:     'Link',
          formatterOpts: { urlKey: 'sumaErrataUrl' },
        },
        {
          name:     'advisory-status',
          labelKey: 'suma.node-details.cols.advisory-status',
          value:    'advisory_status',
          sort:     'advisory_status',
        },
        {
          name:     'advisory-type',
          labelKey: 'suma.node-details.cols.advisory-type',
          value:    'advisory_type',
          sort:     'advisory_type',
        },
        {
          name:     'advisory-synopsis',
          labelKey: 'suma.node-details.cols.advisory-synopsis',
          value:    'advisory_synopsis',
          sort:     'advisory_synopsis',
        },
        {
          name:     'suma-update-date',
          labelKey: 'suma.node-details.cols.advisory-update-date',
          value:    'update_date',
          sort:     'update_date:desc',
        },
      ],
    };
  },
  methods: {
    async save(saveCb) {
      try {
        this.value.norman.name = this.name;
        await this.value.norman.save();

        saveCb(true);

        this.done();
      } catch (error) {
        this.errors.push(error);
        saveCb(false);
      }
    },
  },
  mounted() {
    this.name = this.value.spec.displayName;
  },
  computed: {
    doneLocationOverride() {
      return this.value.doneOverride;
    },
    sumaPatches() {
      const sumaSystems = this.$store.getters['suma/getSumaSystems'];
      const currSystem = sumaSystems.find(g => g?.profile_name === this.value.nameDisplay);
      let sumaPatches = [];

      if (currSystem) {
        sumaPatches = currSystem.listLatestUpgradablePackages.map((item) => {
          return {
            ...item,
            sumaErrataUrl: `https://ec2-52-206-103-214.compute-1.amazonaws.com/rhn/errata/details/Details.do?eid=${ item.id }`
          };
        });
      }

      return sumaPatches;
    },
  },
};
</script>

<template>
  <Loading v-if="!value" />
  <CruResource
    v-else
    :resource="value"
    :mode="mode"
    :errors="errors"
    @finish="save"
  >
    <ResourceTabs
      v-model="value"
      :need-related="false"
      :need-events="false"
    >
      <Tab
        name="node-edit"
        label-key="suma.node-details.tabs.node"
        :weight="4"
      >
        <LabeledInput
          v-model="name"
          :label="t('managementNode.customName')"
          :mode="mode"
        />
      </Tab>
      <Tab
        v-if="mode === viewMode"
        name="suma-patches"
        label-key="suma.node-details.tabs.patches"
        :weight="4"
      >
        <SortableTable
          :headers="sumaPatchesHeaders"
          :rows="sumaPatches"
          :table-actions="false"
          :row-actions="false"
          default-sort-by="suma-update-date"
        />
      </Tab>
    </ResourceTabs>
  </CruResource>
</template>
