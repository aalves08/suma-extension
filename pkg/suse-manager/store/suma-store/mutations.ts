export default {
  updateSumaSystemsList(state: any, sumaSystems: []) {
    state.sumaSystems = sumaSystems;
  },

  updateSystemEventsList(state: any, data: any) {
    const index = state.sumaSystems.findIndex((s: any) => s.id === data.sid);

    if (index >= 0) {
      const eventsInProgress = data.systemEvents.filter((ev:any) => ev.created_date && !ev.completed_date);
      const events = eventsInProgress.map((ev:any) => {
        return {
          ...ev,
          sid:          data.sid,
          profile_name: state.sumaSystems[index].profile_name
        };
      });

      state.sumaSystems[index].events = events;
    }
  },

  updateNotifications(state: any, notification: any) {
    state.notifications = notification;

    setTimeout(() => {
      state.notifications = {};
    }, 4000 );
  }
};
