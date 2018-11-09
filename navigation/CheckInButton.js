import React from 'react';
import { ScrollView, StyleSheet, View, Text, Image, TouchableHighlight } from 'react-native';
import { withNavigation } from 'react-navigation';
import Icon from '@expo/vector-icons/FontAwesome';

class CheckInButton extends React.Component {
  render() {
    // const { navigate } = this.props.navigation;
    return (
      <View style={{
        // position: 'absolute',
        bottom: '25%',
        alignItems: 'center'
      }}>
        <TouchableHighlight
          onPress={() => console.log("CheckInButton Press")}
          // onPress={() => {console.log("CheckInButton Press"); navigate("CheckIn");}}
          underlayColor="#2882D8"
          style={styles.touchableButton}>
          <Icon name="plus" size={24} color="#fff"/>
        </TouchableHighlight>
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
  touchableButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#48A2F8'
  },
});

export default withNavigation(CheckInButton);