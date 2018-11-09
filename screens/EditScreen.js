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
} from 'react-native';
import {
  TabViewAnimated,
  TabBar,
  TabViewPagerScroll,
  TabViewPagerPan,
} from 'react-native-tab-view'
import Fire from '../components/Fire';

export default class EditScreen extends React.Component {
  static navigationOptions = ( {navigation} ) => {
    const { getParam } = navigation;
    return {
      title: 'Edit',
      headerRight: (
        <Button
          onPress={getParam('complete', ()=>{})}
          title="Update"
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
    };
    this.props.navigation.setParams({ complete: this._complete });
  }

  _complete = () => {
    Fire.shared.updateInfo(this.state);
  }

  async componentDidMount() {
    await this.fetchdata();
  }

  async fetchdata(){
    let data = await Fire.shared.readInfo();
    if (data) {
      const {name, gender, age} = data;
      this.setState({name: name, gender: gender, age: age.toString()});
    }
  }

  render() {
    const username = this.state.name;
    const gender = this.state.gender;
    const age = this.state.age;
    const { getParam } = this.props.navigation;
    return (
      <ScrollView style={styles.container}>
        <View>
          <View style={styles.oneLineView}>
            <Text style={styles.optionsTitleText}>
              Username:
            </Text>
            <TextInput
              style={styles.textEditor}
              onChangeText={(text) => this.setState({name: text})}
              value={this.state.name}
            />
          </View>
          
          <View style={styles.oneLineView}>
            <Text style={styles.optionsTitleText}>
              Gender:
            </Text>
            <TextInput
              style={styles.textEditor}
              onChangeText={(text) => this.setState({gender: text})}
              value={this.state.gender}
            />
          </View>

          <View style={styles.oneLineView}>
            <Text style={styles.optionsTitleText}>
              Age:
            </Text>
            <TextInput
              style={styles.textEditor}
              onChangeText={(text) => this.setState({age: text})}
              value={this.state.age}
            />
          </View>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 15,
    paddingLeft: 15
  },
  oneLineView: {
    marginBottom: 15,
    flexDirection: 'row',
  },
  optionsTitleText: {
    // fontFamily :"mylodon-light",
    fontSize: 16,
  },
  textEditor: {
    marginLeft: 15,
    marginRight: 15,
    borderColor: 'gray',
    borderWidth: 1,
  },
});
