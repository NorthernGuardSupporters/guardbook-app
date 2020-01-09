import React from 'react';
import {
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { BigButton } from '../components/BigButton';
import { BoldText, RegularText, MediumText } from '../components/StyledText';
import withUnstated from '@airship/with-unstated';
import GlobalDataContainer from '../containers/GlobalDataContainer';
import NavigationOptions from '../config/NavigationOptions';
import { Settings } from '../config/Settings';
import i18n from "../../i18n";

class PostAttach extends React.Component {
    static navigationOptions = {
        header: null
    };

    render() {
        return (
            <ScrollView style={{ flex: 1 }}>
                <BoldText style={{ textAlign: 'center' }}>Attachment Types</BoldText>

                <BigButton
                    label="Select Player" iconName="md-person" inModal={true}
                    onPress={() => {
                        this.props.navigation.navigate("PostAttachmentSelectPlayer", {
                            onAttachmentComplete: this.props.screenProps.onAttachmentComplete
                        })
                    }} />
                <BigButton label="Select Song" iconName="md-musical-notes" inModal={true}
                    onPress={() => {
                        this.props.navigation.navigate("PostAttachmentSelectSong", {
                            onAttachmentComplete: this.props.screenProps.onAttachmentComplete
                        })
                    }} />
                <BigButton label="Compose Song" iconName="md-microphone" inModal={true}
                    onPress={() => {
                        this.props.navigation.navigate("PostAttachmentComposeSong", {
                            onAttachmentComplete: this.props.screenProps.onAttachmentComplete
                        })
                    }} />
                <BigButton label="Tweet the Players" iconName="logo-twitter" inModal={true}
                    onPress={() => {
                        this.props.navigation.navigate("PostAttachmentSelectMassTweet", {
                            onAttachmentComplete: this.props.screenProps.onAttachmentComplete
                        })
                    }} />
                {Settings.CapoHome_GKNicknameEnabled &&
                    <BigButton label="GK Nickname" iconName="md-hand" inModal={true}
                        onPress={() => {
                            this.props.navigation.navigate("PostAttachmentComposeGkNickname", {
                                onAttachmentComplete: this.props.screenProps.onAttachmentComplete
                            })
                        }} />
                }

                <BigButton label="Link to App Songbook" iconName="md-book"
                    style={{ backgroundColor: "gray" }} />
                <BigButton label="Link to App Roster" iconName="md-people"
                    style={{ backgroundColor: "gray" }} />
            </ScrollView>
        )
    }

    onAttachmentComplete = (data) => {
        if (this.onAttachmentComplete)
            this.onAttachmentComplete(data);
    }
}

export default withUnstated(PostAttach, { globalData: GlobalDataContainer });

