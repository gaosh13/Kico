import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BarCodeScanner, Permissions } from 'expo';
import Fire from '../components/Fire';

export default class QRScanner extends React.Component {
  static navigationOptions = {
    title: 'QR scanner',
  };
  constructor(){
    super();
    this.state = {
      hasCameraPermission: null,
    };
    this.scanned = false;
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
      if (!this.scanned) {
        this.scanned = true;
        try {
          var result = JSON.parse(data);
        } catch(e) {
          alert("Only scan the QRCode in the task screen");
          this.scanned = false;
          return;
        }
        const result = JSON.parse(data);
        const {uid} = result;
        if (uid) {
          Fire.shared.addFriend(uid);
          this.props.navigation.navigate('Congratulations', {uid});
        } else this.scanned = false;
      }
    }
  }
}
