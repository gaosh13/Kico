import React from 'react';
import { ScrollView, StyleSheet, View, Text, Image, Button, FlatList } from 'react-native';
import { WebBrowser } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import Fire from '../components/Fire';

export default class FriendsScreen extends React.Component {
  static navigationOptions = ( {navigation} ) => {
    return {
      title: "My Friend List",
      headerRight: (
        <Button
          onPress={() => navigation.navigate("CheckIn")}
          title="Right"
          color="#222"
        />
      ),
      headerLeft: (
        <Button
          onPress={() => navigation.push("Pool")}
          title="Pool"
          color="#222"
        />
      ),
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      friends: [],
    };
  }

  async componentDidMount() {
    await this.fetchdata();
  }

  async fetchdata(){
    let data = await Fire.shared.readInfo();
    const { friends } = data;
    console.log("my friends", friends);
    if (friends) {
      let friendsData = [];
      for (let i = 0; i < friends.length; ++i) {
        let element = friends[i];
        let name = await Fire.shared.getName(element.uid);
        friendsData.push({
          name: element.nick || name,
          tag: element.tag,
        });
      }
      this.setState({friends: friendsData});
    }
  }

  render() {
    let { navigation } = this.props;
    return (
      <FlatList
        data={this.state.friends}
        keyExtractor={this._keyExtractor}
        renderItem={this._renderItem}
        style={styles.container}>
      </FlatList>
    );
  }

  _keyExtractor = (item, index) => {return "friend" + index}

  _renderItem = ({item}) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemLeft}>
          <Image
            source={require("../assets/images/robot-dev.png")}
            style={{ width: 30, height: 30 }}
            resizeMode="cover"
          />
          <Text style={{fontSize: 18}}>{item.name}</Text>
        </View>
        <View style={styles.itemRight}>
          <Text style={{fontSize: 18, color: 'blue'}}>{item.tag}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    marginLeft: 20,
    marginTop: 15,
    marginRight: 20,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#ccc',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 5,
    justifyContent: 'space-between',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
