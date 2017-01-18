import async from 'async';
import axios from 'axios';

export default class Youtube {

  constructor(apiKey) {
    this.apiKey = apiKey || 'AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU';
    this.axios = axios.create({
      baseURL: 'https://www.googleapis.com/youtube/v3',
      params: {
        key: this.apiKey
      }
    });
  }

  getVideos(ids) {
    let part = 'id,snippet,contentDetails,player,recordingDetails,statistics,status,topicDetails';
    let options = {
      id: ids.join(','),
      part: part
    };
    return this.axios({
      method: 'GET',
      url: '/videos',
      params: options
    })
    .then(response => response.data);
    /*
    return bluebird.promisify(this.youtube.videos.list)(options)
      .catch(function(err) {
        console.log('An error occured while running upload command: '.red + err.message);
        throw err;
      });
    */
  }

  getPlayListItems(playlistId) {
    let part = 'id,snippet,contentDetails';
    let options = {
      playlistId: playlistId,
      part: part,
      maxResults: 5,
      pageToken: null
    };
    let items = [];
    let nextPageToken = true;
    return new Promise((resolve, reject) => {
      async.doWhilst(callback => {
         this.axios({
          method: 'GET',
          url: '/playlistItems',
          params: options
        })
        .then(response => {
          return callback(null, response.data)
        })
        .catch(callback);
      }, function(list, callback) {
        items = items.concat(list.items);
        options.pageToken = list.nextPageToken;
        return list.nextPageToken;
      }, function(error, result) {
        if (error) {
          return reject(error);
        } else {
          return resolve(items)
        }
      });
    })
  }
}
