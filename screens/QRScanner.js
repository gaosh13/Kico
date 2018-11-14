import React from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
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
          new Promise((resolve) => {
            Alert.alert(
              'Tips',
              'Only scan the QRCode in the task screen',
              [{text: 'OK', onPress: ()=> {resolve("YES")},},],
              { cancelable: false },
            );
          }).then(()=>{this.scanned = false});
          return;
        }
        const result = JSON.parse(data);
        const {uid} = result;
        if (uid) {
          Fire.shared.addFriend(uid).then(
            ()=>{this.props.navigation.navigate('Congratulations', {uid})},
            ()=>{
              new Promise((resolve) => {
                Alert.alert(
                  'WoW',
                  'You find an old friend',
                  [{text: 'OK', onPress: ()=> {resolve("YES")},},],
                  { cancelable: false },
                );
              }).then(()=>{this.scanned = false});
            }
          );
        } else this.scanned = false;
      }
    }
  }
}

