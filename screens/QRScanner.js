import React from 'react'
import { StyleSheet, Text, View, Alert } from 'react-native'
import { BarCodeScanner, Permissions } from 'expo'
import Fire from '../components/Fire'

export default class QRScanner extends React.Component {
  static navigationOptions = {
    title: 'QR scanner',
  }
  constructor() {
    super()
    this.state = {
      hasCameraPermission: null,
    }
    this.scanned = false
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({ hasCameraPermission: status === 'granted' })
  }

  render() {
    const { hasCameraPermission } = this.state

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>
    } else
      return (
        <View style={{ flex: 1 }}>
          <BarCodeScanner
            onBarCodeScanned={this.handleBarCodeScanned}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )
  }

  promiseAlert(title, text) {
    return new Promise(resolve => {
      Alert.alert(
        title,
        text,
        [
          {
            text: 'OK',
            onPress: () => {
              resolve('YES')
            },
          },
        ],
        { cancelable: false }
      )
    })
  }

  handleBarCodeScanned = ({ type, data }) => {
    if (type == 'org.iso.QRCode') {
      if (!this.scanned) {
        this.scanned = true
        try {
          var result = JSON.parse(data)
        } catch (e) {
          this.promiseAlert('Tips', 'Only scan the QRCode in the task screen').then(() => {
            this.scanned = false
          })
          return
        }
        const result = JSON.parse(data)
        const { uid, task } = result
        if (uid && task) {
          Fire.shared.hasTask(task).then(has => {
            if (has) {
              Fire.shared.addFriend(uid).then(
                () => {
                  this.props.navigation.navigate('Congrats', { uid })
                },
                () => {
                  this.promiseAlert('WoW', 'You find an old friend').then(() => {
                    this.scanned = false
                  })
                }
              )
            } else {
              this.promiseAlert('Err', 'You can only add friends in the same task').then(() => {
                this.scanned = false
              })
            }
          })
        } else this.scanned = false
      }
    }
  }
}
