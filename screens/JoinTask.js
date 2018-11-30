import React from 'react'
import {
  ScrollView,
  FlatList,
  TouchableHighlight,
  StyleSheet,
  View,
  Text,
  Image,
  Button,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Location, Permissions } from 'expo'
import Fire from '../components/Fire'
import { generateCirclesRow } from '../components/KiVisual'
import GenericScreen from '../components/GenericScreen'
import AwesomeButton from 'react-native-really-awesome-button'
import QRCode from 'react-native-qrcode-svg'
import { REACT_APP_FOURSQUARE_ID, REACT_APP_FOURSQUARE_SECRET } from 'react-native-dotenv'

const { width, height } = Dimensions.get('window')

const hRatio = value => {
  return (value / 812) * height
}

const wRatio = value => {
  return (value / 375) * width
}

export default class CheckInScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  constructor(props) {
    super(props)
    this.state = {
      pool: [],
      where: {},
      what: '',
      when: '',
      isGoing: false,
    }
  }

  onSnapshot(uid, time) {
    if (Fire.shared.timeLimit(time, 60)) {
      this.setState(state => {
        // console.log("old pool", state.pool)
        let pool = Array.from(state.pool)
        for (let i = 0; i < pool.length; ++i) {
          if (pool[i].uid == uid) {
            pool[i].hidden = false
          }
        }
        // console.log("new pool", pool)
        return { pool }
      })
    }
  }

  async componentDidMount() {
    await this.fetchdata(false)
    // console.log("mypool", this.state.pool)
    this.unsubscribe = Fire.shared.listenTaskUsers(this._taskID, (uid, time) => {
      this.onSnapshot(uid, time)
    })
    TaskLocation.prototype.checkLocation(this.state.where.id).then(local => {
      if (local) Fire.shared.taskCheckin(this._taskID)
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  async fetchdata(refresh = false) {
    if (!this.props.navigation.getParam('task') || refresh) {
      const task = this._taskID
      return Fire.shared.getTaskInfo(task).then(taskInfo => {
        const { users: pool = [], where = {}, what, when, isGoing } = taskInfo
        for (let i = 0; i < pool.length; ++i) pool[i].hidden = true
        this.setState({ pool, where, what, when, isGoing })
      })
    } else {
      const { users: pool = [], where = {}, what, when, isGoing } = this.props.navigation.getParam(
        'task'
      )
      this.setState({ pool, where, what, when, isGoing })
    }
  }

  drawKiView() {
    if (this.state.pool.length) {
      return <View style={styles.kiContainer}>{generateCirclesRow(this.state.pool)}</View>
    } else {
      return <View style={styles.kiContainer} />
    }
  }

  get _taskID() {
    // console.log('taskID', this.props.navigation.getParam('task', {}).id || this.props.navigation.getParam('taskID', '0'));
    return (
      this.props.navigation.getParam('task', {}).id || this.props.navigation.getParam('taskID', '0')
    )
  }

  _generateQRCode() {
    return JSON.stringify({ uid: Fire.shared.uid, task: this._taskID })
    // return JSON.stringify({"uid": Fire.shared.uid});
  }

  _renderQRCode() {
    if (this.state.isGoing) {
      return (
        <View style={{ paddingTop: 20, paddingBottom: 20, alignItems: 'center' }}>
          <QRCode value={this._generateQRCode()} size={200} />
          <Text style={styles.QRText}>Scan QR code to add friend</Text>
        </View>
      )
    } else return null
  }

  render() {
    const { getParam } = this.props.navigation
    const displayText = this.state.isGoing ? 'Ungoing' : 'Join'
    const task = this._taskID
    return (
      <ScrollView
        bounces={false}
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        // snapToInterval={104/812*height}
        decelerationRate="fast"
      >
        <GenericScreen
          source={this.state.where.uri || undefined}
          name={this.state.what}
          description={this.state.where.name || ''}
          note={this.state.when}
        >
          <Text style={styles.numberText}> {this.state.pool.length} </Text>
          <Text style={styles.descriptionText}> # of Attenders </Text>
          {this.drawKiView()}
          <View style={styles.buttonContainer}>
            {this._renderQRCode()}
            <AwesomeButton
              // progress
              marginTop={hRatio(32)}
              height={(68 / 812) * height}
              backgroundColor="#FFFFFF"
              borderRadius={(34 / 812) * height}
              onPress={next => {
                ;(this.state.isGoing
                  ? Fire.shared.ungoingTask(task)
                  : Fire.shared.joinTask(task)
                ).then(() => {
                  this.fetchdata(true)
                })
                next()
              }}
            >
              <Text style={styles.text}>{displayText}</Text>
            </AwesomeButton>
            {/* <Text style={{marginTop: 10, alignSelf: 'flex-end', opacity: 0.3}}>{this._taskID}</Text> */}
          </View>
        </GenericScreen>
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => {
            if (getParam('from')) {
              this.props.navigation.navigate('Notification')
            } else {
              this.props.navigation.navigate('TaskListScreen')
            }
          }}
        >
          <Image source={require('../assets/icons/back.png')} />
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.deleteButtonContainer}
          onPress={() => {
            this._removeTask(this._taskID)
          }}
        >
          <Image source={require('../assets/icons/remove.png')} />
        </TouchableOpacity> */}
      </ScrollView>
    )
  }

  _removeTask(task) {
    const { getParam } = this.props.navigation
    new Promise((resolve, reject) => {
      Alert.alert(
        'Warning',
        'You really wants to delete this task? Others will not see it anymore. You should know what you are doing.',
        [
          {
            text: 'YES',
            onPress: () => {
              resolve('YES')
            },
          },
          {
            text: 'NO',
            onPress: () => {
              reject('NO')
            },
            style: 'cancel',
          },
        ],
        { cancelable: false }
      )
    }).then(
      ret => {
        console.log('promise', ret, task)
        return Fire.shared.deleteTask(task).then(() => {
          if (getParam('from')) {
            this.props.navigation.navigate('Notification')
          } else {
            getParam('remove', () => {})(task)
            this.props.navigation.navigate('TaskListScreen')
          }
        })
      },
      ret => {
        console.log('promise cancelled', ret)
      }
    )
  }
}

class TaskLocation {
  async checkLocation(placeID) {
    // return true
    let { status } = await Permissions.askAsync(Permissions.LOCATION)
    if (status !== 'granted') {
      console.log('no location granted')
    }
    let location = await Location.getCurrentPositionAsync({})
    return await this.fetchMarkerData(location).then(markers => {
      for (let i = 0; i < markers.length; ++i) {
        // console.log("ids", markers[i].id, placeID)
        if (markers[i].id == placeID) return true
      }
      return false
    })
  }

  async fetchMarkerData(location) {
    const channel = Math.floor(Math.random() * 7)
    // console.log("cn", channel)
    let Key = Object.values(JSON.parse(REACT_APP_FOURSQUARE_ID))[channel]
    let Secret = Object.values(JSON.parse(REACT_APP_FOURSQUARE_SECRET))[channel]
    let fetchurl =
      'https://api.foursquare.com/v2/venues/search?client_id=' +
      Key +
      '&client_secret=' +
      Secret +
      '&v=20180323&radius=25&limit=6&ll=' +
      location.coords.latitude +
      ',' +
      location.coords.longitude
    // console.log('fetchurl: ', fetchurl)
    try {
      let response = await fetch(fetchurl)
      let data = await response.json()
      return data.response.venues
      // return data.response.groups[0].items.map(item => item.venue)
    } catch (err) {
      console.log('Marker Data Fetching Failed')
    }
  }
}

const styles = StyleSheet.create({
  header: {
    fontFamily: 'kontakt',
    fontSize: 30,
    color: 'white',
    textAlign: 'center',
    fontWeight: '900',
  },
  kiContainer: {
    width: width,
    height: (91 / 812) * height,
    marginTop: (17 / 812) * height,
  },
  container: {
    flex: 1,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: '#FFF',
  },
  imageContainer: {
    marginBottom: 20,
  },
  generalText: {
    fontFamily: 'kontakt',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 30,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems: 'center',
    // borderWidth: 0.5,
    borderColor: '#000',
    backgroundColor: '#fff',
    // backgroundColor: '#fff',
  },
  deleteButtonContainer: {
    position: 'absolute',
    top: 100,
    left: 30,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000000',
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
  },
  buttonContainer: {
    // marginLeft:84/812*height,
    marginTop: (17 / 812) * height,
    alignItems: 'center',
    borderRadius: (34 / 812) * height,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 30,
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.2,
    paddingBottom: 55,
  },
  textContent: {
    position: 'absolute',
    alignItems: 'center',
    bottom: (50 / 812) * height,
    height: (100 / 812) * height,
    left: 0,
    width: '100%',
    height: '25%',
  },
  numberText: {
    fontSize: 15,
    color: 'rgb(7,43,79)',
    textAlign: 'center',
    marginTop: 25,
  },
  descriptionText: {
    marginTop: 4,
    color: 'rgb(7,43,79)',
    opacity: 0.5,
    textAlign: 'center',
  },
  QRText: {
    marginTop: hRatio(26),
    fontFamily: 'GR',
    fontSize: 14,
    color: 'rgb(7,43,79)',
    opacity: 0.6,
  },
})
