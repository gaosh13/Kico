import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { ScrollView, Text, View, StyleSheet, Button, TouchableHighlight, Image, FlatList } from 'react-native';
import { Constants } from 'expo';
import Icon from 'react-native-vector-icons/FontAwesome';
import Fire from '../components/Fire';

class DrawerView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: 'Annie',
      photoUrl: '../assets/images/icon.png',
    };
  }

  async componentDidMount() {
    await this.fetchdata();
  }

  async fetchdata(){
    const uid = Fire.shared.uid;
    let data = await Fire.shared.readInfo();
    if (data) {
      const {name} = data;
      this.setState({name: name});
    }

    data = await Fire.shared.readAuth();
    const {photoURL} = data;
    this.setState({photoUrl: photoURL});
  }

  render () {
    const { navigate } = this.props.navigation;
    const { manifest } = Constants;

    return (
      <View style={styles.container}>
        <TouchableHighlight
          onPress={() => navigate('Profile')}
          underlayColor="#CCC"
          style={styles.firstTouchable}>
          <View style={styles.profileContainer}>
            <View style={styles.profileImg}>
              <Image
                style={styles.userImage}
                source={{
                  uri: this.state.photoUrl,
                }}
              />
              <Text style={styles.navTextStyle}>{this.state.name}</Text>
            </View>
            <View style={styles.navBar}>
              <View style={styles.leftContainer}>
                <Icon name={'gift'} size={30} color="#000"/>
              </View>
              <View style={styles.rightContainer}>
                <Text style={styles.navTextStyle}>
                  Profile
                </Text>
              </View>
            </View>
          </View>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={() => navigate('Chat')}
          underlayColor="#CCC"
          style={styles.menuTouchable}>
          <View style={styles.navBar}>
            <View style={styles.leftContainer}>
              <Icon name={'eye'} size={30} color="#000"/>
            </View>
            <View style={styles.rightContainer}>
              <Text style={styles.navTextStyle}>
                Chat
              </Text>
            </View>
          </View>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={() => navigate('CreateTask')}
          underlayColor="#CCC"
          style={styles.menuTouchable}>
          <View style={styles.navBar}>
            <View style={styles.leftContainer}>
              <Icon name={'eye'} size={30} color="#000"/>
            </View>
            <View style={styles.rightContainer}>
              <Text style={styles.navTextStyle}>
                Create Task
              </Text>
            </View>
          </View>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={() => navigate('Development')}
          underlayColor="#CCC"
          style={styles.menuTouchable}>
          <View style={styles.navBar}>
            <View style={styles.leftContainer}>
              <Icon name={'gift'} size={30} color="#000"/>
            </View>
            <View style={styles.rightContainer}>
              <Text style={styles.navTextStyle}>
                Development
              </Text>
            </View>
          </View>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={() => navigate('QRCode')}
          underlayColor="#CCC"
          style={styles.menuTouchable}>
          <View style={styles.navBar}>
            <View style={styles.leftContainer}>
              <Icon name={'gift'} size={30} color="#000"/>
            </View>
            <View style={styles.rightContainer}>
              <Text style={styles.navTextStyle}>
                QRCode
              </Text>
            </View>
          </View>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={() => navigate('Home')}
          underlayColor="#CCC"
          style={styles.menuTouchable}>
          <View style={styles.navBar}>
            <View style={styles.leftContainer}>
              <Icon name={'rocket'} size={30} color="#000"/>
            </View>
            <View style={styles.rightContainer}>
              <Text style={styles.navTextStyle}>
                Main
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      </View>
    );
  }

  _renderItem = ({item}) => {
    const {navigate} = this.props.navigation;
    var { navigation, display, type = '', icon = 'rocket', args = {}} = item;
    display = display || navigation;
    return (
      <TouchableHighlight
        onPress={() => navigate(navigation, args)}
        underlayColor="#CCC"
        style={styles.menuTouchable}>
        <View style={styles.navBar}>
          <View style={styles.leftContainer}>
            <Icon name={icon} size={30} color="#000"/>
          </View>
          <View style={styles.rightContainer}>
            <Text style={styles.navTextStyle}>
              {display}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

const HeadThumbnail = ({ iconUrl }) => {
  if (!iconUrl) {
    iconUrl =
      'https://s3.amazonaws.com/exp-brand-assets/ExponentEmptyManifest_192.png';
  }
  return (
    <Image
      source={{ uri: iconUrl }}
      style={{ width: 64, height: 64 }}
      resizeMode="cover"
    />
  );
};

DrawerView.propTypes = {
  navigation: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
  userImage: {
    borderColor: "rgba(0,0,0,0.2)",
    borderRadius: 45,
    borderWidth: 3,
    height: 90,
    marginBottom: 15,
    width: 90,
  },
  sectionHeadingStyle: {
    fontSize: 16,
    marginLeft: 15,
    marginTop: 9,
    marginBottom: 12,
  },
  firstTouchable: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: '#000',
  },
  menuTouchable: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: '#EDEDED',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContainer: {
    flex: 0.35,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  rightContainer: {
    flex: 0.55,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  navTextStyle: {
    paddingTop:10,
    fontSize: 15,
  },
  footerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  navTextStyle:{
    fontFamily :"mylodon-light",
  },
  profileContainer: {
    paddingTop: 50,
    justifyContent: 'center',
  },
  profileImg: {
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: '#EDEDED',
  },
});

export default DrawerView;