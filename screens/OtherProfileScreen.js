import React from 'react'
import {
  Animated,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  Button,
  TextInput,
  Platform,
  Icon,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  Dimensions,
} from 'react-native'
import { TabViewAnimated, TabBar, TabViewPagerScroll, TabViewPagerPan } from 'react-native-tab-view'

import { Ionicons } from '@expo/vector-icons'
import Fire from '../components/Fire'
import ButtonComponent, {
  CircleButton,
  RoundButton,
  RectangleButton,
} from 'react-native-button-component'
import AwesomeButton from 'react-native-really-awesome-button'
import AsyncImageAnimated from '../components/AsyncImageAnimated'
import GenericScreen from '../components/GenericScreen'

const { width, height } = Dimensions.get('window')

export default class ProfileScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  constructor(props) {
    super(props)
    const { getParam } = this.props.navigation
    console.log(getParam('name'))
    this.state = {
      name: getParam('name', '______'),
      gender: 'unknown',
      age: 'unknown',
      photoUrl: getParam('uri'),
    }
  }

  async componentDidMount() {
    await this.fetchdata()
  }

  async fetchdata() {
    const { getParam } = this.props.navigation
    let data = await Fire.shared.readUserInfo(getParam('uid'))
    if (data) {
      const { name, gender, age } = data
      await this.setState({ name: name, gender: gender, age: age.toString() }, function() {
        console.log(this.state)
      })
    }
  }

  render() {
    const { getParam, navigate } = this.props.navigation
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF', alignItems: 'center' }}>
        <View style={styles.textContent}>
          <Text numberOfLines={1} style={styles.userNameText}>
            {this.state.name}
          </Text>
          <Text numberOfLines={1} style={styles.userDescriptionText}>
            {this.state.gender},{this.state.age}
          </Text>
        </View>
        <Image style={styles.userImage} source={{ uri: getParam('uri') }} />
        <View style={styles.buttonContainer}>
          <AwesomeButton
            height={(68 / 812) * height}
            backgroundColor="#FFFFFF"
            borderRadius={(34 / 812) * height}
            onPress={() =>
              navigate('Chat', {
                uri: getParam('uri'),
                name: getParam('name'),
                uid: getParam('uid'),
              })
            }
          >
            <Text style={{ fontSize: 15, fontFamily: 'GR', fontWeight: 'bold' }}>
              {'Emo-nicate'}
            </Text>
          </AwesomeButton>
        </View>
        <TouchableOpacity
          style={styles.closeButtonContainer}
          onPress={() => {
            navigate('Home')
          }}
        >
          <Image source={require('../assets/icons/close.png')} />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  closeButtonContainer: {
    position: 'absolute',
    top: (60 / 812) * height,
    right: (30 / 812) * height,
    borderRadius: 30,
    width: (30 / 812) * height,
    height: (30 / 812) * height,
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000000',
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
  },
  buttonContainer: {
    marginTop: (56 / 812) * height,
    marginBottom: (55 / 812) * height,
    borderRadius: (34 / 812) * height,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 30,
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.2,
  },
  textContent: {
    width: '82.934%',
    marginTop: (121 / 812) * height,
  },
  userImage: {
    borderRadius: 15,
    height: (427 / 812) * height,
    width: (315 / 375) * width,
    shadowColor: '#000000',
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
    marginTop: 12,
    resizeMode: 'cover',
  },
  userNameText: {
    color: 'rgb(7,43,79)',
    textAlign: 'left',
    fontSize: (36 / 812) * height,
    fontWeight: 'bold',
  },
  userDescriptionText: {
    marginTop: (4 / 812) * height,
    textAlign: 'left',
    color: 'rgb(7,43,79)',
    opacity: 0.6,
    fontSize: (14 / 812) * height,
  },
})
