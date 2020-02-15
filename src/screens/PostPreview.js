import React from 'react';
import {
    Clipboard,
    ScrollView,
    StyleSheet,
    View,
    Platform
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { BoldText, RegularText, MediumText } from '../components/StyledText';
import { BigButton } from '../components/BigButton';
import { ModalLoader } from '../components/ModalLoader';
import Post from '../components/Post';
import NavigationOptions from '../config/NavigationOptions';
import withUnstated from '@airship/with-unstated';
import GlobalDataContainer from '../containers/GlobalDataContainer';
import { Skin, DefaultColors } from '../config/Settings';
import { Constants } from 'expo';
import { HeaderBackButton } from 'react-navigation';
import i18n from "../../i18n";
import { createPost } from '../services/feedService';

class PostPreview extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        title: i18n.t('screens.postpreview.title'),
        ...NavigationOptions,
        headerLeft: (
            <HeaderBackButton onPress={() => navigation.goBack()} tintColor="#fff" />
        )
    });

    state = {
        post: null,
        loading: false
    }

    componentDidMount() {
        this.setData();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.globalData.state.currentPostDraft &&
            this.props.globalData.state.currentPostDraft) {
            this.setData();
        }
    }

    setData = () => {
        this.setState({ post: this.props.globalData.state.currentPostDraft });
    }

    render() {
        return (
            <ScrollView style={{ flex: 1 }}>
                <View pointerEvents="none">
                    <Post
                        post={this.state.post}
                        navigation={this.props.navigation} />
                </View>
                <BigButton
                    label={i18n.t('screens.postpreview.submit')}
                    iconName="md-send" iconPosition="right"
                    onPress={this._handlePressSubmitButton} />
                <BigButton
                    style={{ marginBottom: 10, backgroundColor: "gray" }}
                    label={i18n.t('screens.postpreview.schedule')}
                    iconName="md-time" iconPosition="right"
                    onPress={this._handlePressScheduleButton} />

                <ModalLoader loading={this.state.loading} />
            </ScrollView>
        )
    }

    serializeImage = async (image) => {
        let serializedImage = "";

        serializedImage = await FileSystem.readAsStringAsync(image, { encoding: FileSystem.EncodingType.Base64 });

        return serializedImage;
    }

    processImages = async (images) => {
        // do renaming, resizing, compressing, etc from this function, as necessary
        let processedImages = []

        for (let i = 0; i < images.length; i++) {
            let imageToProcess = images[i]
            // this is Collin code that used to live on PostCreate.js, not sure what it does
            imageToProcess.fileName = `IMG_${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`
            
            // convert metadata to top-level props
            imageToProcess.credit = imageToProcess.metadata.credit
            imageToProcess.caption = imageToProcess.metadata.caption
            delete imageToProcess.metadata

            processedImages.push(imageToProcess)
        }

        return processedImages;
    }

    _handlePressSubmitButton = async () => {
        this.setState({ loading: true });

        const data = new FormData();
        const { post } = this.state;

        // publishedAt was set when we started creating the post, and time has elapsed since then
        // update publishedAt to the current time
        const publishedAt = new Date().toISOString();
        post.publishedAt = publishedAt;
        // TODO: check to see if publishedAt is in the future, because we are scheduling it for the future, and don't override

        post.images = await this.processImages(post.images)

        // unnecessary to send this to the server
        delete post.channelData;

        Object.keys(post).forEach(key => {
            if (key == 'sender') {
                const senderInfo = {
                    user: post[key].user || 'test',
                    pushToken: post[key].pushToken || 'teser'
                }
                data.append(key, JSON.stringify(senderInfo))
            } else {
                data.append(key, post[key])
            }
        });
        if (post.images) {
            const { images } = post;
            images.forEach(image => {
                data.append("images", image)
            })
        }
        if (post.attachments) {
            const { attachments } = post;
            attachments.forEach(attach => {
                data.append("attachments", JSON.stringify(attach))
            });
        }

        try {
            console.log("send this to the server")
            console.log(JSON.stringify(data))
            let response = await createPost(data, this.props.globalData.getCurrentUser().token)
            console.log("Response")
            console.log(response);

            this.props.globalData.setResponse(response)

            this.setState({ loading: false });

            this.props.navigation.popToTop();
            this.props.navigation.navigate("Home");
        }
        catch (ex) {
            alert(ex.toString())

            this.setState({ loading: false });
        }
    }
    _handlePressScheduleButton = () => {

    }
}

const styles = StyleSheet.create({

});

export default withUnstated(PostPreview, { globalData: GlobalDataContainer });
