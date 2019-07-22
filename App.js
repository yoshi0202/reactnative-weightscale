import React, { Component } from "react";
import { StyleSheet, Text, Button, View, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { RNS3 } from "react-native-aws3";
import awsConfig from "./awsConfig";

window.LOG_LEVEL = "DEBUG";

export default class App extends Component {
    state = {
        url: ""
    };
    async _functionTest() {
        let result = await fetch(awsConfig.rekognitionUrl);
        Alert.alert(
            "Alert Title",
            "My Alert Msg",
            [
                {
                    text: result,
                    onPress: () => console.log("Ask me later pressed")
                },
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                { text: "OK", onPress: () => console.log("OK Pressed") }
            ],
            { cancelable: false }
        );
    }
    _functionWrapper() {
        return "hogehoge!";
    }
    async _getFile(filepath) {
        Storage.put(filepath)
            .then(result => console.log(result))
            .catch(err => console.log(err));
    }
    async _camera() {
        // ...(6)
        let result = await ImagePicker.launchCameraAsync();
        if (!result.cancelled) {
            console.log(result);
            const options = {
                // keyPrefix: "uploads/",
                keyPrefix: "",
                bucket: awsConfig.bucket,
                region: awsConfig.region,
                accessKey: awsConfig.accessKey,
                secretKey: awsConfig.secretKey,
                successActionStatus: 201
            };
            const file = {
                // uri can also be a file system path (i.e. file://)
                uri: result.uri,
                name: "image.png",
                type: "image/png"
            };
            RNS3.put(file, options).then(async function(response) {
                if (response.status !== 201) {
                    console.log(response);
                    throw new Error("Failed to upload image to S3");
                }
                console.log("put fin");
                fetch(awsConfig.rekognitionUrl)
                    .then(response => response.json())
                    .then(responseJson => {
                        console.log("detect fin");
                        console.log(responseJson);
                    })
                    .catch(error => {
                        console.error(error);
                    });
            });
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>Storage</Text>
                <Button title="Get Image" onPress={this._camera} />
                {this.state.url !== "" && (
                    <Image
                        source={{ uri: this.state.url }}
                        style={{ width: 300, height: 300 }}
                    />
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});
