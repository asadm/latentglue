import mixpanel from 'mixpanel-browser';

mixpanel.init('9ef411f125338496043a324fae48042a', {
  // debug: true,
  api_host: `https://ws.joinplayroom.com/__mix` /*ip: 0*/
});

export function identify(uuid, data) {
  mixpanel.identify(uuid);
  mixpanel.people.set(data);
}

export function track(event, data) {
  try {
    mixpanel.track(event, data);
  } catch (e) {}
}
