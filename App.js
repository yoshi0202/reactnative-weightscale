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
    constructor(props) {
        super(props);
        this.state = {
            result: ""
        };
    }
    _putS3 = async (filePath, params) => {
        return new Promise(function(res, rej) {
            const options = {
                keyPrefix: "",
                bucket: awsConfig.bucket,
                region: awsConfig.region,
                accessKey: awsConfig.accessKey,
                secretKey: awsConfig.secretKey,
                successActionStatus: 201
            };
            const file = {
                uri: filePath,
                name: params.fileName,
                type: "image/" + params.fileNameExt
            };
            RNS3.put(file, options).then(async function(response) {
                if (response.status !== 201) {
                    rej("Failed to upload image to S3");
                }
                console.log("put fin");
                res("");
            });
        });
    };
    _requestRekognition = params => {
        let noodleFlg = false;
        let url =
            awsConfig.rekognitionUrl +
            "/?filename=" +
            params.fileName +
            "&type=" +
            params.fileNameExt;
        return new Promise(function(res, rej) {
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
                    console.log("detect fin");
                    res(noodleFlg);
                })
                .catch(error => {
                    rej(error);
                });
        });
    };
    _parseFileName = param => {
        //配列形式に変換して最後を取得
        let fileName = param.uri.split("/").pop();
        //拡張子を取得
        let fileNameExt = fileName.split(".").pop();
        let parseParams = {
            fileName: fileName,
            fileNameExt: fileNameExt
        };
        console.log(parseParams);
        return parseParams;
    };
    _checkNoodle = async result => {
        let fileParams = this._parseFileName(result);
        await this._putS3(result.uri, fileParams);
        let isNoodle = await this._requestRekognition(fileParams);
        if (isNoodle) {
            Alert.alert("判別結果", "ラーメン注意");
            this.setState({
                result: "これはラーメンです"
            });
        } else {
            Alert.alert("判別結果", "食べていいよ");
            this.setState({
                result: "これはラーメンではありません"
            });
        }
    };
    _launchCamera = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync();
            if (!result.cancelled) {
                this._checkNoodle(result);
            } else {
                console.log(error);
            }
        } catch (error) {
            console.log(error);
        }
    };
    _getFile = async () => {
        try {
            let options = {
                mediaTypes: ImagePicker.MediaTypeOptions.All
            };
            let result = await ImagePicker.launchImageLibraryAsync(options);
            if (!result.cancelled) {
                console.log(result);
                this._checkNoodle(result);
            } else {
                console.log(result);
            }
        } catch (error) {
            console.log(error);
        }
    };

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>ラーメン判定機</Text>
                    <Image
                        style={{ width: 150, height: 150, marginTop: 20 }}
                        source={require("./assets/20181017193448.jpg")}
                    />
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
                        onPress={this._launchCamera}
                        style={styles.button}
                    >
                        <Text>写真を撮影する</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>{this.state.result}</Text>
                </View>
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
        alignItems: "center"
        // backgroundColor: "red"
    },
    title: {
        fontSize: 40
    },
    buttonContainer: {
        flex: 0.4,
        margin: 20,
        alignItems: "center",
        justifyContent: "center"
        // backgroundColor: "blue"
    },
    resultContainer: {
        flex: 0.2,
        alignItems: "center",
        justifyContent: "center"
        // backgroundColor: "green"
    },
    resultText: {
        fontSize: 20,
        color: "red"
    },
    button: {
        width: 250,
        height: 50,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "lightgray",
        alignItems: "center",
        justifyContent: "center",
        margin: 3
    }
});
