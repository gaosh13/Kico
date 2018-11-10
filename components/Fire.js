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
        if (!doc.exists) doc.ref.set(data);
      });
    }
  }

  setInfo = (param) => {
    if (this.uid) {
      const data = {
        uid: this.uid,
        name: param.name,
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
    console.log('accessing user Avatar Url, userID: ',UID);
    let doc = await this.auth.doc(UID).get();
    console.log('retrieved from readUserAvatar:', doc.data());
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
    // let data = await this.readInfo();
    // let friendsData = [];
    // if (data && data.friends) {
    //   for (let i = 0; i < data.friends.length; ++i) {
    //     let element = data.friends[i];
    //     let name = await Fire.shared.getName(element.uid);
    //     friendsData.push({
    //       uid: element.uid,
    //       name: element.nick || name,
    //       tag: element.tag,
    //     });
    //   }
    // }
    // return friendsData;
    return await this.profile.doc(this.uid).collection('friends').get().then( async (data) => {
      let friends = [];
      data.forEach( (doc) => {
        friends.push({uid: doc.id, name: doc.get('nick'), tag: doc.get('tag')})
      });
      return await Promise.all(friends.map( async (friend) => {
        if (!friend.name) friend.name = await this.getName(friend.uid);
        return friend;
      }));
    });
  }

  getPersonalPool = async () => {
    return await this.profile.doc(this.uid).collection('pool').get().then( async (data) => {
      let friends = [];
      data.forEach( (doc) => {
        if (doc.id != this.uid)
          friends.push({uid: doc.id, value: doc.get('value')})
      });
      return await Promise.all(friends.map( async (friend) => {
        if (!friend.name) friend.name = await this.getName(friend.uid);
        return friend;
      })).then( (poolData) => {
        poolData.sort(function(a, b) {return b.value-a.value});
        return poolData;
      });
    });
    // let data = await this.readInfo();
    // let poolData = [];
    // if (data && data.pool) {
    //   for (let i = 0; i < data.pool.length; ++i) {
    //     let element = data.pool[i];
    //     let name = await this.getName(element.uid);
    //     if (element.uid != this.uid) poolData.push({
    //       uid: element.uid,
    //       name: name,
    //       value: element.value,
    //     });
    //   }
    //   poolData.sort((a, b) => {b.value-a.value});
    // }
    // return poolData;
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
    // for (let notification of notificationData) {
    //   notification.name = await this.getName(notification.uid);
    // }
    console.log(notificationData);
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
    // this.readInfo().then( (info) => {
    //   if (info && info.friends) {
    //     for (let i = 0; i < info.friends.length; ++i) {
    //       if (info.friends[i].uid == uid) {
    //         this.profile.doc(this.uid).update({
    //           friends: firebase.firestore.FieldValue.arrayRemove(info.friends[i]),
    //         })
    //         break;
    //       }
    //     }
    //   }
    // });
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
    // this.readInfo().then((info) => {
    //   if (info && info.pool) {
    //     for (let i = 0; i < info.pool.length; ++i) {
    //       if (info.pool[i].uid == uid) {
    //         this.profile.doc(this.uid).update({
    //           pool: firebase.firestore.FieldValue.arrayRemove(info.pool[i]),
    //         })
    //         break;
    //       }
    //     }
    //   }
    // });
  }

  getPlaceInfo = async (placeID, default_param={}) => {
    // console.log("get Place Info placeID", placeID);
    let doc = await this.place.doc(placeID).get();
    if (!doc.exists) {
      console.log("No such place");
      let data = {
        description: default_param.description || '',
        uri: default_param.uri || '',
        pool: []
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
    return this.place.doc(placeID).update({uri: URI});
  }

  getPlacePool = async (placeID) => {
    return await this.getPlaceInfo(placeID).then( (data) => {
      if (data && data.pool) {
        return Promise.all(data.pool.map( (element) => {
          return this.getName(element.uid).then( (name) => {
            return {
              uid: element.uid,
              name: name,
              value: element.value,
            }
          });
        }));
      } else return [];
    }).then( (poolData) => {
      poolData.sort(function(a, b) {return b.value-a.value});
      return poolData;
    });
  }

  mixPool = (placeID, default_param={}) => {
    Promise.all([
      this.getPlaceInfo(placeID, default_param).then( (data) => {
        return (data && data.pool) ? data.pool : [];
      }),
      this.profile.doc(this.uid).get(),
      this.profile.doc(this.uid).collection('friends').get().then( (data) => {
        let friends = [];
        data.forEach( (doc) => {friends.push(doc.id);} );
        return friends;
      }),
    ]).then( ([place, profile, friends]) => {
      if (profile.exists) {
        const default_KI = 300;
        let num = profile.get('ki') || default_KI;
        if (isNaN(num)) num = default_KI;
        profile.ref.update({ki: num-1});
      }
      Promise.all(place.map( async (element) => {
        let {uid, value} = element;
        if (friends.indexOf(uid) == -1) {
          let v = await this.profile.doc(this.uid).collection('pool').doc(uid).get().then((doc) => {
            doc.exists ? doc.ref.update({value: doc.get('value') + 1}) : doc.ref.set({value: 1});
          });
          // await this.profile.doc(this.uid).collection('pool').doc(uid).set({value: v+1});
        }
      }));
    });
    // Promise.all([this.getPlaceInfo(placeID, default_param), this.readInfo()]).then( ([data, info]) => {
    //   if (data && data.pool) {
    //     let friendList = info.friends ? info.friends.map(x => x.uid) : [];
    //     let poolList = info.pool ? info.pool.map(x => x.uid): [];
    //     if (!info.pool) info.pool = [];
    //     data.pool.forEach((element) => {
    //       let {uid, value} = element;
    //       if (friendList.indexOf(uid) == -1) {
    //         let k = poolList.indexOf(uid);
    //         if (k == -1) {
    //           poolList.push(uid);
    //           info.pool.push({uid, value});
    //         } else {
    //           info.pool[k].value += value;
    //         }
    //       }
    //     });
    //     console.log('Before update', info);
    //     this.profile.doc(this.uid).update(info);
    //   }
    // });
  }

  updateVisit = (placeID, default_param={}) => {
    this.getPlaceInfo(placeID, default_param).then( (data) => {
      if (data && data.pool) {
        for (let i = 0; i < data.pool.length; ++i) {
          if (data.pool[i].uid == this.uid) {
            let kiValue = data.pool[i];
            this.place.doc(placeID).update({
              pool: firebase.firestore.FieldValue.arrayRemove(kiValue),
            });
            break;
          }
        }
        let kiValue = {uid: this.uid, value: 0, time: this.timestamp};
        this.place.doc(placeID).update({
          pool: firebase.firestore.FieldValue.arrayUnion(kiValue),
        });
        // kiValue.value++;
        // this.place.doc(placeID).update({
        //   pool: firebase.firestore.FieldValue.arrayUnion(kiValue),
        // });
      }
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
      let docRefs = [];
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

  get uid() {
    return (firebase.auth().currentUser || {}).uid;
  }
  get timestamp() {
    return firebase.firestore.Timestamp.now();
  }
}

Fire.shared = new Fire();
export default Fire;
