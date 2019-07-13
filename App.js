import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Button,
  View,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'
import Amplify, { Storage } from 'aws-amplify';
import awsmobile from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react-native'
Amplify.configure(awsmobile);
window.LOG_LEVEL='DEBUG'


export default class App extends Component {
  state = {
    url: ''
  }
  async _getFile(filepath) {
	Storage.put(filepath)
	.then(result => console.log(result))
	.catch(err => console.log(err));
  }
  async _camera () { // ...(6)
	let result = await ImagePicker.launchCameraAsync();
	// if(!result.cancelled) {
	// 	console.log(result);
	// 	console.log("Take fin");
	// 	Storage.put(result.uri, 'Hello', {
	// 		level: 'public',
	// 		contentType : 'image/jpeg' }
	// 	)
	// 	.then(result => console.log(result))
	// 	.catch(err => console.log(err));
	console.log(result.uri);
	if (!result.cancelled) {
		Storage.put(result.uri, 'Hello', {
			contentType : 'image/jpeg'
		})
		.then(result => console.log(result))
		.catch(err => console.log(err));
	}
  };

  render() {
    return (
      <View style={styles.container}>
        <Text>Storage</Text>
        <Button
          title="Get Image"
          onPress={this._camera}
        />
        {
          this.state.url !== '' && (
            <Image
              source={{ uri: this.state.url }}
              style={{ width: 300, height: 300 }}
            />
          )
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
