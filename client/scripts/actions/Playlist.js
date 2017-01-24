export function addItem({id, title, duration, file, stars}) {
  return {
    type: 'ADD_ITEM',
    payload: {
      id,
      title,
      duration,
      file,
      stars
    }
  };
}
