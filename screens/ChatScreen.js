import React from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from 'react-native'

import Fire from '../components/Fire'

import ChatInput from '../components/ChatInput'

import { GiftedChat, Bubble, Message, Send, Actions, utils } from 'react-native-gifted-chat'

import AwesomeButton from 'react-native-really-awesome-button'

const { width, height } = Dimensions.get('window')

const hRatio = value => {
  return (value / 812) * height
}

const wRatio = value => {
  return (value / 375) * width
}

export default class ChatScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  constructor(props) {
    super(props)
    this.state = {
      messages: [],
      user: { _id: 0 },
      isFriend: false,
      limit: null,
      remainingMessages: 0,
    }
    this.preSetQuestions = [
      {
        q: 'Are you keeping dogs or cats?',
        a: ['Yes', 'No', 'I was'],
      },
      {
        q: 'DC or Marvel?',
        a: ['DC', 'Marvel', 'Seahawks'],
      },
      {
        q: 'How do you like this app?',
        a: ['Just so-so', 'A little bit', 'Very much'],
      },
      {
        q: 'How much alcohol can you drink?',
        a: ['Not at all', 'a little bit', 'quite much', 'I can drink all the time'],
      },
      {
        q: 'How is your boss?',
        a: [
          'Noooooo!',
          'just fine',
          'pretty good',
          "don't want to mention it",
          "don't have a boss",
        ],
      },
    ]
    // this.emojis = ['😊', '😆', '🤣', '😅', '😢', '😯', '😵', '🙄']
    // this.emojis = ['😊']
  }

  componentDidMount() {
    const { getParam } = this.props.navigation,
      uid = getParam('uid'),
      name = getParam('name'),
      avatar = getParam('uri')
    Promise.all([
      Fire.shared.readAuth(),
      Fire.shared.readOtherAuth(getParam('uid')),
      Fire.shared.getFriend(getParam('uid')),
      Fire.shared.getCommonPlaces(getParam('uid')),
    ]).then(([user, otherAuth, friend, pool]) => {
      let limit = undefined
      if (!friend.exists) limit = pool.length
      // console.log(limit)
      this.setState({
        user: {
          _id: user.uid,
          name: user.name,
          avatar: user.photoURL,
          token: otherAuth.pushNotificationToken,
        },
        isFriend: friend.exists,
        limit: limit,
      })
      this.onSnapshot = Fire.shared.profile
        .doc(user.uid)
        .collection('messages')
        .doc(uid)
        .collection('messages')
        .limit(20)
        .orderBy('createdAt', 'desc')
        .onSnapshot(snap => {
          const docs = snap
            .docChanges()
            .filter(changes => changes.type === 'added')
            .map(changes => changes.doc.id)
          Fire.shared.getMessages(docs).then(messages => {
            formattedMessages = messages
              .filter(msg => msg.exists)
              .map(msg => {
                const msgData = msg.data()
                return {
                  _id: msg.id,
                  text: msgData.text,
                  createdAt: msgData.createdAt,
                  user: {
                    _id: msgData.uid,
                    name: msgData.uid === uid ? name : user.name,
                    avatar: msgData.uid === uid ? avatar : user.photoURL,
                  },
                }
              })
            let ouput = Fire.shared.calculateRemainingMessages(formattedMessages, limit)
            // console.log('AAAA', currentMessageCount)
            this.setState(previousState => {
              if (
                messages.length === 1 &&
                previousState.messages.filter(msg => msg._id === messages[0].id).length > 0
              ) {
                return null
              }
              return {
                remainingMessages: ouput,
                messages: GiftedChat.append(previousState.messages, formattedMessages),
              }
            })
          })
        })
      Fire.shared.readMessage(uid)
    })
  }

  componentWillUnmount() {
    if (this.onSnapshot) {
      this.onSnapshot()
    }
  }

  onSend(messages) {
    const { getParam } = this.props.navigation
    const { remainingMessages, limit } = this.state
    if (remainingMessages || this.state.isFriend) {
      const { getParam } = this.props.navigation
      if (!Array.isArray(messages)) {
        messages = [messages]
      }
      messages.forEach(message => {
        Fire.shared
          .addMessage(
            {
              text: message.text,
              createdAt: message.createdAt.getTime(),
              uid: message.user._id,
            },
            getParam('uid'),
            this.state.isFriend
          )
          .then(id => {
            message._id = id
          })
        this.sendPushNotification()
        this.setState(previousState => {
          return {
            remainingMessages: previousState.remainingMessages - 1,
            messages: GiftedChat.append(previousState.messages, message),
          }
        })
      })
    } else {
      Alert.alert(
        'Texting limit passed',
        `You have used all ${limit} messages today with ${getParam('name')}.
        Either: 
        1) Come back again in 24 hours,
        2) Find more common checkins or
        3) Add this person as friend by inviting him to a mission for more messages!`
      )
    }
  }

  sendPushNotification(token = this.state.user.token) {
    let title = this.state.user.name
    let body = 'sent you a message'
    if (!this.state.isFriend) title = 'An unknown Ki source'
    if (!this.state.isFriend) body = 'Is attempting to connect with you'
    return fetch('https://exp.host/--/api/v2/push/send', {
      body: JSON.stringify({
        to: token,
        title: title,
        body: body,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
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

  renderAccessoryBtn(text, idx) {
    return (
      <AwesomeButton
        key={idx}
        backgroundColor="#FFFFFF"
        backgroundShadow="#FEFEFE"
        borderColor="#E0E0E0"
        borderWidth={1}
        borderRadius={34}
        width={150}
        height={40}
        raiseLevel={2}
        style={{ marginRight: 20, marginTop: -10 }}
        onPress={() => {
          this.onSend([
            { _id: new Date().getTime(), text, user: this.state.user, createdAt: new Date() },
          ])
        }}
      >
        <Text style={{ fontSize: 14 }}>{text}</Text>
      </AwesomeButton>
    )
  }

  _renderQuestionBtn(messages, user) {
    if (messages.length && messages[0].user._id !== user._id) {
      // console.log("questions", messages[0].user._id, user._id)
      let flag = -1
      for (let i = 0; i < this.preSetQuestions.length; ++i) {
        if (this.preSetQuestions[i].q == messages[0].text) {
          return this.preSetQuestions[i].a.map((answer, idx) =>
            this.renderAccessoryBtn(answer, idx)
          )
        }
      }
      return this.preSetQuestions.map((question, idx) => this.renderAccessoryBtn(question.q, idx))
    } else {
      return this.preSetQuestions.map((question, idx) => this.renderAccessoryBtn(question.q, idx))
    }
  }

  renderAccessory() {
    const { messages, user } = this.state
    // console.log("user", user)
    return (
      <ScrollView
        style={styles.scrollViewStyle}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {this._renderQuestionBtn(messages, user)}
      </ScrollView>
    )
  }

  renderSend() {
    return this.state.isFriend ? <Send {...this.props} /> : null
  }

  renderActions() {
    return this.state.isFriend ? null : (
      <ScrollView
        style={{ flexDirection: 'row', marginTop: hRatio(10) }}
        contentContainerStyle={{ justifyContent: 'space-around' }}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {this.emojis.map((text, index) => {
          return (
            <Actions
              key={index}
              {...this.props}
              containerStyle={{ marginHorizontal: wRatio(10) }}
              onPressActionButton={() => {
                this.onSend([
                  { _id: new Date().getTime(), text, user: this.state.user, createdAt: new Date() },
                ])
              }}
              icon={() => (
                <View style={styles.iconWrapper}>
                  <Text style={styles.iconText}>{text}</Text>
                </View>
              )}
            />
          )
        })}
      </ScrollView>
    )
  }

  renderInputToolbar(props) {
    return <ChatInput {...props} />
  }

  renderComposer(props) {
    return <View style={{ height: 40 }} />
  }

  render() {
    const { getParam, goBack } = this.props.navigation
    const { user, isFriend, limit, remainingMessages } = this.state
    return (
      <View style={styles.container}>
        <View style={styles.chatHeader}>
          <Text numberOfLines={1} style={styles.chatName}>
            {getParam('name')}
          </Text>
        </View>
        {isFriend ? null : (
          <Text style={styles.reminderText}>
            {' '}
            You and {getParam('name')} are not yet friends, you can send {limit} texts today
          </Text>
        )}
        <View style={styles.chatContainer}>
          <GiftedChat
            messages={this.state.messages}
            renderBubble={props => this.renderBubble(props)}
            renderMessage={props => this.renderMessage(props)}
            onPressAvatar={
              isFriend
                ? () =>
                    this.props.navigation.navigate('FriendsProfileScreen', {
                      uid: getParam('uid'),
                      uri: getParam('uri'),
                      name: getParam('name'),
                    })
                : () =>
                    this.props.navigation.navigate('ViewOther', {
                      uid: getParam('uid'),
                      uri: getParam('uri'),
                      name: getParam('name'),
                    })
            }
            renderInputToolbar={props => this.renderInputToolbar(props)}
            renderAccessory={isFriend ? null : props => this.renderAccessory(props)}
            // renderComposer={isFriend ? null : props => this.renderComposer(props)}
            showAvatarForEveryMessage={true}
            // renderSend={isFriend ? null : props => this.renderSend(props)}
            // renderActions={isFriend ? null : props => this.renderActions(props)}
            isAnimated
            onSend={messages => this.onSend(messages)}
            // bottomOffset={200}
            // minInputToolbarHeight={120}
            alwaysShowSend={true}
            keyboardShouldPersistTaps="never"
            textInputStyle={{
              borderColor: '#DDDDDF',
              borderWidth: 1,
              borderRadius: 24,
              // height: 50,
              fontSize: 14,
              marginLeft: 20,
              marginRight: 20,
              paddingLeft: 20,
              paddingTop: 8,
              paddingRight: 20,
            }}
            placeholder={
              isFriend ? 'Type a message...' : `You can send ${remainingMessages} more messages...`
            }
            textInputProps={{
              editable: true,
              // placeholder: '',
            }}
            listViewProps={{
              contentContainerStyle: { flexGrow: 1, justifyContent: 'flex-start' },
            }}
            // showUserAvatar
            user={user}
          />
        </View>
        {/* <TouchableOpacity
          style={styles.closeButtonContainer}
          onPress={() => {
            this.props.navigation.navigate('Home')
          }}
        >
          <Image source={require('../assets/icons/close.png')} />
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => {
            getParam('refresh', () => {})()
            goBack()
          }}
        >
          <Image source={require('../assets/icons/back.png')} />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  chatHeader: {
    height: hRatio(112),
    // backgroundColor:'#262626',
    paddingBottom: hRatio(24),
    paddingLeft: 90,
    paddingRight: 80,
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  scrollViewStyle: {
    flexDirection: 'row',
    padding: 10,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: hRatio(60),
    right: wRatio(30),
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
  chatName: {
    textAlign: 'center',
    fontFamily: 'GSB',
    fontSize: 18,
    // color: 'white',
    color: 'rgb(7,43,79)',
  },
  iconWrapper: {
    flex: 1,
  },
  iconText: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    top: hRatio(60),
    left: wRatio(30),
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
})
