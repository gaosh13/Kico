import React from 'react';
import { ScrollView, StyleSheet, View, Text, Image, Button } from 'react-native';
import { WebBrowser } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';

export default class ChangeScreen extends React.Component {
  static navigationOptions = {
    title: "Change Location",
  };

  render() {
    console.log("CheckIn Page");
    return (
      <ScrollView style={styles.container}>
        {
        /*
        <Button title='GIX building' onPress={() => {this._callback('GIX building')}} />
        <Button title='Sparc apartment' onPress={() => {this._callback('Sparc apartment')}} />
        <Button title='Crab pot' onPress={() => {this._callback('Crab pot')}} />
        */
        }
        <BackButton Location='GIX building' C={this}/>
        <BackButton Location='Sparc apartment' C={this}/>
        <BackButton Location='Crab pot' C={this}/>
      </ScrollView>
    );
  }

  _callback(a) {
    const { goBack } = this.props.navigation;
    const { params } = this.props.navigation.state;
    const { callback=()=>{} } = params;
    callback({'Location': a.toString()});
    goBack();
  }
}

const BackButton = ( {Location, C} ) => {
  if (!Location) {
    Location = 'GIX building';
  }
  return (
    <Button title={Location} onPress={() => {C._callback(Location)}} />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
  optionsTitleText: {
    fontFamily :"mylodon-light",
    fontSize: 16,
    marginLeft: 15,
    marginTop: 9,
    marginBottom: 12,
  },
  optionIconContainer: {
    marginRight: 9,
  },
  option: {
    backgroundColor: '#fdfdfd',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDEDED',
  },
  optionText: {
    fontFamily :"mylodon-light",
    fontSize: 15,
    marginTop: 1,
  },
});
