import React from 'react';
import {
  Animated,
  Linking,
  Platform,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { Asset, LinearGradient, Notifications, WebBrowser, Video } from 'expo';
import { BorderlessButton, RectButton } from 'react-native-gesture-handler';
import { NavigationActions } from 'react-navigation';
import FadeIn from 'react-native-fade-in-image';
import { View as AnimatableView } from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { withNavigation } from 'react-navigation';

import AnimatedScrollView from '../components/AnimatedScrollView';
import NavigationBar from '../components/NavigationBar';
import TalksUpNext from '../components/TalksUpNext';
import MenuButton from '../components/MenuButton';
import VideoBackground from '../components/VideoBackground';
import { BoldText, SemiBoldText } from '../components/StyledText';
import { connectDrawerButton } from '../Navigation';
import { Colors, FontSizes, Layout } from '../constants';
import { Speakers, Talks } from '../data';
import {
  HideWhenConferenceHasStarted,
  HideWhenConferenceHasEnded,
  ShowWhenConferenceHasEnded
} from '../utils';

import appParams from '../../app.json';

import { Skin, websites } from '../config/Settings'

let socialButtons = [];
websites.forEach(item => {
  socialButtons.push(
    <TouchableOpacity key={item.url} onPress={() => { WebBrowser.openBrowserAsync(item.url) }}>
      <Ionicons
        name={item.icon}
        size={30}
        style={{
          color: Skin.SocialButtons,
          marginTop: 3, marginBottom: 3,
          marginLeft: 10, marginRight: 10,
          backgroundColor: 'transparent'
        }}
      />
    </TouchableOpacity>
  );
});

class Home extends React.Component {
  state = {
    scrollY: new Animated.Value(0)
  };

  static navigationOptions = {
    drawerLabel: 'HOME'
  };

  componentDidMount() {
    Notifications.addListener(this._handleNotification);
  }

  _handleNotification = notification => {
    if (notification.origin === 'selected') {
      // notification was tapped, either from the app already open or from entering the app
      // console.log('SELECTED notification', notification.data.song.title);

      // TODO: open SingleSong screen and send it the Song object buried inside the notification

      // kinda like this but it doesn't work from this far out (because navigation doesn't exist yet)
      this.props.navigation.navigate('SingleSong', {song: notification.data.song});

      // Maybe set app state and do something with it that way?
      // this.setState({ notification: notification });

    } else if (notification.origin === 'received') {
      // notification was received, either app was already open or it just opened up but not from the notification
      // no way to tell which?
      // console.log('RECEIVED notification', notification.data.song.title);

      // We don't necessarily want to do anything in this case
    }
  };

  render() {
    const { scrollY } = this.state;
    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 150],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    });

    return (
      <View style={{ flex: 1 }}>
        <AnimatedScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 + Layout.notchHeight / 2 }}
          scrollEventThrottle={1}
          onScroll={Animated.event(
            [
              {
                nativeEvent: { contentOffset: { y: scrollY } }
              }
            ],
            { useNativeDriver: true }
          )}
        >
          <View
            style={{
              backgroundColor: '#187f65',
              padding: 10,
              paddingTop: Layout.headerHeight - 10,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <View style={styles.headerVideoLayer}>
              <VideoBackground />
              <View style={styles.headerVideoOverlay} />
              <LinearGradient
                colors={[Colors.green, 'transparent']}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0
                }}
              />
            </View>
            <Image
              source={require('../assets/home-logo.png')}
              style={{ height: 60, resizeMode: 'contain' }}
              tintColor="#fff"
            />
            <View style={styles.headerContent}>
              <SemiBoldText style={styles.headerText}>{appParams.expo.version}</SemiBoldText>
            </View>
          </View>

          <DeferredHomeContent />
          <OverscrollView />
        </AnimatedScrollView>

        <NavigationBar
          renderLeftButton={() => <MenuButton />}
          animatedBackgroundOpacity={headerOpacity}
        />
      </View>
    );
  }
}

@withNavigation
class DeferredHomeContent extends React.Component {
  state = {
    ready: Platform.OS === 'android' ? false : true
  };

  componentDidMount() {
    if (this.state.ready) {
      return;
    }

    setTimeout(() => {
      this.setState({ ready: true });
    }, 200);
  }

  render() {
    if (!this.state.ready) {
      return null;
    }
    return (
      <AnimatableView animation="fadeIn" useNativeDriver duration={800}>
        <TalksUpNext
          style={{ marginTop: 20, marginHorizontal: 15, marginBottom: 2 }}
        />
        <View style={{ marginHorizontal: 15, marginBottom: 20 }}>
          <TouchableOpacity onPress={this._handlePressAllSongs}>
            <SemiBoldText style={styles.seeAllTalks}>
              See all songs →
            </SemiBoldText>
          </TouchableOpacity>
        </View>
        <View style={{ marginHorizontal: 15, flex: 1 }}>
          <SemiBoldText>Follow us</SemiBoldText>
        </View>
        <View flexDirection="row" style={{ paddingHorizontal: 20 }}>
          {socialButtons}
        </View>
      </AnimatableView>
    );
  }

  _handlePressAllSongs = () => {
    this.props.navigation.dispatch(
      NavigationActions.navigate({
        routeName: 'Songbook'
      })
    );
  };
}

const OverscrollView = () => (
  <View
    style={{
      position: 'absolute',
      top: -400,
      height: 400,
      left: 0,
      right: 0,
      backgroundColor: '#032E55'
    }}
  />
);

const ClipBorderRadius = ({ children, style }) => {
  return (
    <View
      style={[
        { borderRadius: BORDER_RADIUS, overflow: 'hidden', marginTop: 10 },
        style
      ]}
    >
      {children}
    </View>
  );
};

const BORDER_RADIUS = 3;

const styles = StyleSheet.create({
  headerContent: {
    alignItems: 'center',
    marginTop: 5,
    paddingVertical: 10
  },
  headerVideoLayer: {
    ...StyleSheet.absoluteFillObject
  },
  headerVideoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.green,
    opacity: 0.8
  },
  headerText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 17 * 1.5
  },
  buyButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS
  },
  buyButtonText: {
    backgroundColor: 'transparent',
    color: 'rgba(0,0,0,0.9)',
    fontSize: FontSizes.normalButton
  },
  bigButton: {
    backgroundColor: Colors.green,
    paddingHorizontal: 15,
    height: 50,
    marginHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    flexDirection: 'row'
  },
  bigButtonText: {
    fontSize: FontSizes.normalButton,
    color: '#fff',
    textAlign: 'center'
  },
  seeAllTalks: {
    fontSize: FontSizes.normalButton,
    color: Colors.green
  }
});

export default Home;
