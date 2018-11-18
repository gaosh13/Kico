import React from 'react'
import { FlatList, StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Fire from '../components/Fire'
import moment from 'moment'

export default class ChatsScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  constructor() {
    super()
    this.state = {
      strangers: [],
      friends: [],
    }
  }

  componentDidMount() {
    Fire.shared.getChatHistory().then(chatList => {
      if (chatList && chatList.length) {
        const friends = [],
          strangers = []
        chatList.forEach(chat => {
          if (chat.isFriend) {
            friends.push(chat)
          } else {
            strangers.push(chat)
          }
        })
        this.setState({
          strangers,
          friends,
        })
      }
    })
  }

  componentWillUnmount() {}

  render() {
    return (
      <View style={styles.container}>
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.titleText}>Recent</Text>
        </View>
        <FlatList
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.strangerList}
          data={this.state.strangers}
          keyExtractor={(item, index) => {
            return 'stranger' + index
          }}
          renderItem={this._renderStrangerListItem}
        />
        <View
          style={{
            borderBottomColor: '#ccc',
            borderBottomWidth: 1,
            marginTop: 10,
            marginBottom: 10,
            height: 1,
          }}
        />
        <FlatList
          showsVerticalScrollIndicator={false}
          style={styles.friendList}
          data={this.state.friends}
          keyExtractor={(item, index) => {
            return 'friend' + index
          }}
          renderItem={this._renderFriendListItem}
        />
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => {
            this.props.navigation.openDrawer()
          }}
        >
          <Ionicons name="ios-close" size={25} color="#000" />
        </TouchableOpacity>
      </View>
    )
  }

  _renderStrangerListItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigation.navigate('Chat', {
            uri: item.uri,
            name: item.name,
            uid: item.uid,
          })
        }}
      >
        <View style={{ marginRight: 15 }}>
          <Image style={styles.userImage} source={{ uri: item.uri }} />
        </View>
      </TouchableOpacity>
    )
  }

  _renderFriendListItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigation.navigate('Chat', {
            uri: item.uri,
            name: item.name,
            uid: item.uid,
          })
        }}
      >
        <View style={styles.itemContainer}>
          <View
            style={{
              flex: 0.25,
            }}
          >
            <Image style={styles.userImage} source={{ uri: item.uri }} />
          </View>
          <View
            style={{
              flex: 0.75,
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={styles.usernameText}>{item.name}</Text>
              <Text style={styles.timestampText}>
                {item.updatedAt
                  ? moment(item.updatedAt)
                      .locale(this.props.context.getLocale())
                      .fromNow()
                  : ''}
              </Text>
            </View>
            <Text style={styles.messageText} numberOfLines={1}>
              {item.text || ''}
            </Text>
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
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: '#FAFBFD',
  },
  userImage: {
    borderRadius: 32,
    height: 64,
    width: 64,
  },
  usernameText: {
    fontSize: 18,
    color: '#072A4E',
    fontWeight: '600', // semi-bold
  },
  timestampText: {
    fontSize: 10,
    color: '#C7C6CE',
    // fontWeight: 'bold',
  },
  messageText: {
    fontSize: 14,
    color: '#C7C6CE',
  },
  titleText: {
    fontSize: 32,
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
  friendList: {
    flex: 1,
    // marginTop: 10,
    // borderTopWidth: 2,
    // borderTopColor: '#ccc',
  },
  strangerList: {
    height: 90,
    // paddingRight: 15,
    // borderWidth: 1,
    // marginBottom: 10,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 30,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
    // backgroundColor: '#fff',
  },
})
