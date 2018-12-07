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
import { Location, Permissions } from 'expo'
import Fire from '../components/Fire'
import { generateCirclesRow } from '../components/KiVisual'
import GenericScreen from '../components/GenericScreen'
import { GiftedChat, Bubble, Message, Send, Actions, utils } from 'react-native-gifted-chat'
import AwesomeButton from 'react-native-really-awesome-button'
import ChatInput from '../components/ChatInput'
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
      messages: [],
      user: { _id: 0 },
      pool: [],
      where: {},
      what: '',
      when: '',
      isGoing: false,
    }
  }

  componentDidMount() {
    this.fetchdata(false)

    Promise.all([Fire.shared.readInfo()]).then(([user]) => {
      this.setState({
        user: {
          _id: user.uid,
          name: user.name,
          avatar: user.photoURL,
        },
      })
      this.onSnapshot = Fire.shared.task
        .doc(this._taskID)
        .collection('messages')
        .limit(20)
        .orderBy('createdAt', 'desc')
        .onSnapshot(snap => {
          const docs = snap
            .docChanges()
            .filter(changes => changes.type === 'added')
            .map(changes => changes.doc.id)
          Fire.shared.getMessages(docs).then(async messages => {
            formattedMessages = await Promise.all(
              messages
                .filter(msg => msg.exists)
                .map(async msg => {
                  const msgData = msg.data()
                  // console.log("msgData", msgData, msg.id)
                  let { name, photoURL: uri } = user
                  // console.log("name uri", name, uri, user)
                  if (msgData.uid != Fire.shared.uid) {
                    // console.log("await")
                    ;({ name, uri } = await Fire.shared.getNameNAvatar(msgData.uid))
                  }
                  // console.log("name uri", name, uri)
                  return {
                    _id: msg.id,
                    text: msgData.text,
                    createdAt: msgData.createdAt,
                    user: {
                      _id: msgData.uid,
                      name,
                      avatar: uri,
                    },
                  }
                })
            )
            // console.log("fmt", formattedMessages)
            this.setState(previousState => {
              if (
                messages.length === 1 &&
                previousState.messages.filter(msg => msg._id === messages[0].id).length > 0
              ) {
                return null
              }
              return {
                messages: GiftedChat.append(previousState.messages, formattedMessages),
              }
            })
          })
        })
    })
  }

  async fetchdata(refresh = false) {
    const { pool = [], where = {}, what, when, time } = this.props.navigation.getParam('task')
    this.setState({ pool, where, what, when, time })
  }

  drawKiView() {
    if (this.state.pool.length) {
      return <View style={styles.kiContainer}>{generateCirclesRow(this.state.pool)}</View>
    } else {
      return <View style={styles.kiContainer} />
    }
  }

  get _taskID() {
    return this.props.navigation.getParam('task', {}).id
  }

  onSend(messages) {
    const { getParam } = this.props.navigation
    let canTalk = Fire.shared.timeLimit_date(this.state.time, 3600)
    console.log('canTalk', canTalk)
    // messages.createdAt.getTime()
    if (canTalk) {
      if (!Array.isArray(messages)) {
        messages = [messages]
      }
      messages.forEach(message => {
        Fire.shared
          .addMessageFromTask(
            {
              text: message.text,
              createdAt: message.createdAt.getTime(),
              uid: message.user._id,
            },
            this._taskID
          )
          .then(id => {
            message._id = id
          })
        this.setState(previousState => {
          return {
            messages: GiftedChat.append(previousState.messages, message),
          }
        })
      })
    } else {
      Alert.alert(
        'Texting limited',
        'The mission will not begin in 1 hour, please wait until you can text.'
      )
    }
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 2,
          },
          right: {
            borderRadius: 20,
            padding: 2,
          },
        }}
      />
    )
  }

  renderMessage(props) {
    const marginTop = utils.isSameUser(props.currentMessage, props.previousMessage) ? 0 : 20
    return (
      <Message
        {...props}
        containerStyle={{
          left: {
            alignItems: 'flex-start',
            marginTop,
          },
          right: {
            marginTop,
          },
        }}
      />
    )
  }

  renderInputToolbar(props) {
    return <ChatInput {...props} />
  }

  renderSend() {
    return <Send {...this.props} />
  }

  render() {
    const { user } = this.state
    return (
      <View style={{ flex: 1 }}>
        <GenericScreen
          source={this.state.where.uri || undefined}
          name={this.state.what}
          description={this.state.where.name || ''}
          note={this.state.when}
          imageHeight={0.2}
        >
          {this.drawKiView()}
          <View style={styles.chatContainer}>
            <GiftedChat
              messages={this.state.messages}
              renderBubble={props => this.renderBubble(props)}
              renderMessage={props => this.renderMessage(props)}
              renderInputToolbar={props => this.renderInputToolbar(props)}
              showAvatarForEveryMessage={true}
              isAnimated
              onSend={messages => this.onSend(messages)}
              alwaysShowSend={true}
              keyboardShouldPersistTaps="never"
              textInputStyle={{
                borderColor: '#DDDDDF',
                borderWidth: 1,
                borderRadius: 24,
                fontSize: 14,
                marginLeft: 20,
                marginRight: 20,
                paddingLeft: 20,
                paddingTop: 8,
                paddingRight: 20,
              }}
              placeholder={'Try to contact before missions'}
              textInputProps={{
                editable: true,
              }}
              listViewProps={{
                contentContainerStyle: { flexGrow: 1, justifyContent: 'flex-start' },
              }}
              user={user}
            />
          </View>
        </GenericScreen>
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => {
            this.props.navigation.pop()
          }}
        >
          <Image source={require('../assets/icons/back.png')} />
        </TouchableOpacity>
      </View>
    )
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
  chatContainer: {
    flex: 1,
    backgroundColor: '#FBFCFE',
  },
  reminderText: {
    paddingHorizontal: 20,
    height: hRatio(20),
    backgroundColor: 'transparent',
    fontFamily: 'GR',
    fontSize: 12,
    color: 'grey',
    opacity: 0.4,
  },
})
