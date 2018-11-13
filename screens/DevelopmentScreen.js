import React from 'react';
import { ScrollView, StyleSheet, View, Text, Image, Button } from 'react-native';
import { WebBrowser, Constants } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import Fire from '../components/Fire';

export default class DevelopmentScreen extends React.Component {
  static navigationOptions = {
    title: 'Development',
  }

  render() {
    return (
      <View style={styles.container}>
        <Button title="delete my pool" onPress={()=>{Fire.shared.deleteMyPool();}}/>
        <Button title="delete all pool" onPress={()=>{Fire.shared.deleteAllPool();}}/>
        <Button title="delete all notification" onPress={()=>{Fire.shared.deleteAllNotification();}}/>
        <Button title="generate a notification" onPress={()=>{Fire.shared.generateNotification();}}/>
        <Button title="transfer photos" onPress={()=>{Fire.shared.transferAllImages();}}/>
      </View>
    );
  }
}

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
    fontSize: 15,
    marginTop: 1,
  },
  titleContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
  },
  titleIconContainer: {
    marginRight: 15,
    paddingTop: 2,
  },
  nameText: {
    fontWeight: '600',
    fontSize: 18,
  },
  slugText: {
    color: '#a39f9f',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  descriptionText: {
    fontSize: 14,
    marginTop: 6,
    color: '#4d4d4d',
  },
});
