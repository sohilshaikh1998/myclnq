import React from 'react';
import { Alert, BackHandler, Dimensions, Keyboard, ScrollView, StyleSheet, Text, TextInput, View, FlatList, TouchableOpacity } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Actions } from 'react-native-router-flux';
import { AppStyles } from '../../shared/AppStyles';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import { AppColors } from '../../shared/AppColors';
import { SHApiConnector } from '../../network/SHApiConnector';
import SHButtonDefault from '../../shared/SHButtonDefault';
import ProgressLoader from 'rn-progress-loader';
import CheckBox from 'react-native-check-box';
import { strings } from '../../locales/i18n';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width, height } = Dimensions.get('window');

class CancelBooking extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      isLoading: false,
      feedbackOptions: [],
      selectedItems: [],
      requestId: '',
    };
  }

  componentDidMount() {
    console.log('CancelScreenRequestId', this.props.requestId);
    let optionsList = [
      strings('common.waitingRoom.cancelReason1'),
      strings('common.waitingRoom.cancelReason2'),
      strings('common.waitingRoom.cancelReason3'),
      strings('common.waitingRoom.cancelReason4'),
      strings('common.waitingRoom.cancelReason5'),
      strings('common.waitingRoom.cancelReason6'),
      strings('common.waitingRoom.cancelReason7'),
    ];
    this.setState({
      requestId: this.props.requestId,
      feedbackOptions: optionsList,
    });
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.goBack();
      return true;
    });
  }

  goBack() {
    Actions.pop();
  }

  handleCheckboxToggle(item) {
    const { selectedItems } = this.state;
    if (selectedItems.includes(item)) {
      this.setState({
        selectedItems: selectedItems.filter((selectedItem) => selectedItem !== item),
      });
    } else {
      this.setState({
        selectedItems: [...selectedItems, item],
      });
    }
  }

  async sendCancellationFeedBack() {
    var self = this;
    const feedbacks = self.state.selectedItems.filter((item) => item !== '');
    console.log('cancellationFeedbacks', feedbacks);
    let feedbackBody = { cancellationFeedback: feedbacks };
    this.setState({
      isLoading: true,
    });
    try {
      let response = await SHApiConnector.cancelWaitingRoomAppointmentRequest(self.state.requestId, feedbackBody);
      if (response.data.status == 'success') {
        this.setState({
          isLoading: false,
        });
        Alert.alert(strings('common.waitingRoom.requestCancelled'), strings('common.waitingRoom.refundMessage'), [
          {
            text: 'OK',
            onPress: () => Actions.MainScreen(),
          },
        ]);
      } else {
        this.setState({
          isLoading: false,
        });
        alert(strings('common.waitingRoom.somethingWentWrong'));
        Actions.MainScreen();
      }
    } catch (error) {
      this.setState({
        isLoading: false,
      });
      alert(strings('common.waitingRoom.somethingWentWrong'));
    }
  }

  render() {
    const { feedbackOptions } = this.state;
    return (
      <KeyboardAwareScrollView
        style={{
          height: height,
          width: width,
          backgroundColor: AppColors.whiteColor,
        }}
      >
        <View
          style={{
            margin: moderateScale(20),
            marginTop: verticalScale(70),
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: AppColors.blackColor,
              fontFamily: AppStyles.fontFamilyDemi,
              fontSize: moderateScale(18),
              verticalAlign: 'auto',
            }}
          >
            {strings('common.waitingRoom.sorryTextWR')}
          </Text>
          <Text
            style={{
              color: AppColors.greyColor,
              marginTop: 5,
              fontFamily: AppStyles.fontFamilyRegular,
              fontSize: moderateScale(14),
              verticalAlign: 'auto',
            }}
          >
            {strings('common.waitingRoom.improveMsg')}
          </Text>
          <View
            style={{
              flexDirection: 'column',
              marginTop: verticalScale(30),
            }}
          >
            <FlatList
              style={{ width: wp(100) }}
              data={feedbackOptions}
              keyExtractor={(index) => index.toString()}
              renderItem={(item) => this.feedbackItems(item)}
              extraData={this.state}
              showVerticalScrollIndicator={false}
            />
          </View>

          <View style={{ marginTop: verticalScale(20) }}>
            <Text
              style={{
                color: AppColors.blackColor3,
                fontSize: 16,
                fontFamily: AppStyles.fontFamilyMedium,
              }}
            >
              {strings('common.common.others')} {strings('common.common.specify')}
            </Text>
          </View>

          <View style={{ marginTop: verticalScale(10) }}>
            <TextInput
              allowFontScaling={false}
              ref="message"
              placeholder={strings('common.common.description')}
              placeholderTextColor={AppColors.textGray}
              multiline={true}
              style={styles.inputStyle}
              value={this.state.message}
              onChangeText={(input) => this.setState({ message: input })}
              onEndEditing={(input) => {
                this.setState({
                  selectedItems: [...this.state.selectedItems, this.state.message],
                });
              }}
              returnKeyType="done"
              underlineColorAndroid={'white'}
              maxLength={300}
            />
          </View>
          <View
            style={{
              alignSelf: 'center',
              flexDirection: 'row',
              marginTop: verticalScale(50),
            }}
          >
            <SHButtonDefault
              btnText={strings('common.waitingRoom.submit')}
              style={{ marginTop: verticalScale(30), borderRadius: wp(2) }}
              btnTextColor={AppColors.whiteColor}
              btnPressBackground={AppColors.instantVideoTheme}
              onBtnClick={() => this.sendCancellationFeedBack()}
            />
          </View>
          <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
        </View>
      </KeyboardAwareScrollView>
    );
  }

  feedbackItems(item) {
    return (
      <View>
        <CheckBox
          style={{ paddingBottom: 10, paddingTop: 0 }}
          onClick={() => this.handleCheckboxToggle(item.item)}
          checkBoxColor={AppColors.instantVideoTheme}
          isChecked={this.state.selectedItems.includes(item.item)}
          rightText={item.item}
          rightTextStyle={{
            color: AppColors.blackColor3,
            fontSize: 16,
            fontFamily: AppStyles.fontFamilyMedium,
          }}
        />
      </View>
    );
  }

  cancel() {
    Actions.pop();
  }
}

const styles = StyleSheet.create({
  inputStyle: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 15,
    color: AppColors.blackColor,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primaryGray,
  },
});

export default CancelBooking;
