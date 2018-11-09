import React from 'react';
import { FlatList, StyleSheet, View, Text, Image } from 'react-native';
import { WebBrowser } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';

export default class NotificationScreen extends React.Component {
  static navigationOptions = {
    title: 'Notification',
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data = {[
            {key: 'We have a special event in Bellevue'},
            {key: 'Come and meet new friends on UW campus'},
            {key: 'Celebrate the graduation of the first-year GIX cohorts'},
          ]}
          renderItem = {({item}) => <Text style={styles.itemText}>{item.key}</Text>}
        />
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
  itemText: {
    fontFamily :"mylodon-light",
    fontSize: 16,
    marginLeft: 15,
    marginTop: 9,
    marginBottom: 12,
  },
});
