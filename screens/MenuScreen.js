import React from 'react';
import { FlatList, StyleSheet, View, Text, Image, TouchableHighlight } from 'react-native';

export default class MenuScreen extends React.Component {
  static navigationOptions = {
    title: 'Menu',
  };

  render() {
    console.log("Menu Page");
    const dataList = [
      {navigation: 'Profile', display: 'Profile', args: {'name': 'jeremy', 'age': 24, 'gender': 'male'}},
      {navigation: 'Settings'},
      {navigation: 'Help', display: 'Help'},
    ];
    return (
      <View style={styles.container}>
        <FlatList
          scrollEnabled={false}
          data={dataList}
          renderItem={this._renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
        <Text style={styles.touchableText}>No content right now</Text>
      </View>
    );
  }

  _renderItem = ({ item }) => {
    const {navigate} = this.props.navigation;
    var { navigation, display, args = {}} = item;
    display = display || navigation;
    return (
      <TouchableHighlight
        onPress={() => navigate(navigation, args)}
        underlayColor="#CCC"
        style={styles.menuTouchable}>
        <View style={styles.navBar}>
          <View style={styles.leftContainer}>
            <Text style={styles.touchableText}>
              { display }
            </Text>
          </View>
          <View style={styles.rightContainer}>
            <Text style={styles.touchableText}>
              {'>'}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
  menuTouchable: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDEDED',
  },
  navBar: {
    // height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: 'blue',
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    // backgroundColor: 'green'
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // backgroundColor: 'red',
  },
  touchableText: {
    fontFamily :"mylodon-light",
    fontSize: 20
  }
});
