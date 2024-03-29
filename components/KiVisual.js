import React from 'react'
import { TouchableOpacity, Dimensions, ScrollView } from 'react-native'
import AsyncImageAnimated from '../components/AsyncImageAnimated'

const { width, height } = Dimensions.get('window')

const area = width * height

export class RandomCircles extends React.PureComponent {
  // use PureComponent to prevent the circles from the unnessassary refresh

  render() {
    const pool = Array.from(this.props.pool)
    const navigation = this.props.navigation
    var NumCircles = 0
    if (pool) {
      NumCircles = pool.length
    }
    var values = pool.sort((a, b) => {
      return b.value - a.value
    })
    var counter = 0
    var savedCirclesCounter = 0
    //maximum number of bubbles to be tested
    var overlapping = false

    while (NumCircles < 15) {
      pool.push({ uid: null, name: 'AI', source: require('../assets/images/AI.jpeg'), value: 0.65 })
      NumCircles++
    }

    // console.log('Lets check order', pool);

    var protection = NumCircles * 100

    let newSum = pool.reduce((prev, next) => prev + next.value, 0)

    circles = []

    while (circles.length < NumCircles && counter < protection) {
      //perhaps better algorithm here, like if circles.lenght<NumCircles && counter > protection, redo the while loop with larger denomicator beneath area
      var size = Math.sqrt((pool[savedCirclesCounter].value / newSum) * (area / 12))
      var randomX = size + Math.round(Math.random() * (2 * width - size * 2))
      var randomY = size + Math.round(Math.random() * ((292 / 812) * height - size * 2))
      var opacity = 0.5 + 0.5 * (Math.max(0, 8 - savedCirclesCounter) / 8)
      var uri = pool[savedCirclesCounter].uri
      var name = pool[savedCirclesCounter].name
      var uid = pool[savedCirclesCounter].uid

      overlapping = false

      // check that it is not overlapping with any existing circle
      for (var i = 0; i < circles.length; i++) {
        var existing = circles[i]
        var d = Math.hypot(randomX - existing.xPos, randomY - existing.yPos)
        //fixed 12 pixel seperation
        if (d < size + existing.width + 6) {
          // They are overlapping
          overlapping = true
          // do not add to array
          break
        }
      }

      // add valid circles to array
      if (!overlapping) {
        if (uri) {
          var circle = {
            width: size,
            xPos: randomX,
            yPos: randomY,
            opacity: opacity,
            source: { uri: uri },
            uid: uid,
            name: name,
          }
        } else {
          var circle = {
            width: size,
            xPos: randomX,
            yPos: randomY,
            opacity: opacity,
            source: pool[savedCirclesCounter].source,
            uid: uid,
            name: name,
          }
        }
        savedCirclesCounter++
        // console.log('circle', savedCirclesCounter, 'is being rendered: ',circle);
        circles.push(circle)
      }
      counter++
    }
    return clickBox(circles, navigation)
  }
}

function clickBox(circles, navigation) {
  return circles.map((element, index) => {
    // console.log('dararda', element);
    return (
      <TouchableOpacity
        key={index}
        onPress={() => {
          if (element.uid) {
            navigation.navigate('ViewOther', {
              uri: element.source.uri,
              name: element.name,
              uid: element.uid,
            })
          }
        }}
        style={{
          position: 'absolute',
          width: element.width * 2,
          height: element.width * 2,
          borderRadius: element.width,
          // shadowOffset: { width: 0, height: 10 },
          // shadowRadius: 20,
          // shadowColor: 'rgba(0,0,0,1)',
          // shadowOpacity: 0.4,
          top: element.yPos - element.width,
          left: element.xPos - element.width,
        }}
      >
        <AsyncImageAnimated
          style={{
            position: 'absolute',
            width: element.width * 2,
            height: element.width * 2,
            borderRadius: element.width,
            // opacity: element.opacity,
          }}
          source={element.source}
          placeholderColor="purple"
          animationStyle="fade"
        />
      </TouchableOpacity>
    )
  })
}

function getImage(uri) {
  if (uri) return { uri: uri }
  else return require('../assets/images/AI.jpeg')
}

export function generateCirclesRow(originPool) {
  //this needs to be changed w.r.t. time not array value
  //var values = pool.sort((a,b)=>{return b.value-a.value})

  // console.log(pool);
  let pool = Array.from(originPool)
  var NumCircles = 0
  if (pool) {
    NumCircles = pool.length
  }
  while (NumCircles < 15) {
    pool.push({ uid: null, name: 'AI', source: require('../assets/images/AI.jpeg'), value: 1 })
    NumCircles++
  }

  let newSum = pool.reduce((prev, next) => prev + next.value, 0)

  return (
    <ScrollView
      horizontal
      scrollEventThrottle={1}
      showsHorizontalScrollIndicator={false}
      snapToInterval={(68 / 812) * height + 5}
      style={{
        paddingBottom: 15,
        paddingTop: 8,
      }}
      contentContainerStyle={{
        paddingLeft: 16,
        paddingRight: 16,
        justifyContent: 'center',
      }}
      decelerationRate="fast"
    >
      {pool.map((element, index) => (
        <AsyncImageAnimated
          key={index}
          style={{
            marginHorizontal: 4,
            width: (68 / 812) * height,
            height: (68 / 812) * height,
            opacity: !element.hidden ? 1.0 : 0.5,
            borderRadius: (34 / 812) * height,
            shadowOffset: { width: 0, height: 5 },
            shadowRadius: 5,
            shadowColor: 'rgba(0,0,0,1)',
            shadowOpacity: 0.2,
          }}
          source={getImage(element.uri)}
          placeholderColor="#cfd8dc"
          animationStyle="fade"
        />
      ))}
    </ScrollView>
  )
}

export function generateRowNoFunction(originPool) {
  return (
    <ScrollView
      horizontal
      scrollEventThrottle={1}
      showsHorizontalScrollIndicator={false}
      snapToInterval={(68 / 812) * height + 5}
      style={{
        paddingBottom: 15,
        paddingTop: 8,
      }}
      contentContainerStyle={{
        paddingLeft: 16,
        paddingRight: 16,
        justifyContent: 'center',
      }}
      decelerationRate="fast"
    >
      {originPool.map((element, index) => (
        <AsyncImageAnimated
          key={index}
          style={{
            marginHorizontal: 4,
            width: (68 / 812) * height,
            height: (68 / 812) * height,
            borderRadius: (34 / 812) * height,
            shadowOffset: { width: 0, height: 5 },
            shadowRadius: 5,
            shadowColor: 'rgba(0,0,0,1)',
            shadowOpacity: 0.2,
          }}
          source={getImage(element.uri)}
          placeholderColor="#cfd8dc"
          animationStyle="fade"
        />
      ))}
    </ScrollView>
  )
}

export function generateMultiChoiceCirclesRow(pool, onPressItem, picked) {
  return (
    <ScrollView
      horizontal
      scrollEventThrottle={1}
      showsHorizontalScrollIndicator={false}
      snapToInterval={(68 / 812) * height + 5}
      style={{
        paddingBottom: 15,
        paddingTop: 8,
      }}
      contentContainerStyle={{
        paddingLeft: 16,
        paddingRight: 16,
        justifyContent: 'center',
      }}
      decelerationRate="fast"
    >
      {pool.map((element, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            if (element.uid) onPressItem(index)
          }}
        >
          <AsyncImageAnimated
            style={{
              marginHorizontal: 4,
              width: (68 / 812) * height,
              height: (68 / 812) * height,
              opacity: picked.has(index) ? 1.0 : 0.5,
              borderRadius: (34 / 812) * height,
              shadowOffset: { width: 0, height: 5 },
              shadowRadius: 5,
              shadowColor: 'rgba(0,0,0,1)',
              shadowOpacity: 0.2,
            }}
            source={getImage(element.uri)}
            placeholderColor="#cfd8dc"
            animationStyle="fade"
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}
