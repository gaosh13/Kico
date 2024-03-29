import React from 'react'
const firebase = require('firebase')
// Required for side-effects
require('firebase/firestore')
import { REACT_APP_FIREBASE_APIKEY } from 'react-native-dotenv'

class Fire extends React.Component {
  constructor(props) {
    super(props)

    firebase.initializeApp({
      apiKey: REACT_APP_FIREBASE_APIKEY,
      authDomain: 'playerx-a68cb.firebaseapp.com',
      databaseURL: 'https://playerx-a68cb.firebaseio.com',
      projectId: 'playerx-a68cb',
      storageBucket: 'playerx-a68cb.appspot.com',
      messagingSenderId: '170596970815',
    })
    this.setAuth = this.setAuth.bind(this)
    const firestore = firebase.firestore()
    const settings = { timestampsInSnapshots: true }
    firestore.settings(settings)
    this.firestore = firestore
    this.auth = firestore.collection('users')
    this.profile = firestore.collection('profiles')
    this.notification = firestore.collection('notification')
    this.place = firestore.collection('places')
    this.task = firestore.collection('tasks')
    this.messages = firestore.collection('messages')
    console.log(
      'Fire module has been called and initialized, user status:',
      firebase.auth().currentUser
    )
  }

  setAuth = param => {
    console.log('ready to update, userID: ', this.uid)
    if (this.uid) {
      const data = {
        uid: this.uid,
        name: param.name,
        photoURL: param.photoUrl,
        method: param.method,
        methodID: param.userid,
        pushNotificationToken: param.pushNotificationToken || '',
      }
      this.auth
        .doc(this.uid)
        .get()
        .then(doc => {
          if (!doc.exists) {
            doc.ref.set(data)
            return true
          } else {
            doc.ref.set(data)
            return
          }
        })
    }
  }

  setInfo = param => {
    if (this.uid) {
      const data = {
        uid: this.uid,
        name: param.name,
        photoURL: param.photoUrl,
        age: -1,
        gender: 'unknown',
      }
      this.profile
        .doc(this.uid)
        .get()
        .then(doc => {
          if (!doc.exists) doc.ref.set(data)
          else doc.ref.update({ photoURL: param.photoUrl })
        })
    }
  }

  readAuth = async () => {
    // console.log('ready to download data, userID: ',this.uid)
    let doc = await this.auth.doc(this.uid).get()
    // console.log('retrieved from readProfile:', doc.data())
    if (!doc.exists) {
      console.log('No such document!')
    } else {
      return doc.data()
    }
  }

  readOtherAuth = async UID => {
    // console.log('ready to download data, userID: ',this.uid)
    let doc = await this.auth.doc(UID).get()
    // console.log('retrieved from readProfile:', doc.data())
    if (!doc.exists) {
      console.log('No such document!')
    } else {
      return doc.data()
    }
  }

  readUserInfo = async UID => {
    console.log('ready to download data, userID: ', UID)
    let doc = await this.profile.doc(UID).get()
    // console.log('retrieved from readProfile:', doc.data())
    if (!doc.exists) {
      console.log('No such document!')
    } else {
      return doc.data()
    }
  }

  readUserAvatar = async UID => {
    // console.log('accessing user Avatar Url, userID: ',UID)
    let doc = await this.auth.doc(UID).get()
    // console.log('retrieved from readUserAvatar:', doc.data())
    if (!doc.exists) {
      console.log('No such document!')
    } else {
      return doc.data().photoURL
    }
  }

  readInfo = async () => {
    let doc = await this.profile.doc(this.uid).get()
    if (!doc.exists) {
      console.log('No such document of profile')
      return null
    } else {
      return doc.data()
    }
  }

  getFriends = async () => {
    return await this.profile
      .doc(this.uid)
      .collection('friends')
      .get()
      .then(async data => {
        let friends = []
        data.forEach(doc => {
          friends.push({ uid: doc.id, name: doc.get('nick'), tag: doc.get('tag') })
        })
        await Promise.all(
          friends.map(friend => {
            return this.getNameNAvatar(friend.uid).then(data => Object.assign(friend, data))
          })
        )
        return friends
      })
  }

  getFriend = async uid => {
    return await this.profile
      .doc(this.uid)
      .collection('friends')
      .doc(uid)
      .get()
  }

  getPersonalPool = async (refresh_time = 0) => {
    let time = (await this.profile.doc(this.uid).get()).get('time')
    if (time && this.timeLimit(time, refresh_time)) {
      return (await this.profile
        .doc(this.uid)
        .collection('pool')
        .doc('0')
        .get()).get('data')
    }
    let rid = data => {
      return data.docs.map(doc => doc.id)
    }
    let saved = await Promise.all([
      this.profile
        .doc(this.uid)
        .collection('places')
        .get()
        .then(rid),
      this.profile
        .doc(this.uid)
        .collection('friends')
        .get()
        .then(rid),
      this.profile
        .doc(this.uid)
        .collection('blacklist')
        .get()
        .then(rid),
    ]).then(async ([places, friends, blacklist]) => {
      let hidden = new Set(friends.concat(blacklist))
      hidden.add(this.uid)
      // console.log('hiddenlist', friends, hidden)
      let alluser = await Promise.all(
        places.map(place => {
          return this.place
            .doc(place)
            .collection('users')
            .get()
            .then(rid)
        })
      )
      let counter = {}
      alluser.forEach(users => {
        users.forEach(user => {
          if (!hidden.has(user)) counter[user] = (counter[user] || 0) + 1
        })
      })
      let items = Object.keys(counter).map(key => ({ uid: key, value: counter[key] }))
      items.sort((first, second) => second.value - first.value)
      items = items.slice(0, 15)
      await Promise.all(
        items.map(friend => {
          return this.getNameNAvatar(friend.uid).then(data => Object.assign(friend, data))
        })
      )
      return items
    })
    this.savePersonalPool(saved)
    this.profile.doc(this.uid).update({ time: this.timestamp })
    return saved
  }

  savePersonalPool = saved => {
    this.profile
      .doc(this.uid)
      .collection('pool')
      .doc('0')
      .set({ data: saved })
  }

  getCheckedPlaces = async (uid = this.uid) => {
    return await this.profile
      .doc(uid)
      .collection('places')
      .get()
      .then(data => {
        return data.docs.map(doc => {
          const time = doc.get('time').toDate()
          return {
            name: doc.get('name'),
            uri: doc.get('uri'),
            time: time.getMonth() + 1 + '/' + time.getDate() + '/' + time.getFullYear(),
            id: doc.id,
            rawTime: doc.get('time').seconds,
          }
        })
      })
  }

  getCommonPlaces = async uid => {
    let [places0, places1] = await Promise.all([
      this.getCheckedPlaces(),
      this.getCheckedPlaces(uid),
    ])
    let a = new Set(places0.map(d => d.id))
    return places1.filter(d => a.has(d.id))
  }

  getName = async uid => {
    let doc = await this.profile.doc(uid).get()
    if (!doc.exists) {
      console.log('No user with this uid:', uid)
      return ''
    } else {
      return doc.get('name')
    }
  }

  getNameNAvatar = async uid => {
    let doc = await this.profile.doc(uid).get()
    if (!doc.exists) {
      console.log('No user with this uid:', uid)
      return {}
    } else {
      return { name: doc.get('name'), uri: doc.get('photoURL') }
    }
  }

  listenNotification = refreshFunc => {
    return this.notification.where('uid1', '==', this.uid).onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        const doc = change.doc
        // console.log('firelisten', change.type, doc.data())
        if (change.type == 'added') {
          let notification = Object.assign({ id: doc.id }, doc.data())
          notification.rawTime = notification.time.seconds
          notification.time = this.timeSince(notification.time) + 'ago'
          if (this.notification.uid2) {
            this.getNameNAvatar(notification.uid2).then(data => {
              Object.assign(notification, data)
              refreshFunc('added', notification)
            })
          } else refreshFunc('added', notification)
        } else if (change.type == 'removed') {
          refreshFunc('removed', doc.id)
        }
      })
    })
  }

  getNotification = async () => {
    let doc = await this.notification.where('uid1', '==', this.uid).get()
    let notificationData = []
    doc.forEach(d => {
      let pushData = Object.assign({ id: d.id }, d.data())
      pushData = Object.assign(pushData, { rawTime: pushData.time.seconds })
      pushData.time = this.timeSince(pushData.time) + ' ago'
      notificationData.push(pushData)
    })
    notificationData = notificationData.sort((a, b) => {
      return b.rawTime - a.rawTime
    })
    // console.log('New Notifications retrieved: ', notificationData)
    await Promise.all(
      notificationData.map(notification => {
        if (notification.uid2) {
          return this.getNameNAvatar(notification.uid2).then(data =>
            Object.assign(notification, data)
          )
        } else {
          notification.uri = '../assets/images/robot-dev.png'
          return 0
        }
      })
    )
    // console.log(notificationData)
    return notificationData
  }

  removeNotification = async id => {
    await this.notification.doc(id).delete()
  }

  updateInfo = async param => {
    if (this.uid) {
      const data = {
        name: param.name,
        age: Number(param.age) || 0,
        gender: param.gender,
        intro: param.intro || '',
      }
      await this.profile.doc(this.uid).update(data)
    }
  }

  hasTask = task => {
    return this.profile
      .doc(this.uid)
      .collection('tasks')
      .doc(task)
      .get()
      .then(doc => {
        return doc.exists
      })
  }

  addFriend = (uid, type = 'add1') => {
    return this.profile
      .doc(this.uid)
      .collection('friends')
      .doc(uid)
      .get()
      .then(doc => {
        this.profile
          .doc(this.uid)
          .collection('messages')
          .doc(uid)
          .get()
          .then(doc => {
            if (doc.exists) {
              doc.ref.update({
                isFriend: true,
              })
            } else {
              doc.ref.set({ isFriend: true })
            }
          })
        this.profile
          .doc(uid)
          .collection('messages')
          .doc(this.uid)
          .get()
          .then(doc => {
            if (doc.exists) {
              doc.ref.update({
                isFriend: true,
              })
            } else {
              doc.ref.set({ isFriend: true })
            }
          })
        if (doc.exists) return Promise.reject('')
        const data = {
          type: type,
          time: this.timestamp,
          uid1: uid,
          uid2: this.uid,
        }
        return Promise.all([
          this.notification.add(data),
          this.profile
            .doc(this.uid)
            .collection('friends')
            .doc(uid)
            .set({ tag: 'friend', nick: '' }),
          this.profile
            .doc(uid)
            .collection('friends')
            .doc(this.uid)
            .set({ tag: 'friend', nick: '' }),
        ])
      })
  }

  removeFriend = (uid, type = 'passive') => {
    if (type != 'passive') {
      const data = {
        type: 'rm1',
        time: this.timestamp,
        uid1: uid,
        uid2: this.uid,
      }
      this.notification.add(data)
    }
    this.profile
      .doc(this.uid)
      .collection('friends')
      .doc(uid)
      .delete()
  }

  startTasks = async (uids, param) => {
    const data = {
      users: [this.uid],
      where: param.where,
      what: param.what,
      when: firebase.firestore.Timestamp.fromDate(param.when),
    }
    let taskID = (await this.task.add(data)).id
    const baseNotification = {
      type: 'taski',
      uid2: this.uid,
      task: taskID,
      time: this.timestamp,
    }
    return await Promise.all(
      uids
        .map(uid => {
          return this.notification.add({
            uid1: uid,
            ...baseNotification,
          })
        })
        .concat([
          this.profile
            .doc(this.uid)
            .collection('tasks')
            .doc(taskID)
            .set({ value: 0 }),
        ])
    )
  }

  joinTask = taskID => {
    return this.task
      .doc(taskID)
      .get()
      .then(doc => {
        if (doc.exists) {
          return Promise.all([
            doc.ref.update({
              users: firebase.firestore.FieldValue.arrayUnion(this.uid),
            }),
            this.profile
              .doc(this.uid)
              .collection('tasks')
              .doc(taskID)
              .set({ value: 0 }),
          ])
        } else return null
      })
  }

  ungoingTask = taskID => {
    return this.task
      .doc(taskID)
      .get()
      .then(doc => {
        if (doc.exists) {
          return Promise.all([
            doc.ref.update({
              users: firebase.firestore.FieldValue.arrayRemove(this.uid),
            }),
            this.profile
              .doc(this.uid)
              .collection('tasks')
              .doc(taskID)
              .delete(),
          ])
        } else return null
      })
  }

  taskCheckin = taskID => {
    return this.task
      .doc(taskID)
      .collection('users')
      .doc(this.uid)
      .set({ time: this.timestamp })
  }

  listenTaskUsers = (taskID, refreshFunc) => {
    return this.task
      .doc(taskID)
      .collection('users')
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          const doc = change.doc
          // console.log("listen", doc.data(), change.type)
          if (change.type == 'added' || change.type == 'modified') {
            refreshFunc(doc.id, doc.get('time'))
          }
        })
      })
  }

  getTaskInfo = async taskID => {
    const doc = await this.task.doc(taskID).get()
    if (!doc.exists) {
      console.log('No such task')
      return {}
    }
    let taskInfo = { ...doc.data(), id: taskID }
    let isGoing = false
    // console.log('task1', taskInfo)
    ;[taskInfo.users, taskInfo.where] = await Promise.all([
      Promise.all(
        taskInfo.users.map(async user => {
          let { name, uri } = await this.getNameNAvatar(user)
          if (user == this.uid) isGoing = true
          return {
            uid: user,
            name,
            uri,
          }
        })
      ),
      this.getPlaceInfo(taskInfo.where).then(data => {
        return { id: taskInfo.where, name: data.description, uri: data.uri }
      }),
    ])
    formatDate = when => {
      const time = when.toDate()
      let hours = time.getHours(),
        minutes = time.getMinutes()
      let ampm = hours >= 12 ? 'pm' : 'am'
      hours = ((hours + 11) % 12) + 1
      minutes = minutes < 10 ? '0' + minutes : minutes
      return (
        time.getMonth() +
        1 +
        '/' +
        time.getDate() +
        ' @ ' +
        hours +
        ':' +
        time.getMinutes() +
        ' ' +
        ampm
      )
    }
    try {
      taskInfo.time = taskInfo.when.toDate()
      taskInfo.when = formatDate(taskInfo.when)
    } catch (e) {
      console.log('not a date')
    }
    taskInfo.isGoing = isGoing
    return taskInfo
  }

  getTaskInfoNoUsers = async taskID => {
    const doc = await this.task.doc(taskID).get()
    if (!doc.exists) {
      console.log('No such task')
      return {}
    }
    let taskInfo = {
      what: doc.get('what'),
      where: doc.get('where'),
      when: doc.get('when'),
      id: taskID,
    }
    ;(taskInfo.where = await this.getPlaceInfo(taskInfo.where).then(data => {
      return { name: data.description, uri: data.uri }
    })),
      (formatDate = when => {
        const time = when.toDate()
        let hours = time.getHours(),
          minutes = time.getMinutes()
        let ampm = hours >= 12 ? 'pm' : 'am'
        hours = ((hours + 11) % 12) + 1
        minutes = minutes < 10 ? '0' + minutes : minutes
        return (
          time.getMonth() +
          1 +
          '/' +
          time.getDate() +
          ' @ ' +
          hours +
          ':' +
          time.getMinutes() +
          ' ' +
          ampm
        )
      })
    try {
      taskInfo.time = taskInfo.when.seconds
      taskInfo.when = formatDate(taskInfo.when)
    } catch (e) {
      console.log('not a date')
    }
    return taskInfo
  }

  getTaskList = async () => {
    return (await this.profile
      .doc(this.uid)
      .collection('tasks')
      .get()
      .then(async snapshot => {
        let taskList = snapshot.docs.map(doc => {
          return { id: doc.id }
        })
        // console.log('taskList', taskList)
        await Promise.all(
          taskList.map(task => {
            return this.getTaskInfoNoUsers(task.id).then(data => Object.assign(task, data))
          })
        )
        // console.log("taskList", taskList)
        return taskList
      }))
      .filter(e => e.what)
      .sort((a, b) => {
        return (b.time || 0) - (a.time || 0)
      })
  }

  deleteTask = async taskID => {
    const doc = await this.task.doc(taskID).get()
    if (!doc.exists) {
      console.log('No such task')
      return Promise.resolve({})
    }
    let taskUsers = doc.get('users') || []
    return await Promise.all(
      taskUsers
        .map(async user => {
          return this.profile
            .doc(user)
            .collection('tasks')
            .doc(taskID)
            .delete()
        })
        .concat([doc.ref.delete()])
    )
  }

  getPlaceInfo = async (placeID, default_param = {}) => {
    // console.log("get Place Info placeID", placeID)
    let doc = await this.place.doc(placeID).get()
    if (!doc.exists) {
      console.log('No such place', default_param)
      let data = {
        description: default_param.description || '',
        uri: default_param.uri || '',
      }
      if (default_param.description) {
        await this.place.doc(placeID).set(data)
      }
      return data
    }
    return doc.data()
  }

  getPlaceURI = async (placeID, marker) => {
    let data = await this.getPlaceInfo(placeID, { description: marker.name, uri: marker.uri })
    if (data && data.uri) {
      return data.uri
    } else {
      return null
    }
  }

  addPlaceURI = (placeID, URI) => {
    this.place.doc(placeID).update({ uri: URI })
  }

  getPlacePool = async placeID => {
    return await this.place
      .doc(placeID)
      .collection('users')
      .get()
      .then(async data => {
        let users = data.docs.map(doc => ({ uid: doc.id, time: doc.get('time'), value: 0 }))
        await Promise.all(
          users.map(user => {
            return this.getNameNAvatar(user.uid).then(data => Object.assign(user, data))
          })
        )
        // console.log('getPlacePool: ',typeof users[0].time.seconds)
        users = users.sort((a, b) => {
          return b.time.seconds - a.time.seconds
        })
        return users
      })
  }

  isVisited = async placeID => {
    return await this.place
      .doc(placeID)
      .collection('users')
      .doc(this.uid)
      .get()
      .then(async doc => {
        return doc.exists
      })
  }

  checkout = (placeID, default_param = {}) => {
    return this.getPlaceInfo(placeID, default_param).then(() => {
      this.place
        .doc(placeID)
        .collection('users')
        .doc(this.uid)
        .delete()
      this.profile
        .doc(this.uid)
        .collection('places')
        .doc(placeID)
        .delete()
    })
  }

  checkin = (placeID, default_param = {}) => {
    return this.getPlaceInfo(placeID, default_param).then(data => {
      let time = this.timestamp
      this.profile
        .doc(this.uid)
        .collection('places')
        .doc(placeID)
        .set({
          name: data.description,
          uri: data.uri,
          time,
        })
      this.place
        .doc(placeID)
        .collection('users')
        .doc(this.uid)
        .set({
          time,
          value: 0,
        })
    })
  }

  // development tootls:
  // for debug

  fixFriendList = () => {
    this.profile
      .doc(this.uid)
      .collection('friends')
      .get()
      .then(snapshot => {
        return Promise.all(
          snapshot.docs.map(docf => {
            let uid = docf.id
            this.profile
              .doc(this.uid)
              .collection('messages')
              .doc(uid)
              .get()
              .then(doc => {
                if (doc.exists) {
                  doc.ref.update({
                    isFriend: true,
                  })
                } else {
                  doc.ref.set({ isFriend: true })
                }
              })
            this.profile
              .doc(uid)
              .collection('messages')
              .doc(this.uid)
              .get()
              .then(doc => {
                if (doc.exists) {
                  doc.ref.update({
                    isFriend: true,
                  })
                } else {
                  doc.ref.set({ isFriend: true })
                }
              })
            this.profile
              .doc(this.uid)
              .collection('friends')
              .doc(uid)
              .set({ tag: 'friend', nick: '' })
            this.profile
              .doc(uid)
              .collection('friends')
              .doc(this.uid)
              .set({ tag: 'friend', nick: '' })
          })
        )
      })
      .then(() => {
        console.log('successfully fix the friend list')
      })
  }

  transferAllImages = () => {
    this.auth
      .get()
      .then(snapshot => {
        return Promise.all(
          snapshot.docs.map(async doc => {
            const { uid, photoURL } = doc.data()
            return await this.profile.doc(uid).update({ photoURL })
          })
        )
      })
      .then(() => {
        console.log('successfully transfer all photoURL')
      })
  }

  generateNotification = () => {
    let data = {
      type: 'sys1',
      uid1: this.uid,
      message: 'System generate the test message',
      time: this.timestamp,
    }
    this.notification.add(data)
  }

  deleteMyPool = () => {
    this.deleteCollection(this.profile.doc(this.uid).collection('pool')).then(() => {
      console.log('successfully deleted the pool')
    })
  }

  deleteAllPool = () => {
    this.profile.get().then(snapshot => {
      Promise.all(
        snapshot.docs.map(async doc => {
          await this.deleteCollection(doc.ref.collection('pool'))
        })
      ).then(() => {
        console.log("successfully clear all users' pool")
      })
    })
  }

  deleteAllNotification = () => {
    this.deleteCollection(this.notification).then(() => {
      console.log('successfully remove all notifications')
    })
  }

  deleteCollection = collectionRef => {
    var query = collectionRef.orderBy('__name__')

    return new Promise((resolve, reject) => {
      this.deleteQueryBatch(query, resolve, reject)
    })
  }

  deleteQueryBatch = (query, resolve, reject) => {
    query
      .get()
      .then(snapshot => {
        // When there are no documents left, we are done
        if (snapshot.size == 0) {
          return 0
        }
        // Delete documents in a batch
        var batch = this.firestore.batch()
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref)
        })

        return batch.commit().then(() => {
          return snapshot.size
        })
      })
      .then(numDeleted => {
        if (numDeleted === 0) {
          resolve()
          return
        }
        // Recurse on the next process tick, to avoid
        // exploding the stack.
        setImmediate(() => {
          this.deleteQueryBatch(query, resolve, reject)
        })
      })
      .catch(reject)
  }

  timeSince = date => {
    var seconds = Math.floor((this.timestamp.toDate() - date.toDate()) / 1000)
    var interval = Math.floor(seconds / 31536000)
    if (interval > 1) {
      return interval + ' years'
    }
    interval = Math.floor(seconds / 2592000)
    if (interval > 1) {
      return interval + ' months'
    }
    interval = Math.floor(seconds / 86400)
    if (interval > 1) {
      return interval + ' days'
    }
    interval = Math.floor(seconds / 3600)
    if (interval > 1) {
      return interval + ' hours'
    }
    interval = Math.floor(seconds / 60)
    if (interval > 1) {
      return interval + ' minutes'
    }
    return Math.floor(seconds) + ' seconds'
  }

  timeLimit = (date, time = 0) => {
    var seconds = Math.floor((this.timestamp.toDate() - date.toDate()) / 1000)
    // 1 day = 86400 seconds, 1 hour = 3600 seconds
    // console.log("limit", seconds, time)
    return seconds < time
  }

  timeLimit_date = (date, time = 0) => {
    var seconds = Math.abs(Math.floor((this.timestamp.toDate() - date) / 1000))
    console.log('seconds', seconds)
    return seconds < time
  }

  getChatHistory = async () => {
    const historys = await this.profile
      .doc(this.uid)
      .collection('messages')
      .get()
    const chatList = []
    historys.forEach(history => {
      chatList.push({ uid: history.id, ...history.data() })
    })
    // console.log(chatList)
    return (await Promise.all(
      chatList.map(chat => {
        return this.getNameNAvatar(chat.uid).then(profile => ({
          ...chat,
          ...profile,
        }))
      })
    )).sort((a, b) => {
      return (b.updatedAt || 0) - (a.updatedAt || 0)
    })
  }

  getMessages = async docIds => {
    return Promise.all(
      docIds.map(id => {
        return this.messages.doc(id).get()
      })
    )
  }

  addMessage = async (msg, toUid, isFriend) => {
    const msgId = (await this.messages.add(msg)).id
    this.profile
      .doc(this.uid)
      .collection('messages')
      .doc(toUid)
      .collection('messages')
      .doc(msgId)
      .set({ createdAt: msg.createdAt })

    const toDocRef = this.profile
      .doc(toUid)
      .collection('messages')
      .doc(this.uid)
    toDocRef.get().then(doc => {
      if (doc.exists) {
        doc.ref.update({
          unreadCount: (doc.data().unreadCount || 0) + 1,
          updatedAt: msg.createdAt,
          text: msg.text,
          isFriend,
        })
      } else {
        doc.ref.set({ unreadCount: 1, updatedAt: msg.createdAt, text: msg.text, isFriend })
      }
    })
    toDocRef
      .collection('messages')
      .doc(msgId)
      .set({ createdAt: msg.createdAt })
    return msgId
  }

  addMessageFromTask = async (msg, taskID) => {
    const msgId = (await this.messages.add(msg)).id
    this.task
      .doc(taskID)
      .collection('messages')
      .doc(msgId)
      .set({ createdAt: msg.createdAt })
    return msgId
  }

  readMessage = toUid => {
    this.profile
      .doc(this.uid)
      .collection('messages')
      .doc(toUid)
      .get()
      .then(doc => {
        if (doc.exists) {
          doc.ref.update({ unreadCount: 0 })
        } else {
          doc.ref.set({ unreadCount: 0 })
        }
      })
  }

  calculateRemainingMessages = (messages, limit, refreshTime = 86400000) => {
    // 1 day = 86400 seconds, 1 hour = 3600 seconds, numbers we are currently considering is in milliseconds
    count = 0
    console.log('limit: ', limit, 'count: ', count)
    let currentTime = new Date().getTime()
    console.log('current time: ', currentTime)
    console.log(messages)
    let ceiling = limit
    if (messages.length < limit) ceiling = messages.length
    while (count < ceiling) {
      if (currentTime - messages[count].createdAt > refreshTime) {
        console.log('while loop broken immaturely')
        break
      } else {
        count++
      }
    }
    console.log('AAAAAAQQ', count)
    return limit - count
  }

  toTimeStamp = date => {
    return firebase.firestore.Timestamp(date)
  }

  get uid() {
    return (firebase.auth().currentUser || {}).uid
  }
  get timestamp() {
    return firebase.firestore.Timestamp.now()
  }
}

Fire.shared = new Fire()
export default Fire
