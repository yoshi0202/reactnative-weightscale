import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    Button,
    View,
    Image,
    Alert,
    TouchableOpacity
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { RNS3 } from "react-native-aws3";
import awsConfig from "./awsConfig";

window.LOG_LEVEL = "DEBUG";

export default class App extends Component {
    async _camera() {
        let noodleFlg = false;
        let result = await ImagePicker.launchCameraAsync();
        if (!result.cancelled) {
            //配列形式に変換して最後を取得
            let fileName = result.uri.split("/").pop();
            //拡張子を取得
            let fileNameExt = fileName.split(".").pop();
            console.log("fileName:" + fileName);
            console.log("fileNameExt:" + fileNameExt);
            const options = {
                keyPrefix: "",
                bucket: awsConfig.bucket,
                region: awsConfig.region,
                accessKey: awsConfig.accessKey,
                secretKey: awsConfig.secretKey,
                successActionStatus: 201
            };
            const file = {
                uri: result.uri,
                name: fileName,
                type: "image/" + fileNameExt
            };
            RNS3.put(file, options).then(async function(response) {
                if (response.status !== 201) {
                    throw new Error("Failed to upload image to S3");
                }
                console.log("put fin");

                let url =
                    awsConfig.rekognitionUrl +
                    "/?filename=" +
                    file.name +
                    "&type=" +
                    fileNameExt;
                fetch(url)
                    .then(response => response.json())
                    .then(responseJson => {
                        let result = responseJson.body.Labels;
                        result.forEach(function(data) {
                            console.log("Confidence:" + data.Confidence);
                            console.log("Name:" + data.Name);
                            if (data.Name === "Noodle") {
                                noodleFlg = true;
                            }
                        });
                        if (noodleFlg) {
                            Alert.alert("判別結果", "ラーメン注意");
                        } else {
                            Alert.alert("判別結果", "食べていいよ");
                        }
                        console.log("detect fin");
                    })
                    .catch(error => {
                        console.error(error);
                    });
            });
        }
    }
    async _getFile() {
        try {
            let options = {
                mediaTypes: ImagePicker.MediaTypeOptions.All
            };
            let noodleFlg = false;
            let result = await ImagePicker.launchImageLibraryAsync(options);
            if (!result.cancelled) {
                console.log(result);
                //配列形式に変換して最後を取得
                let fileName = result.uri.split("/").pop();
                //拡張子を取得
                let fileNameExt = fileName.split(".").pop();
                console.log("fileName:" + fileName);
                console.log("fileNameExt:" + fileNameExt);
                const options = {
                    keyPrefix: "",
                    bucket: awsConfig.bucket,
                    region: awsConfig.region,
                    accessKey: awsConfig.accessKey,
                    secretKey: awsConfig.secretKey,
                    successActionStatus: 201
                };
                const file = {
                    uri: result.uri,
                    name: fileName,
                    type: "image/" + fileNameExt
                };
                RNS3.put(file, options).then(async function(response) {
                    if (response.status !== 201) {
                        throw new Error("Failed to upload image to S3");
                    }
                    console.log("put fin");

                    let url =
                        awsConfig.rekognitionUrl +
                        "/?filename=" +
                        file.name +
                        "&type=" +
                        fileNameExt;
                    fetch(url)
                        .then(response => response.json())
                        .then(responseJson => {
                            let result = responseJson.body.Labels;
                            result.forEach(function(data) {
                                console.log("Confidence:" + data.Confidence);
                                console.log("Name:" + data.Name);
                                if (data.Name === "Noodle") {
                                    noodleFlg = true;
                                }
                            });
                            if (noodleFlg) {
                                Alert.alert("判別結果", "ラーメン注意");
                            } else {
                                Alert.alert("判別結果", "食べていいよ");
                            }
                        })
                        .catch(error => {
                            console.error(error);
                        });
                });
            } else {
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>ラーメン判定機</Text>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={this._getFile}
                        style={styles.button}
                    >
                        <Text>画像を選択する</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={this._camera}
                        style={styles.button}
                    >
                        <Text>写真を撮影する</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.resultContainer} />
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF"
    },
    textContainer: {
        marginTop: 100,
        marginBottom: 50,
        alignItems: "center",
        backgroundColor: "red"
    },
    title: {
        fontSize: 40
    },
    buttonContainer: {
        flex: 0.4,
        margin: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "blue"
    },
    resultContainer: {
        flex: 0.2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "green"
    },
    button: {
        width: 250,
        height: 100,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "lightgray",
        alignItems: "center",
        justifyContent: "center",
        margin: 3
    }
});
