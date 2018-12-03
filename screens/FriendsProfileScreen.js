import React from 'react'
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native'
import Fire from '../components/Fire'
import GenericScreen from '../components/GenericScreen'
import { MaterialIcons } from '@expo/vector-icons'
import AwesomeButton from 'react-native-really-awesome-button'
import AsyncImageAnimated from '../components/AsyncImageAnimated'
import { LinearGradient } from 'expo'
import Carousel, { Pagination } from 'react-native-snap-carousel'

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
      activeSlide: 0,
      name: getParam('name'),
      gender: 'undefined',
      age: '18',
      intro: '',
      onEdit: false,
      ki: undefined,
      friendsLoaded: false,
      photoUrl: getParam('uri'),
      pool: [],
      friends: null,
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
      let intro = 'This human is yet to set his intro'
      if (data.intro) intro = data.intro
      this.setState({ name: name, gender: gender, age: age.toString(), intro: intro })
    }
    if (pool) {
      this.setState({ pool })
    }
  }

  renderIntroText() {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          this.setState({ onEdit: true })
        }}
      >
        <View style={styles.introText}>
          <Text>{this.state.intro}</Text>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  renderIntro() {
    return (
      <View>
        <Text style={styles.aboutText}>About this human</Text>
        <View style={{ paddingTop: 10 }}>{this.renderIntroText()}</View>
      </View>
    )
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
        <View style={{ marginTop: (25 / 812) * height }}>
          <Text style={styles.encounterText}>Encounters</Text>
          <Carousel
            data={this.state.pool}
            renderItem={this._renderItem}
            sliderWidth={width}
            itemWidth={0.75 * width + 0.04 * width}
            onSnapToItem={index => this.setState({ activeSlide: index })}
            layout={'stack'}
            // layoutCardOffset={9}
          />
          {this.pagination}
        </View>
      )
    } else return null
  }

  get pagination() {
    const { pool, activeSlide } = this.state
    return (
      <Pagination
        dotsLength={pool.length}
        activeDotIndex={activeSlide}
        containerStyle={{ paddingVertical: 5, backgroundColor: 'rgba(0, 0, 0, 0)' }}
        dotContainerStyle={{ height: 12 }}
        dotStyle={{
          marginHorizontal: -4,
          paddingVertical: 0,
          backgroundColor: 'rgba(0, 0, 0, 1)',
        }}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.4}
      />
    )
  }

  render() {
    return (
      <ScrollView
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        snapToInterval={(104 / 812) * height}
        bounces={false}
        decelerationRate="fast"
      >
        <View>
          <GenericScreen
            source={this.state.photoUrl}
            name={this.state.name}
            description={this.state.gender}
            note={this.state.age}
          >
            {this.renderIntro()}
            {this.renderEncounter()}
            <View style={styles.bottomImage}>
              <Image source={require('../assets/images/bottom.png')} />
            </View>
          </GenericScreen>
          <TouchableOpacity
            style={styles.closeButtonContainer}
            onPress={() => {
              this.props.navigation.navigate('Home')
            }}
          >
            <Image source={require('../assets/icons/close.png')} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }
}

// opacity: 0.2;
// background: #0B9AF5;
// background: #0B9AF5;

// background: #0B9AF5;

const styles = StyleSheet.create({
  aboutText: {
    color: 'black',
    textAlign: 'left',
    fontSize: 30,
    fontFamily: 'GSB',
    marginTop: (25 / 812) * height,
    marginLeft: (25 / 812) * height,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 30,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000000',
    shadowRadius: 15,
    shadowOpacity: 0.2,
    shadowOffset: { x: 0, y: 10 },
    // backgroundColor: '#fff',
  },
  introText: {
    // flexDirection: 'row',
    paddingHorizontal: (25 / 812) * height,
    // paddingTop: 10,
    // borderWidth: 1,
  },
  bottomImage: {
    marginTop: 25,
  },
  encounterText: {
    color: 'black',
    textAlign: 'left',
    fontSize: 30,
    fontFamily: 'GSB',
    marginLeft: (25 / 812) * height,
    marginBottom: (25 / 812) * height,
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
