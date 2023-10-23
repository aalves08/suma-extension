export default {
  getSumaSystems:           (state: any) => state.sumaSystems,
  getNotifications:         (state: any) => state.notifications,
  getSumaActionsInProgress: (state: any) => {
    let events:any = [];

    state.sumaSystems.forEach((system:any) => {
      if (system.events?.length) {
        events = events.concat(system.events);
      }
    });

    return events;
  },
  areSumaActionsInProgress: (state: any) => (name: string) => {
    let inProgress = false;

    state.sumaSystems.forEach((system:any) => {
      if (system.profile_name === name && system.events?.length) {
        inProgress = true;
      }
    });

    return inProgress;
  },
};
