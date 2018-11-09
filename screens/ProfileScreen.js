import React from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  Button,
  TextInput,
  Platform,
  Icon,
  ImageBackground,
  FlatList,
  Dimensions,
} from 'react-native';
import {
  TabViewAnimated,
  TabBar,
  TabViewPagerScroll,
  TabViewPagerPan,
} from 'react-native-tab-view'
import Fire from '../components/Fire';
import KiVisual from '../components/KiVisual';
import ButtonComponent, { CircleButton, RoundButton, RectangleButton } from 'react-native-button-component';


const { width, height } = Dimensions.get("window");

export default class ProfileScreen extends React.Component {
  static navigationOptions = ( {navigation} ) => {
    const { getParam } = navigation;
    return {
      headerTransparent: true,
      headerStyle: {
        backgroundColor: 'transparent',
        borderBottomWidth: 0
      },
      headerLeft: (
        <Button
          onPress={() => navigation.openDrawer()}
          title="Menu"
          color="#000"/>
      ),
      headerRight: (
        <Button
          onPress={() => navigation.navigate('Edit')}
          title="Edit"
          color="#000"/>
      ),
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      name: 'Annie',
      gender: 'female',
      age: '18',
      ki: undefined,
      friendsLoaded: false,
      poolLoaded: false,
      profileLoaded: false,
      photoUrl: '../assets/images/icon.png',
      pool:[],
      tabs: {
        index: 0,
        routes: [
          { key: '1', title: 'Level', count: 2 },
          { key: '2', title: 'Missions', count: 3 },
          { key: '3', title: 'Friends', count: 3 },
          { key: '4', title: 'Pool', count: 3 },
        ],
      },
    };
  }

  async componentDidMount() {
    await this.fetchdata();
  }

  async fetchdata(){
    let data = await Fire.shared.readInfo();
    let moredata = await Fire.shared.readAuth();
    if (data && moredata) {
      const {name, gender, age} = data;
      const {photoURL} = moredata;
      this.setState({name: name, gender: gender, age: age.toString(),photoUrl: photoURL});
    }
  }

  renderHeader = () => {
    const avatarBackground = "https://orig00.deviantart.net/dcd7/f/2014/027/2/0/mountain_background_by_pukahuna-d73zlo5.png";

    return (
      <View style={styles.headerContainer}>
        <ImageBackground
          style={styles.headerBackgroundImage}
          blurRadius={10}
          source={{
            uri: avatarBackground,
          }}
        >
          <View style={styles.headerColumn}>
            <Image
              style={styles.userImage}
              source={{
                uri: this.state.photoUrl,
              }}
            />
            <Text style={styles.userNameText}>{this.state.name}</Text>
            <View style={styles.centerRow}>
              <View style={styles.transparentRow}>
                <Text style={styles.userInfoText}>
                  {`${this.state.age},  ${this.state.gender}`}
                </Text>
              </View>
            </View>
            <View style={styles.centerRow}>
              <View style={styles.transparentRow}>
                <Text style={styles.userCityText}>
                  Seattle, United States
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    )
  }

  _handleIndexChange = (index) => {
    this.setState({
      tabs: {
        ...this.state.tabs,
        index,
      },
    })
  }

  _renderHeader = props => {
    return (
      <TabBar
        {...props}
        indicatorStyle={styles.indicatorTab}
        renderLabel={this._renderLabel(props)}
        pressOpacity={0.8}
        style={styles.tabBar}
      />
    )
  }

  async fetchFriends(){
    let data = await Fire.shared.getFriends();
    if (data) {
      this.state.tabs.routes[2].count = data.length;
      this.setState({friends: data});
    }
  }

  async fetchPool() {
    Fire.shared.getPersonalPool().then( (Data) => {
        this.state.tabs.routes[3].count = Data.length;
        return Promise.all(Data.map( (users, index) => {
          return Fire.shared.readUserAvatar(users.uid).then( (uri) => {
            if (uri) {
              return {
                uid: users.uid,
                uri: uri,
                value:users.value,
                name: users.name,
              };
            } else {
              console.log('URL fetching failed')
                }
          });
        }))
    }).then( (updatedData)=>{
      if (updatedData) {
        console.log('personalpool Data has been pulled', updatedData);
        let checkinSum = updatedData.reduce((prev,next) => prev + next.value,0); 
        this.setState({pool: updatedData, sum: checkinSum});
      }else{
        console.log('personalpool Data fetch has failed');
      }
    })      
  }

  async fetchProfile() {
    let data = await Fire.shared.readInfo();
    this.setState({ki: data.ki || 100});
  }

  _renderFriends() {
    let { navigation } = this.props;
    
    return (
      <FlatList
        data={this.state.friends}
        keyExtractor={this._friendExtractor}
        renderItem={this._renderFriendItem}
      />
    );
  }

  _renderPool() {
    let { navigation } = this.props;
    return (
      <View>
          <View style={styles.particlesContainer}>
            {this.drawKiView()}
          </View>

        <FlatList
          data={this.state.pool}
          keyExtractor={this._poolExtractor}
          renderItem={this._renderPoolItem}
        />
      </View>
    );
  }

  drawKiView() {
// follows this tutorial:
// https://www.youtube.com/watch?v=XATr_jdh-44
    if (this.state.pool.length){
      // let friendSum = this.state.pool.reduce((prev,next) => prev + next.value,0);
      return (
        <View style={styles.kiContainer}>
          {KiVisual.shared.generateCircles(this.state.pool,this.state.sum,this.props.navigation)}      
        </View>
      );
    }else{
      console.log('wait....');
      return (
        <View style={styles.kiContainer} />
      );
    }
  }

  _friendExtractor = (item, index) => {return "friend" + index}

  _renderFriendItem = ({item}) => {
    return (      
      <View style={styles.friendItemContainer}>
        <View style={styles.friendItemLeft}>
          <Image
            source={require("../assets/images/robot-dev.png")}
            style={{ width: 30, height: 30 }}
            resizeMode="cover"
          />
          <Text style={{fontSize: 18}}>{item.name}</Text>
        </View>
        <View style={styles.friendItemRight}>
          <Text style={{fontSize: 18, color: 'blue'}}>{item.tag}</Text>
          <Button title="Remove" onPress={() => {this._removeFriend(item.uid); this.setState({friendsLoaded: false});}}/>
        </View>
      </View>
    );
  }

  _removeFriend = async (uid) => {
    await Fire.shared.removeFriend(uid, 'active');
  }

  _poolExtractor = (item, index) => {return "pool" + index}

  _renderPoolItem = ({item}) => {
    return (
        <View style={styles.friendItemContainer}>
          <View style={styles.friendItemLeft}>
            <Image
              source={require("../assets/images/robot-dev.png")}
              style={{ width: 30, height: 30 }}
              resizeMode="cover"
            />
            <Text style={{fontSize: 18}}>{item.name}</Text>
          </View>
          <View style={styles.friendItemRight}>
            <Text style={{fontSize: 18, color: 'blue'}}>{item.value.toString()}</Text>
            <Button title="Add" onPress={() => {this._addFriend(item.uid)}}/>
          </View>
        </View>
    );
  }

  _addFriend = async (uid) => {
    await Fire.shared.addFriend(uid);
  }

  _renderScene = ({ route: { key } }) => {
    switch (key) {
      case '1':
        if (!this.state.personalLoaded) {
          this.fetchProfile().then((token) => {this.setState({personalLoaded: true})});
          return <View><Text>Loading...</Text></View>;
        } else {
          return <View><Text>Remaining Ki: {this.state.ki}</Text></View>
        }
      case '3':
        if (!this.state.friendsLoaded) {
          this.fetchFriends().then((token) => {this.setState({friendsLoaded: true})});
          return <View><Text>Loading...</Text></View>;
        } else {
          return this._renderFriends();
        }
      case '4':
        if (!this.state.poolLoaded) {
          this.fetchPool().then((token) => {this.setState({poolLoaded: true})});
          return <View><Text>Loading...</Text></View>;
        } else {
          return this._renderPool();
        }
      default:
        return <View />
    }
  }

  _renderLabel = props => ({ route, index }) => {
    const inputRange = props.navigationState.routes.map((x, i) => i)
    const outputRange = inputRange.map(
      inputIndex => (inputIndex === index ? 'black' : 'gray')
    )
    const color = props.position.interpolate({
      inputRange,
      outputRange,
    })

    return (
      <View>
        <Animated.Text style={[styles.tabLabelNumber, { color }]}>
          {route.title}
        </Animated.Text>
        <Animated.Text style={[styles.tabLabelText, { color }]}>
          {route.count}
        </Animated.Text>
      </View>
    )
  }

  _renderPager = props => {
    return Platform.OS === 'ios' ? (
      <TabViewPagerScroll {...props} />
    ) : (
      <TabViewPagerPan {...props} />
    )
  }

  render() {
    const username = this.state.name;
    const gender = this.state.gender;
    const age = this.state.age;
    const { getParam } = this.props.navigation;
    return (
      <ScrollView style={styles.container}>
        {this.renderHeader()}
        <TabViewAnimated
          style={styles.tabContainer}
          navigationState={this.state.tabs}
          renderScene={this._renderScene}
          renderPager={this._renderPager}
          renderHeader={this._renderHeader}
          onIndexChange={this._handleIndexChange}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBackgroundImage: {
    paddingBottom: 20,
    paddingTop: 35,
  },
  kiContainer: {
    width: width-30,
    height: width-30, 
  },
  headerContainer: {},
  headerColumn: {
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        alignItems: 'center',
        elevation: 1,
        marginTop: -1,
      },
      android: {
        alignItems: 'center',
      },
    }),
  },
  centerRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  transparentRow: {
    backgroundColor: 'transparent',
  },
  userInfoText: {
    color: '#C5C5C5',
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    paddingBottom: 5,
  },
  userCityText: {
    color: '#A5A5A5',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  userImage: {
    borderColor: '#01C89E',
    borderRadius: 85,
    borderWidth: 3,
    height: 170,
    marginBottom: 15,
    width: 170,
  },
  userNameText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    paddingBottom: 8,
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: '#EEE',
  },
  tabContainer: {
    flex: 1,
    marginBottom: 12,
  },
  tabLabelNumber: {
    color: 'gray',
    fontSize: 12.5,
    textAlign: 'center',
  },
  tabLabelText: {
    color: 'black',
    fontSize: 22.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  indicatorTab: {
    backgroundColor: 'transparent',
  },
  friendItemContainer: {
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
  friendItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsTitleText: {
    fontFamily :"mylodon-light",
    fontSize: 16,
    marginLeft: 15,
    marginTop: 9,
    marginBottom: 12,
  },
  textEditor: {
    marginLeft: 15,
    marginTop: 9,
    marginBottom: 12,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
  },
    particlesContainer:{
    height: width,
    width: width,
  },
    particle:{
    height:10,
    width:10,
    opacity:0.2
  }
});
