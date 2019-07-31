var AWS = require("aws-sdk");
AWS.region = "ap-northeast-1";
var rekognition = new AWS.Rekognition();

exports.handler = async event => {
    console.log(event);
    var response = {};
    try {
        console.log("start");
        /* code */
        var params = {
            Image: {
                S3Object: {
                    Bucket: "amplifytest2e0cab15d940c4b95bbc35a87b16b6d88-dev",
                    Name: event.filename
                }
            },
            MaxLabels: 10,
            MinConfidence: 90
        };
        console.log("params:" + JSON.stringify(params));
        const data = await rekognition.detectLabels(params).promise();
        response.body = data;
        response.statuscode = 200;
        return response;
    } catch (error) {
        response.body = error;
        response.statuscode = 500;
        return response;
    }
};
