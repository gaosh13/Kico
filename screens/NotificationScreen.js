import React from 'react';
import { FlatList, StyleSheet, View, Text, Image } from 'react-native';
import { WebBrowser } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import Fire from '../components/Fire';

export default class NotificationScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(){
    super();
    this.mountState = false;
    this.state = {
      notification: [],
    };
    Fire.shared.getNotification().then((data) => {
      if (this.mountState) {
        this.setState({notification: data});
      }
    });
  }

  componentDidMount() {
    this.mountState = true;
  }

  componentWillUnmount() {
    this.mountState = false;
  }

  render() {
    return (
      <FlatList
        style={styles.notificationList}
        data={this.state.notification}
        keyExtractor={this._keyExtractor}
        renderItem={this._renderListItem}>
      </FlatList>
    );
  }

  _keyExtractor = (item, index) => {return "notification" + index}

  _renderSingleItem = (item) => {
    if (item.type == 'sys1') {
      return (
        <View style={styles.flexRowContainer}>
          <Text style={{marginLeft: 15, fontSize: 18}}>{item.messageText}</Text>
        </View>
      );
    } else if (item.type == 'taski') {
      return (
        <View style={styles.flexRowContainer}>
          <Button title="Confirm" onPress={()=>{}} />
          <Button title="Reject" onPress={()=>{}} />
        </View>
      );
    } else if (item.type == 'add1') {
      return (
        <View style={styles.flexRowContainer}>
          <Button title="Confirm" onPress={()=>{}} />
          <Button title="Reject" onPress={()=>{}} />
        </View>
      );
    } else if (item.type == 'add2') {
      return (
        <View style={styles.flexRowContainer}>
          <Button title="Confirm" onPress={()=>{}} />
          <Button title="Reject" onPress={()=>{}} />
        </View>
      );
    } else {
      return null;
    }
  }

  _renderListItem = ({item}) => {
    let displayText = 'Here comes a new message';
    return (
      <View style={styles.itemContainer}>
        <View style={styles.flexRowContainer}>
          <Ionicons name='ios-information-circle' size={25} color="blue"/>
          <Text style={{marginLeft: 15, fontSize: 18}}>{displayText}</Text>
        </View>
        {this._renderSingleItem(item)}
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
  itemContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#ccc',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 5,
    alignItems: 'center',
  },
  flexRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationList: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
