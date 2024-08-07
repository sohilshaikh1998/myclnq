import React from 'react';
import { Alert, BackHandler, Dimensions, Keyboard, ScrollView, StyleSheet, Text, TextInput, View, FlatList,I18nManager, } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Actions } from 'react-native-router-flux';
import { AppStyles } from '../../shared/AppStyles';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import { AppColors } from '../../shared/AppColors';
import { SHApiConnector } from '../../network/SHApiConnector';
import { AppUtils } from '../../utils/AppUtils';
import SHButtonDefault from '../../shared/SHButtonDefault';
import ProgressLoader from 'rn-progress-loader';
import CheckBox from 'react-native-check-box';
import { strings } from '../../locales/i18n';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const { width, height } = Dimensions.get('window');
const isRTL = I18nManager.isRTL;
class DeleteFeedback extends React.Component {
  constructor(props) {
    AppUtils.analyticsTracker('Feedback');
    super();
    super(props);
    this.state = {
      message: '',
      isLoading: false,
      feedbackOptions: [],
      selectedItems: [],
    };
  }

  componentDidMount() {
    this.fetchFeedbackOptions();
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.goBack();
      return true;
    });
  }

  goBack() {
    Actions.Settings();
  }

  async fetchFeedbackOptions() {
    this.setState({ isLoading: true });
    try {
      let response = await SHApiConnector.getFeedbackOptions();
      if (response.data.status) {
        this.setState({
          feedbackOptions: response.data.option,
        });
        this.setState({ isLoading: false });
      } else {
        this.setState({ isLoading: false });
        alert("Something went wrong !")
      }
    } catch (error) {
      this.setState({ isLoading: false });
      alert("Something went wrong !");
    }
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
            marginTop: verticalScale(50),
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: AppColors.primaryColor,
              fontFamily: AppStyles.fontFamilyDemi,
              fontSize: moderateScale(18),
              verticalAlign: 'auto',
              textAlign: isRTL ? 'left' : 'auto'

            }}
          >
            {strings('common.common.sorryMsg')}
          </Text>
          <Text
            style={{
              color: AppColors.primaryColor,
              marginTop: 5,
              fontFamily: AppStyles.fontFamilyDemi,
              fontSize: moderateScale(16),
              verticalAlign: 'auto',
              textAlign: isRTL ? 'left' : 'auto'

            }}
          >
            {strings('common.common.deleteFeedback')}
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
                color: AppColors.blackColor2,
                fontSize: 16,
                fontFamily: AppStyles.fontFamilyMedium,
                textAlign: isRTL ? 'left' : 'auto'

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
                    selectedItems: [...this.state.selectedItems, this.state.message]
                })
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
              btnText={strings('doctor.button.cancel')}
              btnType={'border-only'}
              btnTextColor={AppColors.blackColor}
              btnPressBackground={'transparent'}
              style={{ margin: moderateScale(5) }}
              onBtnClick={() => this.cancel()}
            />
            <SHButtonDefault
              btnText={strings('doctor.button.submit')}
              btnType={'normal'}
              style={{ margin: moderateScale(5) }}
              onBtnClick={() => this.sendFeedBack()}
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
          checkBoxColor={AppColors.primaryColor}
          isChecked={this.state.selectedItems.includes(item.item)}
          rightText={item.item}
          rightTextStyle={{
            color: AppColors.greyColor,
            fontSize: 16,
            fontFamily: AppStyles.fontFamilyMedium,
            textAlign: isRTL ? 'left' : 'auto',
          }}
        />
      </View>
    );
  }

  cancel() {
    Actions.pop();
  }


  async sendFeedBack() {
    var self = this;
    const feedbacks = self.state.selectedItems.filter((item) => item !== "");
    console.log("feedbacks", feedbacks);
    let feedbackBody = { feedback: feedbacks };
    try {
        let response = await SHApiConnector.deleteUserWithFeedback(feedbackBody);
        if(response.data.status){
            AppUtils.logout();
            Alert.alert('', response.data.message);
        } else {
            Alert.alert('', response.data.message);
        }
    } catch (error) {
        Alert.alert("", 'Failed to delete account');
    }
  }
}

const styles = StyleSheet.create({
  inputStyle: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 15,
    color: AppColors.blackColor,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.primaryGray,
    textAlign: isRTL ? 'right' : 'auto',
  },
});

export default DeleteFeedback;
