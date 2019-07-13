import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Button,
  View,
  Image
} from 'react-native';
import { ImagePicker } from 'expo';
import Amplify, { Storage } from 'aws-amplify';
import awsmobile from './aws-exports';
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
	console.log(result.uri);
	if (!result.cancelled) {
		Storage.put(result.uri, 'Hello', {
			metadata: { "Content-Type" : 'image/jpeg' },
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