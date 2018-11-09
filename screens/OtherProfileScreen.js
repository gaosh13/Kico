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
import ButtonComponent, { CircleButton, RoundButton, RectangleButton } from 'react-native-button-component';
import AwesomeButton from 'react-native-really-awesome-button';


const Spacer = () => <View style={styles.spacer} />;
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
    }
  }

  constructor(props) {
    super(props);
    const { getParam } = this.props.navigation;
    this.state = {
      name: getParam('name','______'),
      gender: 'unknown',
      age: 'unknown',
      friendsLoaded: false,
      poolLoaded: false,
      photoUrl: '../assets/images/icon.png',
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
    return (
        <ImageBackground
          style={styles.headerBackgroundImage} 
          source={require('../assets/images/giphy.gif')}
        >
          <View style={styles.headerColumn}>
            <Spacer />
            <Spacer />
            <Spacer />
            <Spacer />
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
            <Spacer />
            <Spacer />
	        <Spacer />
	        <Spacer />
	        <Spacer />
            <Spacer />
	        <AwesomeButton
		       progress
		       height={50}
		       onPress={(next) => setTimeout(() => { next() }, 1000)}>
		       <Text style={styles.text}>{"Initiate Ki Entanglement"}</Text>
		     </AwesomeButton>
          </View>
        </ImageBackground>
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
      </ScrollView>
    );
  }
}


const styles = StyleSheet.create({
  spacer: {
    height: 20,
  },
  text: {
    fontFamily :"kontakt",
    fontSize: 10,
    color:"white",
    textAlign: "center",
    fontWeight: '100',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBackgroundImage: {
  	flex:1,
  	width: width, 
  	height: height
  },
  headerContainer: {
  },
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
  	marginTop:100,
    borderColor: '#01C89E',
    borderRadius: 100,
    borderWidth: 3,
    height: 200,
    marginBottom: 15,
    width: 200,
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
