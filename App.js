/* @flow */
import React, { Component } from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";
import DropDownPicker, {
  DropDownPickerProps,
} from "react-native-dropdown-picker";
import { Input, Button } from "@rneui/base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import init from "react_native_mqtt";

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync: {},
});
const options = {
  host: "broker.emqx.io",
  port: 8083,
  path: "/testTopic",
  id: "id_" + parseInt(Math.random() * 100000),
};
// 创建客户端实例
client = new Paho.MQTT.Client(options.host, options.port, options.path);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      topic: "testTopic",
      subscribedTopic: "",
      message: "",
      messageList: [],
      status: "",
      open: false,
      value: null,
      items: [
        { label: "Station0", value: "Station0" },
        { label: "Station1", value: "Station1" },
        { label: "Station2", value: "Station2" },
        { label: "Station3", value: "Station3" },
        { label: "Station4", value: "Station4" },
        { label: "Station5", value: "Station5" },
        { label: "Station6", value: "Station6" },
        { label: "Station7", value: "Station7" },
        { label: "Station8", value: "Station8" },
        { label: "Station9", value: "Station9" },
      ],
    };
    client.onConnectionLost = this.onConnectionLost;
    client.onMessageArrived = this.onMessageArrived;
  }
  // 连接成功

  setOpen = (open) => {
    this.setState({ open: open });
  };
  setValue = (callback) => {
    this.setState({ value: callback });
  };
  onConnect = () => {
    console.log("onConnect");
    this.setState({ status: "connected" });
  };
  // 连接失败
  onFailure = (err) => {
    console.log("Connect failed!");
    console.log(err);
    this.setState({ status: "failed" });
  };
  // 连接 MQTT 服务器
  connect = () => {
    this.setState({ status: "isFetching" }, () => {
      client.connect({
        onSuccess: this.onConnect,
        useSSL: false,
        timeout: 3,
        onFailure: this.onFailure,
      });
    });
  };
  // 连接丢失
  onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:" + responseObject.errorMessage);
    }
  };
  // 收到消息
  onMessageArrived = (message) => {
    console.log("onMessageArrived:" + message.payloadString);
    newmessageList = this.state.messageList;
    newmessageList.unshift(message.payloadString);
    this.setState({ messageList: newmessageList });
    // this.MessageListRef.scrollToEnd({animated: false});
  };
  onChangeTopic = (text) => {
    this.setState({ topic: text });
  };
  // 主题订阅
  subscribeTopic = () => {
    this.setState({ subscribedTopic: this.state.topic }, () => {
      client.subscribe(this.state.subscribedTopic, { qos: 0 });
    });
  };
  // 取消订阅
  unSubscribeTopic = () => {
    client.unsubscribe(this.state.subscribedTopic);
    this.setState({ subscribedTopic: "" });
  };
  onChangeMessage = (text) => {
    this.setState({ message: text });
  };
  // 消息发布
  sendMessage = () => {
    var message = new Paho.MQTT.Message(options.id + ":" + this.state.value);
    message.destinationName = this.state.subscribedTopic;
    client.send(message);
  };
  renderRow = ({ item, index }) => {
    idMessage = item.split(":");
    // console.log(">>>ITEM", item);
    return (
      <View
        style={[
          styles.componentMessage,
          idMessage[0] == options.id
            ? styles.myMessageComponent
            : idMessage.length == 1
            ? styles.introMessage
            : styles.messageComponent,
        ]}
      >
        <Text
          style={idMessage.length == 1 ? styles.textIntro : styles.textMessage}
        >
          {item}
        </Text>
      </View>
    );
  };
  _keyExtractor = (item, index) => item + index;
  render() {
    const { status, messageList } = this.state;
    return (
      <View style={styles.container}>
        <Text
          style={{
            margin: 16,
            textAlignVertical: "center",
            fontSize: 24,
          }}
        >
          <Image
            source={require("./icon.png")}
            style={{ width: 36, height: 36 }}
          />
          NCT Robotik
        </Text>
        <Text
          style={{
            marginBottom: 50,
            textAlign: "center",
            color: this.state.status === "connected" ? "green" : "black",
          }}
        >
          ClientID: {options.id}
        </Text>
        {this.state.status === "connected" ? (
          <View>
            <Button
              type="solid"
              title="DISCONNECT"
              onPress={() => {
                client.disconnect();
                this.setState({ status: "", subscribedTopic: "" });
              }}
              buttonStyle={{ marginBottom: 50, backgroundColor: "#397af8" }}
              icon={{
                name: "lan-disconnect",
                type: "material-community",
                color: "white",
              }}
            />
            <View style={{ marginBottom: 30, alignItems: "center" }}>
              <Input
                label="TOPIC"
                placeholder=""
                value={this.state.topic}
                onChangeText={this.onChangeTopic}
                disabled={this.state.subscribedTopic}
              />

              {this.state.subscribedTopic ? (
                <Button
                  type="solid"
                  title="UNSUBSCRIBE"
                  onPress={this.unSubscribeTopic}
                  buttonStyle={{ backgroundColor: "#397af8" }}
                  icon={{
                    name: "link-variant-off",
                    type: "material-community",
                    color: "white",
                  }}
                />
              ) : (
                <Button
                  type="solid"
                  title="SUBSCRIBE"
                  onPress={this.subscribeTopic}
                  buttonStyle={{ backgroundColor: "#397af8" }}
                  icon={{
                    name: "link-variant",
                    type: "material-community",
                    color: "white",
                  }}
                  disabled={
                    !this.state.topic || this.state.topic.match(/ /)
                      ? true
                      : false
                  }
                />
              )}
            </View>
            {this.state.subscribedTopic ? (
              <View
                style={{
                  height: 250,
                  margin: 16,
                  alignItems: "center",
                }}
              >
                {/* <Input
                  label="MESSAGE"
                  placeholder=""
                  value={this.state.message}
                  onChangeText={this.onChangeMessage}
                /> */}
                <DropDownPicker
                  maxHeight={150}
                  containerStyle={styles.dropDownContainer}
                  textStyle={{ fontSize: 15 }}
                  labelStyle={{ fontWeight: "bold" }}
                  open={this.state.open}
                  items={this.state.items}
                  setOpen={this.setOpen}
                  value={this.state.value}
                  onSelectItem={(item) => {
                    this.setValue(item.value);
                  }}
                />
                {!this.state.open ? (
                  <View
                    style={{
                      marginBottom: 2,
                      alignItems: "center",
                    }}
                  >
                    <Button
                      type="solid"
                      title="SEND"
                      onPress={this.sendMessage}
                      buttonStyle={{
                        backgroundColor:
                          status === "failed" ? "red" : "#397af8",
                      }}
                      icon={{ name: "send", color: "white" }}
                      disabled={this.state.value != null ? false : true}
                    />
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : (
          <Button
            type="solid"
            title="CONNECT"
            onPress={this.connect}
            buttonStyle={{
              marginBottom: 50,
              backgroundColor: status === "failed" ? "red" : "#397af8",
            }}
            icon={{
              name: "lan-connect",
              type: "material-community",
              color: "white",
            }}
            loading={status === "isFetching" ? true : false}
            disabled={status === "isFetching" ? true : false}
          />
        )}
        <View style={styles.messageBox}>
          <FlatList
            ref={(ref) => (this.MessageListRef = ref)}
            data={messageList}
            renderItem={this.renderRow}
            keyExtractor={this._keyExtractor}
            extraData={this.state}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  messageBox: {
    margin: 16,
    flex: 1,
  },
  myMessageComponent: {
    backgroundColor: "#000000",
    borderRadius: 3,
    padding: 5,
    marginBottom: 5,
  },
  messageComponent: {
    marginBottom: 5,
    backgroundColor: "#0075e2",
    padding: 5,
    borderRadius: 3,
  },
  introMessage: {},
  textInput: {
    height: 40,
    margin: 5,
    borderWidth: 1,
    padding: 5,
  },
  textIntro: {
    color: "black",
    fontSize: 12,
  },
  textMessage: {
    color: "white",
    fontSize: 16,
  },
  dropDownContainer: {
    marginBottom: 8,
  },
});

export default App;
