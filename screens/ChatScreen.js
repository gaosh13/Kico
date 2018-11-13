import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

export default class ChatScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  constructor() {
    super()
    this.state = {}
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.closeButtonContainer}
          onPress={() => {
            this.props.navigation.goBack()
          }}
        >
          <Ionicons name="ios-close" size={25} color="#000" />
        </TouchableOpacity>
      </View>
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
  closeButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 30,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
  },
})
