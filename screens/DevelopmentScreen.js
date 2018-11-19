import React from 'react'
import { ScrollView, StyleSheet, View, Text, Image, Button, Alert } from 'react-native'
import { WebBrowser, Constants } from 'expo'
import { Ionicons } from '@expo/vector-icons'
import Touchable from 'react-native-platform-touchable'
import Fire from '../components/Fire'
import { REACT_APP_FOURSQUARE_ID, REACT_APP_FOURSQUARE_SECRET } from 'react-native-dotenv'

const venues = [
  {
    label: 'Suzzallo Library',
    // value: '12280 NE District Way, Bellevue, WA 98005',
    value: '4a31cc4af964a5202b9a1fe3',
  },
  {
    label: 'Odegaard Library',
    // value: '4060 George Washington Lane Northeast, Seattle, WA 98195',
    value: '4a99e654f964a520063120e3',
  },
  {
    label: 'Husky Union Building',
    // value: '4001 E Stevens Way NE, Seattle, WA 98195',
    value: '441eb908f964a5207c311fe3',
  },
  {
    label: 'IMA',
    // value: '3924 Montlake Blvd NE, Seattle, WA 98195',
    value: '4ad7da23f964a520710f21e3',
  },
  {
    label: 'Husky Stadium',
    // value: '10214 NE 8th St Bellevue WA 98004',
    value: '42a78680f964a52014251fe3',
  },
  {
    label: 'Red square',
    // value: '1912 Pike Pl Seattle WA 98101',
    value: '4b06cf78f964a520a4f022e3',
  },
  {
    label: 'Kungfu Tea',
    // value: '400 Broad St, Seattle, WA 98109',
    value: '5789221b498e4bcb1f8c0beb',
  },
  {
    label: 'Enkore',
    // value: '2101 N Northlake Way, Seattle, WA 98103',
    value: '4a7406b6f964a520b5dd1fe3',
  },
  {
    label: 'Drumheller Fountain',
    // value: '550 106th Ave NE #215 Bellevue WA 98004',
    value: '4beb11bf415e20a171d8e5bb',
  },
  {
    label: 'Starbucks @ Ave',
    // value: '4147 University Way NE Seattle WA 98105',
    value: '4470775ef964a52093331fe3',
  },
]

export default class DevelopmentScreen extends React.Component {
  static navigationOptions = {
    title: 'Development',
  }

  render() {
    Alert.alert('Tips', "Be careful in this developper's page")
    return (
      <View style={styles.container}>
        <Button
          title="delete my pool"
          onPress={() => {
            Fire.shared.deleteMyPool()
          }}
        />
        <Button
          title="delete all pool"
          onPress={() => {
            Fire.shared.deleteAllPool()
          }}
        />
        <Button
          title="delete all notification"
          onPress={() => {
            Fire.shared.deleteAllNotification()
          }}
        />
        <Button
          title="generate a notification"
          onPress={() => {
            Fire.shared.generateNotification()
          }}
        />
        <Button
          title="transfer photos"
          onPress={() => {
            Fire.shared.transferAllImages()
          }}
        />
        <Button
          title="refresh personal pool"
          onPress={() => {
            Fire.shared.getPersonalPool(0)
          }}
        />
        <Button title="fetch list information" onPress={() => createVenue()} />
        <Button
          title="friends chat fix"
          onPress={() => {
            Fire.shared.fixFriendList()
          }}
        />
      </View>
    )
  }
}

fetchMarkerPhoto = async ID => {
  let fetchurl =
    'https://api.foursquare.com/v2/venues/' +
    ID +
    '?client_id=' +
    REACT_APP_FOURSQUARE_ID +
    '&client_secret=' +
    REACT_APP_FOURSQUARE_SECRET +
    '&v=20180323'
  try {
    let response = await fetch(fetchurl)
    let data = await response.json()
    console.log('foursquare photo data: ', data.response.venue)
    return {
      uri: data.response.venue.bestPhoto.prefix + 'original' + data.response.venue.bestPhoto.suffix,
      name: data.response.venue.name,
      address: data.response.venue.location.formattedAddress,
      description: data.response.venue.description,
    }
    // the following code is for recommended search, research search in fetchurl with recommended return data.response.groups[0].items
  } catch (err) {
    console.log('Marker Photo Failed')
    if (this.mountState)
      this.setState({
        errorMessage: err,
      })
  }
}

createVenue = async () => {
  // console.log(venues);
  output = []
  console.log('fetching list information')
  venues.map((element, index) => {
    Fire.shared.getPlaceInfo(element.value).then(data => {
      if (!data.description) {
        fetchMarkerPhoto(element.value).then(info => {
          console.log(info.name, ' has been set to firebase')
          Fire.shared.getPlaceInfo(element.value, { uri: info.uri, description: info.name })
        })
      } else {
        console.log(data.description, ' already exists')
      }
    })
  })
}

//   this.fetchMarkerData(element).then( (data) => {
//     return Fire.shared.getPlaceURI(data.id, data).then( (uri) => {
//       if (uri) {
//         return {
//           id: data.id,
//           uri: uri,
//           name: data.name,
//           location: data.address,
//         }
//       } else {
//         return this.fetchMarkerPhoto(data.id).then( (url) => {
//           if (url) {
//             Fire.shared.addPlaceURI(data.id, url);
//             return {
//               id: data.id,
//               uri: url,
//               name: data.name,
//               location: data.address,
//             }
//           }else{
//             return null;
//           }
//         });
//       }
//     });
//   }).then( (detailedInfo) => {
//     // console.log('YAAAAA', detailedInfo)
//     output.push(detailedInfo);
//   //   this.setState({location,region,markers:markersInfo.filter((obj)=>obj)});
//   // this.loadingMarkers = false;
//   // console.log('total promise time', new Date().getTime() - v0);
//   })
// });
// }

// fetchMarkerData = async (element) =>{
//   //venues.map(async (element,index)=>{
//     let fetchurl = "https://api.foursquare.com/v2/venues/search?client_id="+REACT_APP_FOURSQUARE_ID+"&client_secret="+REACT_APP_FOURSQUARE_SECRET+"&v=20180323&limit=3&near=" + element.value + "&query="  + element.label ;
//     //console.log(fetchurl);
//     try{
//       let response = await fetch(fetchurl);
//       let data = await response.json();
//       let name = data.response.venues[0].name;
//       let id = data.response.venues[0].id;
//       console.log(element.label,{name:name,id:id,address:address});
//       let address = data.response.venues[0].location.formattedAddress
//       return {name:name,id:id,address:address}
//   }catch(err){
//     console.log('this problem is not being fetched: ', element.label , fetchurl)
//   }
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
  optionsTitleText: {
    fontFamily: 'mylodon-light',
    fontSize: 16,
    marginLeft: 15,
    marginTop: 9,
    marginBottom: 12,
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
    fontSize: 15,
    marginTop: 1,
  },
  titleContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
  },
  titleIconContainer: {
    marginRight: 15,
    paddingTop: 2,
  },
  nameText: {
    fontWeight: '600',
    fontSize: 18,
  },
  slugText: {
    color: '#a39f9f',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  descriptionText: {
    fontSize: 14,
    marginTop: 6,
    color: '#4d4d4d',
  },
})
