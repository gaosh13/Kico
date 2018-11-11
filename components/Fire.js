import React from 'react';
const firebase = require('firebase');
// Required for side-effects
require('firebase/firestore');
import { REACT_APP_FIREBASE_APIKEY } from 'react-native-dotenv'

class Fire extends React.Component {
  constructor(props) {
    super(props);

    firebase.initializeApp({
      apiKey: REACT_APP_FIREBASE_APIKEY,
      authDomain: "playerx-a68cb.firebaseapp.com",
      databaseURL: "https://playerx-a68cb.firebaseio.com",
      projectId: "playerx-a68cb",
      storageBucket: "playerx-a68cb.appspot.com",
      messagingSenderId: "170596970815"
    });
    this.setAuth = this.setAuth.bind(this);
    const firestore = firebase.firestore();
    const settings = { timestampsInSnapshots: true };
    firestore.settings(settings);
    this.firestore = firestore;
    this.auth = firestore.collection('users');
    this.profile = firestore.collection('profiles');
    this.notification = firestore.collection('notification');
    this.place = firestore.collection('place');
    console.log('Fire module has been called and initialized, user status:',firebase.auth().currentUser)
  }

  setAuth = (param) => {
    console.log('ready to update, userID: ', this.uid);
    if (this.uid) {
      const data = {
        uid:this.uid,
        name: param.name,
        photoURL: param.photoUrl,
        method: param.method,
        methodID: param.userid,
      };
      this.auth.doc(this.uid).get().then((doc) => {
        // if (!doc.exists) doc.ref.set(data);
        doc.ref.set(data);
      });
    }
  }

  setInfo = (param) => {
    if (this.uid) {
      const data = {
        uid: this.uid,
        name: param.name,
        photoURL: param.photoUrl,
        age: -1,
        gender: 'unknown',
      };
      this.profile.doc(this.uid).get().then((doc) => {
        if (!doc.exists) doc.ref.set(data);
      });
    }
  }

  readAuth = async () => {
    console.log('ready to download data, userID: ',this.uid);
    let doc = await this.auth.doc(this.uid).get();
    console.log('retrieved from readProfile:', doc.data());
    if (!doc.exists) {
      console.log('No such document!');
    } else {
      return (doc.data());
    }
  }

  readUserInfo = async (UID) => {
    console.log('ready to download data, userID: ',UID);
    let doc = await this.profile.doc(UID).get();
    console.log('retrieved from readProfile:', doc.data());
    if (!doc.exists) {
      console.log('No such document!');
    } else {
      return (doc.data());
    }
  }

  readUserAvatar = async (UID) => {
    // console.log('accessing user Avatar Url, userID: ',UID);
    let doc = await this.auth.doc(UID).get();
    // console.log('retrieved from readUserAvatar:', doc.data());
    if (!doc.exists) {
      console.log('No such document!');
    } else {
      return (doc.data().photoURL);
    }
  }

  readInfo = async () => {
    let doc = await this.profile.doc(this.uid).get();
    if (!doc.exists) {
      console.log('No such document of profile');
      return null;
    } else {
      return (doc.data());
    }
  }

  getFriends = async () => {
    return await this.profile.doc(this.uid).collection('friends').get().then( async (data) => {
      let friends = [];
      data.forEach( (doc) => {
        friends.push({uid: doc.id, name: doc.get('nick'), tag: doc.get('tag')})
      });
      await Promise.all(friends.map( async (friend) => {
        return Promise.all([
          this.getName(friend.uid).then( (name) => {friend.name = name}),
          this.readUserAvatar(friend.uid).then( (uri) => {friend.uri = uri}),
        ]);
      }));
      return friends;
    });
  }

  getPersonalPool = async () => {
    let time = (await this.profile.doc(this.uid).get()).get('time');
    if (time && this.timeLimit(time)) {
      return (await this.profile.doc(this.uid).collection('pool').doc('0').get()).get('data');
    }
    let rid = (data) => {return data.docs.map( (doc) => doc.id )}
    let saved = await Promise.all([
      this.profile.doc(this.uid).collection('places').get().then(rid),
      this.profile.doc(this.uid).collection('friends').get().then(rid),
      this.profile.doc(this.uid).collection('blacklist').get().then(rid),
    ]).then( async ([places, friends, blacklist ]) => {
      let hidden = new Set(friends + blacklist);
      hidden.add(this.uid);
      let alluser = await Promise.all(places.map( (place) => {
        return this.place.doc(place).collection('users').get().then(rid);
      }));
      let counter = {};
      alluser.forEach( (users) => {users.forEach( (user) => {
        if (!hidden.has(user)) counter[user] = (counter[user] || 0) + 1;
      })});
      let items = Object.keys(counter).map((key) => ({uid: key, value: counter[key]}));
      items.sort((first, second) => (second.value - first.value));
      items = items.slice(0, 20);
      await Promise.all(items.map( async (friend) => {
        return Promise.all([
          this.getName(friend.uid).then( (name) => {friend.name = name}),
          this.readUserAvatar(friend.uid).then( (uri) => {friend.uri = uri}),
        ]);
      }));
      return items;
    });
    this.savePersonalPool(saved);
    this.profile.doc(this.uid).update({time: this.timestamp});
    return saved;
  }

  savePersonalPool = (saved) => {
    this.profile.doc(this.uid).collection('pool').doc('0').set({data: saved});
  }

  getCheckedPlaces = async () => {
    return await this.profile.doc(this.uid).collection('places').get().then( async (data) => {
      let places = [];
      data.forEach( (doc) => {
        places.push(doc.data());
      });
      return places;
    });
  }

  getName = async (uid) => {
    let doc = await this.profile.doc(uid).get();
    if (!doc.exists) {
      console.log('No user with this uid:', uid);
      return '';
    } else {
      return doc.get('name');
    }
  }

  getNotification = async () => {
    let doc = await this.notification.where('uid1', '==', this.uid).get();
    let notificationData = [];
    doc.forEach((d) => {
      let pushData = Object.assign({id: d.id}, d.data());
      pushData.time = this.timeSince(pushData.time) + ' ago';
      notificationData.push(pushData);
    });
    await Promise.all(notificationData.map( (notification) => {
      if (notification.uid2) {
        return Promise.all([
          this.getName(notification.uid2).then( (name) => {notification.name = name}),
          this.readUserAvatar(notification.uid2).then( (uri) => {notification.uri = uri}),
        ]);
      } else {
        notification.uri = '../assets/images/robot-dev.png';
        return 0;
      }
    }));
    // console.log(notificationData);
    return notificationData;
  }

  removeNotification = async (id) => {
    await this.notification.doc(id).delete();
  }

  updateInfo = async (param) => {
    if (this.uid) {
      const data = {
        name: param.name,
        age: Number(param.age),
        gender: param.gender,
      };
      await this.profile.doc(this.uid).update(data);
    }
  }

  addFriend = (uid, type='request') => {
    const data = {
      type: type,
      uid1: uid,
      uid2: this.uid,
    };
    this.notification.add(data);
  }

  removeFriend = (uid, type='passive') => {
    if (type != 'passive') {
      const data = {
        type: 'remove',
        uid1: uid,
        uid2: this.uid,
      };
      this.notification.add(data);
    }
    this.profile.doc(this.uid).collection('friends').doc(uid).get().then((doc) => {
      if (doc.exists) doc.ref.delete();
    })
  }

  confirmFriend = (uid, param) => {
    const data = {
      tag: param.tag || '',
      nick: param.nick || '', 
    };
    this.profile.doc(this.uid).collection('friends').doc(uid).set(data);
    this.profile.doc(this.uid).collection('pool').doc(uid).get().then((doc) => {
      if (doc.exists) doc.ref.delete();
    })
  }

  getPlaceInfo = async (placeID, default_param={}) => {
    // console.log("get Place Info placeID", placeID);
    let doc = await this.place.doc(placeID).get();
    if (!doc.exists) {
      console.log("No such place");
      let data = {
        description: default_param.description || '',
        uri: default_param.uri || '',
      }
      await this.place.doc(placeID).set(data);
      return data;
    }
    return doc.data();
  }

  getPlaceURI = async (placeID, marker) => {
    let data = await this.getPlaceInfo(placeID, {description: marker.name, uri: marker.uri});
    if (data && data.uri) {
      return data.uri;
    } else {
      return null;
    }
  }

  addPlaceURI = (placeID, URI) => {
    this.place.doc(placeID).update({uri: URI});
  }

  getPlacePool = async (placeID) => {
    return await this.place.doc(placeID).collection('users').get().then( async (data) => {
      let users = data.docs.map( (doc) => ({uid: doc.id, time: doc.get('time'), value: 0}));
      await Promise.all(users.map( async (user) => {
        return Promise.all([
          this.getName(user.uid).then( (name) => {user.name = name}),
          this.readUserAvatar(user.uid).then( (uri) => {user.uri = uri}),
        ]);
      }));
      return users;
    });
  }

  // mixPool = (placeID, default_param={}) => {
  //   Promise.all([
  //     this.getPlaceInfo(placeID, default_param).then( (data) => {
  //       return (data && data.pool) ? data.pool : [];
  //     }),
  //     this.profile.doc(this.uid).get(),
  //     this.profile.doc(this.uid).collection('friends').get().then( (data) => {
  //       let friends = [];
  //       data.forEach( (doc) => {friends.push(doc.id);} );
  //       return friends;
  //     }),
  //   ]).then( ([place, profile, friends]) => {
  //     if (profile.exists) {
  //       const default_KI = 300;
  //       let num = profile.get('ki') || default_KI;
  //       if (isNaN(num)) num = default_KI;
  //       profile.ref.update({ki: num-1});
  //     }
  //     Promise.all(place.map( async (element) => {
  //       let {uid, value} = element;
  //       if (friends.indexOf(uid) == -1) {
  //         let v = await this.profile.doc(this.uid).collection('pool').doc(uid).get().then((doc) => {
  //           doc.exists ? doc.ref.update({value: doc.get('value') + 1}) : doc.ref.set({value: 1});
  //         });
  //         // await this.profile.doc(this.uid).collection('pool').doc(uid).set({value: v+1});
  //       }
  //     }));
  //   });
  // }

  isVisited = async (placeID) => {
    return await this.place.doc(placeID).collection('users').doc(this.uid).get().then( async (doc) => {
      return doc.exists;
    });
  }

  checkout = (placeID, default_param={}) => {
    return this.getPlaceInfo(placeID, default_param).then( () => {
      this.place.doc(placeID).collection('users').doc(this.uid).delete();
    });
  }

  checkin = (placeID, default_param={}) => {
    return this.getPlaceInfo(placeID, default_param).then( (data) => {
      let time = this.timestamp;
      this.profile.doc(this.uid).collection('places').doc(placeID).set({
        name: data.description,
        time,
      });
      this.place.doc(placeID).collection('users').doc(this.uid).set({
        time,
        value: 0,
      });
    });
  }

  // development tootls:
  // for debug

  generateNotification = () => {
    let data = {
      type: 'sys1',
      uid1: this.uid,
      message: 'System generate the test message',
      time: this.timestamp,
    }
    this.notification.add(data);
  }

  deleteMyPool = () => {
    this.deleteCollection(this.profile.doc(this.uid).collection('pool')).then(()=>{console.log("successfully deleted the pool")});
  }

  deleteAllPool = () => {
    this.profile.get().then((snapshot) => {
      Promise.all(snapshot.docs.map( async (doc) => {
        await this.deleteCollection(doc.ref.collection("pool"));
      })).then(()=>{console.log("successfully clear all users' pool")});
    });
  }

  deleteAllNotification = () => {
    this.deleteCollection(this.notification).then(()=>{console.log("successfully remove all notifications")});
  }

  deleteCollection = (collectionRef) => {
    var query = collectionRef.orderBy('__name__');

    return new Promise((resolve, reject) => {
      this.deleteQueryBatch(query, resolve, reject);
    });
  }

  deleteQueryBatch = (query, resolve, reject) => {
    query.get()
      .then((snapshot) => {
        // When there are no documents left, we are done
        if (snapshot.size == 0) {
          return 0;
        }
        // Delete documents in a batch
        var batch = this.firestore.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        return batch.commit().then(() => {
          return snapshot.size;
        });
      }).then((numDeleted) => {
        if (numDeleted === 0) {
          resolve();
          return;
        }
        // Recurse on the next process tick, to avoid
        // exploding the stack.
        setImmediate(() => {
          this.deleteQueryBatch(query, resolve, reject);
        });
      })
      .catch(reject);
  }

  timeSince = (date) => {
    var seconds = Math.floor((this.timestamp.toDate() - date.toDate()) / 1000);
    var interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
      return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
  }

  timeLimit = (date) => {
    var seconds = Math.floor((this.timestamp.toDate() - date.toDate()) / 1000);
    // 1 day = 86400 seconds, 1 hour = 3600 seconds
    return seconds < 3600;
  }

  get uid() {
    return (firebase.auth().currentUser || {}).uid;
  }
  get timestamp() {
    return firebase.firestore.Timestamp.now();
  }
}

Fire.shared = new Fire();
export default Fire;
