import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Constants, Svg, LinearGradient } from 'expo'
import { Ionicons } from '@expo/vector-icons'
import { withNavigation, ScrollView } from 'react-navigation'
import {
  Text,
  TouchableWithoutFeedback,
  Image,
  View,
  Dimensions,
  StyleSheet,
  AlertIOS,
} from 'react-native'

const { width, height } = Dimensions.get('window')

class GenericScreen extends Component {
  constructor(props) {
    super(props)
    this.dialog = [
      { message: 'Change your name' },
      { message: 'Change your gender' },
      { message: 'Change your age' },
    ]
  }

  render = () => {
    const { source, children } = this.props
    return (
      <View style={styles.container}>
        <View style={{ width: '100%', height: 0.6403 * height }}>
          <Image
            source={{
              uri: source,
            }}
            style={{ width: '100%', height: 0.6403 * height }}
            resizeMode="cover"
          />
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']} style={styles.blurView} />
          <View style={styles.textContent}>{this._renderCard()}</View>
        </View>
        <View style={styles.cardContainer}>{children}</View>
      </View>
    )
  }

  onSet(i) {
    const { name, description, note, onSet } = this.props
    const hints = [name, description, note]
    AlertIOS.prompt(this.dialog[i].message, null, text => onSet(i, text), 'plain-text', hints[i])
  }

  _renderCard() {
    const { name, description, note, onSet } = this.props
    if (onSet) {
      return (
        <View>
          <TouchableWithoutFeedback
            onPress={() => {
              this.onSet(0)
            }}
          >
            <View>
              <Text numberOfLines={1} style={styles.cardtitle}>
                {name}
              </Text>
            </View>
          </TouchableWithoutFeedback>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableWithoutFeedback
              onPress={() => {
                this.onSet(1)
              }}
            >
              <View>
                <Text numberOfLines={1} style={styles.cardInfoDescription}>
                  {description},
                </Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback
              onPress={() => {
                this.onSet(2)
              }}
            >
              <View>
                <Text numberOfLines={1} style={styles.cardInfoDescription}>
                  {note}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      )
    } else {
      return (
        <View>
          <Text numberOfLines={1} style={styles.cardtitle}>
            {name}
          </Text>
          <Text numberOfLines={1} style={styles.cardDescription}>
            {description},{note}
          </Text>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  cardContainer: {
    marginTop: (-23 / 812) * height,
    marginBottom: (35 / 812) * height,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  blurView: {
    marginTop: (-275 / 812) * height,
    left: 0,
    width: '100%',
    height: (275 / 812) * height,
  },
  textContent: {
    alignItems: 'center',
    marginTop: (-120 / 812) * height,
    height: (120 / 812) * height,
    left: 0,
    width: '100%',
  },
  cardtitle: {
    marginTop: (24 / 812) * height,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'GR',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardDescription: {
    marginTop: (4 / 812) * height,
    fontFamily: 'GR',
    textAlign: 'center',
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 14,
  },
  cardInfoDescription: {
    marginTop: (4 / 812) * height,
    fontFamily: 'GR',
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 14,
  },
})

export default withNavigation(GenericScreen)
