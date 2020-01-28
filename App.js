/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  AsyncStorage,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import LinearGradient from 'react-native-linear-gradient';
import firebase from 'react-native-firebase';
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import { LoginButton, AccessToken } from 'react-native-fbsdk';

GoogleSignin.configure();

class App extends React.Component {

  state = {
    fcmToken: ''
  }

  componentDidMount = async () => {
    // this.props.navigation.navigate('LoginOptions');

    const fcmToken = await firebase.messaging().getToken();
    if (fcmToken) {
      // user has a device token
      console.log(fcmToken);
      this.setState({ fcmToken });
      AsyncStorage.setItem('fcmToken', fcmToken);
    } else {
      // user doesn't have a device token yet
      console.log(fcmToken);
    }

    if (this.hasPermission()) {
      this.removeNotificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification) => {
        // Process your notification as required
        // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
        console.log('notification displayed');
      });
      this.removeNotificationListener = firebase.notifications().onNotification((notification) => {
        // Process your notification as required
        this.showNotification(notification);
      });
    } else {
      this.askPermission();
    }
  }

  componentWillUnmount() {
    this.removeNotificationDisplayedListener();
    this.removeNotificationListener();
  }

  hasPermission = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      // user has permissions
      return true;
    } else {
      // user doesn't have permission
      return false;
    }
  }

  askPermission = async () => {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
    } catch (error) {
      // User has rejected permissions
    }
  }

  showNotification = async (notification) => {
    // const notification = new firebase.notifications.Notification()
    //   .setNotificationId('notificationId')
    //   .android.setChannelId('clique_notify')
    //   .setTitle('My notification title')
    //   .setBody('My notification body')
    //   .setData({
    //     key1: 'value1',
    //     key2: 'value2',
    //   });

    // var noti_sound = await AsyncStorage.getItem(Constant.NOTIFICATION_SOUND);

    // Build a channel
    // const channel = new firebase.notifications.Android.Channel('test-channel', 'Test Channel', firebase.notifications.Android.Importance.Max)
    //   .setDescription('My apps test channel');

    // // Create the channel
    // await firebase.notifications().android.createChannel(channel);

    notification.android.setChannelId('clique_notify');
    // notification.android.setBigPicture(notification.data.image);
    // noti_sound && 
    // notification.setSound('when');

    firebase.notifications().displayNotification(notification).catch(err => console.log(err));
  }

  signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      this.setState({ userInfo });
      console.log(userInfo);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        console.log(error);
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
        console.log(error);
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        console.log(error);
      } else {
        // some other error happened
        console.log(error);
      }
    }
  };

  render() {
    return (
      <View colors={['#000', '#fff']} useAngle angle={100}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <Text>Token : {this.state.fcmToken}</Text>

            <GoogleSigninButton
              style={{ width: 192, height: 48 }}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={this.signIn}
              disabled={this.state.isSigninInProgress} />

            <LoginButton
              onLoginFinished={
                (error, result) => {
                  if (error) {
                    console.log("login has error: " + result.error);
                  } else if (result.isCancelled) {
                    console.log("login is cancelled.");
                  } else {
                    AccessToken.getCurrentAccessToken().then(
                      (data) => {
                        console.log(data.accessToken.toString())
                      }
                    )
                  }
                }
              }
              onLogoutFinished={() => console.log("logout.")} />

          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
