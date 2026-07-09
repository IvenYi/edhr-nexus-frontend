export const getFileSize = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(blob.size);
        };
        reader.readAsText(blob);
      } else {
        reject(`Error ${xhr.status}: ${xhr.statusText}`);
      }
    };
    xhr.send();
  });
};

export const sizeParser = (size) => {
  if (size / 1000 < 1) return (size / 1000).toFixed(2) + 'K';
  if (size / 1000 / 10 < 1) return (size / 1000).toFixed(1) + 'K';
  if (size / 1000 / 1000 < 1) return (size / 1000).toFixed(0) + 'K';
  if (size / 1000 / 1000 / 10 < 1) return (size / 1000 / 1000).toFixed(1) + 'M';
  return (size / 1000 / 1000).toFixed(0) + 'M';
};
