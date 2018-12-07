import React, { Component } from 'react'
import {
  StyleSheet, // CSS-like styles
  Text, // Renders text
  View, // Container component
  Image,
  Dimensions,
} from 'react-native'
import Swiper from '../components/Swiper'
import Button from '../components/Button'

const { width, height } = Dimensions.get('window')

const hRatio = value => {
  return (value / 812) * height
}

const wRatio = value => {
  return (value / 375) * width
}

export default class Screens extends Component {
  render() {
    return (
      <Swiper navigation={this.props.navigation}>
        {/* First screen */}
        <View style={[styles.slide, { backgroundColor: '#FFFFFF' }]}>
          <Image style={styles.image} source={require('../assets/images/onboarding1.png')} />
          <Text style={styles.header}>Check in to enlarge your personal pool</Text>
          <Text style={styles.text}>
            Users that have checked into same locations as you will be in your personal pool. Check
            more to find more!
          </Text>
          {/* <Button text="Next" /> */}
        </View>
        {/* Second screen */}
        <View style={[styles.slide, { backgroundColor: '#FFFFFF' }]}>
          <Image style={styles.image} source={require('../assets/images/onboarding2.png')} />
          <Text style={styles.header}>Find the bigger ones in your pool</Text>
          <Text style={styles.text}>
            Our recommendation algorithm will tell you who are hanging out around you.
          </Text>
          {/* <Button text="Next" /> */}
        </View>
        {/* Third screen */}
        <View style={[styles.slide, { backgroundColor: '#FFFFFF' }]}>
          <Image style={styles.image} source={require('../assets/images/onboarding3.png')} />
          <Text style={styles.header}>Meet real people offline</Text>
          <Text style={styles.text}>
            Create a mission to have a coffee break with your new friends. Go offline!
          </Text>
          {/* <Button text="Done" /> */}
        </View>
      </Swiper>
    )
  }
}

const styles = StyleSheet.create({
  // Slide styles
  slide: {
    flex: 1, // Take up all screen
    justifyContent: 'flex-start', // Center vertically
    alignItems: 'center', // Center horizontally
  },
  image: {
    width: width,
    height: hRatio(520),
    resizeMode: 'stretch',
  },
  // Header styles
  header: {
    color: '#072B4F',
    fontFamily: 'GSB',
    fontSize: 24,
    marginVertical: hRatio(15),
    marginHorizontal: wRatio(40),
  },
  // Text below header
  text: {
    color: '#072B4F',
    marginHorizontal: wRatio(40),
    marginVertical: hRatio(15),
    textAlign: 'left',
    fontFamily: 'GR',
    fontSize: 14,
  },
})
