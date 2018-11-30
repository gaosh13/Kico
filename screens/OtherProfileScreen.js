import React from 'react'
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import Fire from '../components/Fire'
import AwesomeButton from 'react-native-really-awesome-button'
import AsyncImageAnimated from '../components/AsyncImageAnimated'
import { LinearGradient } from 'expo'
import Carousel from 'react-native-snap-carousel'

const { width, height } = Dimensions.get('window')
const CARD_HEIGHT = (212 / 812) * height
const CARD_WIDTH = width / 1.25

export default class ProfileScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  constructor(props) {
    super(props)
    const { getParam } = this.props.navigation
    this.state = {
      name: getParam('name', '______'),
      gender: 'unknown',
      age: 'unknown',
      photoUrl: getParam('uri'),
      pool: [],
    }
  }

  async componentDidMount() {
    await this.fetchdata()
  }

  async fetchdata() {
    const { getParam } = this.props.navigation
    let [data, pool] = await Promise.all([
      Fire.shared.readUserInfo(getParam('uid')),
      Fire.shared.getCommonPlaces(getParam('uid')),
    ])
    if (data) {
      const { name, gender, age } = data
      this.setState({ name: name, gender: gender, age: age.toString() })
    }
    if (pool) {
      this.setState({ pool })
    }
  }

  _renderItem({ item }) {
    return (
      <View style={styles.card}>
        <AsyncImageAnimated
          style={styles.cardImage}
          source={{
            uri: item.uri,
          }}
          placeholderColor="#cfd8dc"
          animationStyle="fade"
        />
        <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']} style={styles.blurView} />
        <View style={styles.placeTextContent}>
          <Text numberOfLines={1} style={styles.cardtitle}>
            {item.name}
          </Text>
        </View>
      </View>
    )
  }

  renderEncounter() {
    if (this.state.pool.length) {
      return (
        <View>
          <Text style={styles.encounterText}>Encounters</Text>
          <Carousel
            data={this.state.pool}
            renderItem={this._renderItem}
            sliderWidth={width}
            itemWidth={0.75 * width}
            layout={'stack'}
          />
          <Text style={{ marginVertical: 15, fontSize: 15 }}> </Text>
        </View>
      )
    } else return null
  }

  renderProfile() {
    const { getParam, navigate } = this.props.navigation
    return (
      <View>
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
              navigate('ChatScreen', {
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
      </View>
    )
  }

  render() {
    const { navigate } = this.props.navigation
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: '#FFF' }}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {this.renderProfile()}
        {this.renderEncounter()}

        <TouchableOpacity
          style={styles.closeButtonContainer}
          onPress={() => {
            navigate('Home')
          }}
        >
          <Image source={require('../assets/icons/close.png')} />
        </TouchableOpacity>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  encounterText: {
    color: 'black',
    textAlign: 'left',
    fontSize: 36,
    fontFamily: 'GSB',
    marginLeft: (25 / 812) * height,
    marginBottom: (25 / 812) * height,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
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
  card: {
    alignItems: 'center',
    elevation: 2,
    backgroundColor: '#FFF',
    borderRadius: 5,
    shadowColor: '#000000',
    shadowRadius: 1.5,
    shadowOpacity: 0.1,
    shadowOffset: { x: 1, y: 1 },
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    overflow: 'hidden',
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  blurView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '50%',
  },
  placeTextContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: (83 / 812) * height,
  },
  cardtitle: {
    marginLeft: 10,
    marginTop: 30,
    color: 'white',
    textAlign: 'left',
    fontFamily: 'GR',
    fontSize: (22 / 812) * height,
    fontWeight: 'bold',
  },
})
