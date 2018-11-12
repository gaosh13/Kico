import React from 'react';
import { ScrollView, StyleSheet, View, Text, Image, Button } from 'react-native';
import { WebBrowser, Constants } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Touchable from 'react-native-platform-touchable';
import Fire from '../components/Fire';

export default class Congratulations extends React.Component {
    static navigationOptions = ( {navigation} ) => {
    return {
      title: "Congratulations",
      headerLeft: (
        <Button
          onPress={() => navigation.navigate("Home")}
          title="Back"
          color="#222"
        />
      ),
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      uri: '',
    };
  }

  async componentDidMount() {
    const uid = this.props.navigation.getParam('uid', '0');
    Fire.shared.getNameNAvatar(uid).then( (data) => {
      this.setState(data);
    });
  }

  render() {
    const name = this.state.name;
    return (
      <View style={styles.container}>
        <Text>{`Congratulations, you are a friend of ${name} now`}</Text>
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
});
