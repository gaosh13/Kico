import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BarCodeScanner, Permissions } from 'expo';

export default class QRScanner extends React.Component {
  static navigationOptions = {
    title: 'QR scanner',
  };

  state = {
    hasCameraPermission: null,
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
    }

  render() {
    const { hasCameraPermission } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else
    return (
      <View style={{ flex: 1 }}>
        <BarCodeScanner
          onBarCodeScanned={this.handleBarCodeScanned}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  }

  handleBarCodeScanned = ({ type, data }) => {
    if (type == 'org.iso.QRCode') {
      console.log(data);
      let result = JSON.parse(data);
      if (result.value == 0) {
        this.props.navigation.navigate('Profile');
      } else if (result.value == 1) {
        this.props.navigation.navigate('Chat');
      } else {
        this.props.navigation.navigate('Development');
      }
    }
  }
}
