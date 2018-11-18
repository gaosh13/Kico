import React from 'react'
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native'
import { WebBrowser } from 'expo'
import { Ionicons } from '@expo/vector-icons'
import Touchable from 'react-native-platform-touchable'
import Fire from '../components/Fire'

const { width, height } = Dimensions.get('window')

const hRatio = value => {
  return (value / 812) * height
}

const wRatio = value => {
  return (value / 375) * width
}

export default class NotificationScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  constructor(props) {
    super(props)
    this.mountState = false
    this.unsubscribe = false
    this.state = {
      notification: [],
    }
    console.log('checking params', this.props.navigation.state.params)
  }

  onSnapshot(type, msg) {
    // console.log('on', type, msg, this.mountState);
    if (this.mountState) {
      if (type === 'added') {
        for (let i = 0; i < this.state.notification.length; ++i) {
          if (msg.id == this.state.notification[i].id) return
        }
        this.setState(state => {
          let notification = Array.from(state.notification)
          notification.unshift(msg)
          return { notification }
        })
      } else {
        this.setState(state => {
          let notification = Array.from(state.notification)
          for (let i = 0; i < notification.length; ++i) {
            if (msg == notification[i].id) {
              notification.splice(i, 1)
              break
            }
          }
          return { notification }
        })
      }
    }
  }

  componentDidMount() {
    this.mountState = true
    Fire.shared.getNotification().then(data => {
      if (this.mountState && data.length) {
        this.setState({ notification: data })
        this.unsubscribe = Fire.shared.listenNotification((type, msg) => {
          this.onSnapshot(type, msg)
        })
      }
    })
  }

  componentWillUnmount() {
    this.mountState = false
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.titleText}>Notification</Text>
        </View>
        <FlatList
          style={styles.notificationList}
          data={this.state.notification}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderListItem}
        />
        <TouchableOpacity
          style={styles.closeButtonContainer}
          onPress={() => {
            this.props.navigation.navigate('Home')
          }}
        >
          <Image source={require('../assets/icons/close.png')} />
        </TouchableOpacity>
      </View>
    )
  }

  _keyExtractor = (item, index) => {
    return 'notification' + index
  }

  _renderSingleItem = item => {
    if (item.type == 'sys1') {
      return (
        <View style={styles.messageTextContainer}>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      )
    } else if (item.type == 'taski') {
      return (
        <View style={styles.messageTextContainer}>
          <Text style={styles.messageText}>{item.name + ' invited you to a mission'}</Text>
        </View>
      )
    } else if (item.type == 'add1') {
      return (
        <View style={styles.messageTextContainer}>
          <Text style={styles.messageText}>{item.name + ' is now your friend'}</Text>
        </View>
      )
    } else if (item.type == 'add2') {
      return (
        <View style={styles.messageTextContainer}>
          <Button title="Confirm" onPress={() => {}} />
          <Button title="Reject" onPress={() => {}} />
        </View>
      )
    } else {
      return null
    }
  }

  _getImage(item) {
    if (item.type == 'sys1') return require('../assets/images/PlayerX_logo.png')
    else return { uri: item.uri }
  }

  _pressSingleItem = item => {
    if (item.type == 'taski') {
      // console.log("item.task", item.task);
      this.props.navigation.navigate('JoinTaskScreen', { taskID: item.task, from: 'notification' })
    } else if (item.type == 'add1') {
      Alert.alert(
        'Congratulations',
        'You and ' + item.name + ' are friends now.'
        // [
        //   {text: 'No', onPress: () => console.warn('NO Pressed'), style: 'cancel'},
        //   {text: 'Yes', onPress: () => {console.warn('YES Pressed'); Fire.shared.addFriend(item.uid2, "add2")} },
        // ]
      )
    }
  }

  _renderListItem = ({ item }) => {
    let displayText = 'Here comes a new message'
    // console.log("item.uri", item.uri);
    return (
      <TouchableOpacity style={styles.itemContainer} onPress={() => this._pressSingleItem(item)}>
        <View
          style={{
            flex: 0.25,
            // borderWidth: 1, borderColor: '#000'
          }}
        >
          <Image style={styles.userImage} source={this._getImage(item)} />
        </View>
        <View
          style={{
            flex: 0.75,
            justifyContent: 'center',
            // borderWidth: 1, borderColor: '#000',
          }}
        >
          {this._renderSingleItem(item)}
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.timestampText}>{item.time}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteNotificationContainer}
              onPress={() => {
                Fire.shared.removeNotification(item.id)
              }}
            >
              <Image
                style={{ width: 20, height: 20 }}
                source={require('../assets/icons/remove.png')}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    backgroundColor: '#FAFBFD',
  },
  userImage: {
    borderRadius: 32,
    height: 64,
    width: 64,
  },
  messageText: {
    fontSize: 15,
    color: '#072A4E',
  },
  timestampText: {
    fontSize: 10,
    color: '#C7C6CE',
    fontWeight: 'bold',
  },
  titleText: {
    fontSize: 32,
    marginLeft: wRatio(18),
    color: '#313254',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  itemContainer: {
    // borderWidth: 1,
    // borderColor: '#ccc',
    marginTop: 5,
    marginBottom: 5,
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageTextContainer: {
    height: '60%',
    // justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: '#f00',
  },
  notificationList: {
    marginLeft: wRatio(18),
    paddingRight: wRatio(18),
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 30,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
    // backgroundColor: '#fff',
  },
  deleteNotificationContainer: {
    borderRadius: 20,
    width: 20,
    height: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000000',
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
  },
})
